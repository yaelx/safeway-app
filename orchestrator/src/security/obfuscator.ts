import { encode } from "@msgpack/msgpack";
import { Response } from "express";
import { webcrypto } from "crypto";

const { subtle } = webcrypto;
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // bytes

// Derives a 256-bit AES key from timeKey + SECRET_SALT using HKDF — mirrors frontend exactly
async function deriveKey(timeKey: string, usage: KeyUsage): Promise<CryptoKey> {
  const secretSalt = process.env.SECRET_SALT ?? "";
  const rawKey = new TextEncoder().encode(timeKey + secretSalt);

  const keyMaterial = await subtle.importKey(
    "raw",
    rawKey,
    { name: "HKDF" },
    false,
    ["deriveKey"],
  );

  return subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode(secretSalt),
      info: new TextEncoder().encode("payload-encryption"),
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    [usage],
  );
}

/**
 * 1. generates a fresh random 12-byte IV per request
 * 2. encrypts the data using AES-GCM with the derived key
 * returns: [12-byte IV][ciphertext+16-byte tag]
 */
async function encryptBytes(
  data: Uint8Array,
  timeKey: string,
): Promise<Uint8Array> {
  const iv = webcrypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(timeKey, "encrypt");

  const ciphertext = await subtle.encrypt({ name: ALGORITHM, iv }, key, data);

  // Prepend IV so the frontend can extract it
  const result = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), IV_LENGTH);
  return result;
}

export async function securePayload(
  data: any,
): Promise<{ securedData: Uint8Array; timeKey: string }> {
  const encoded = encode(data); // MessagePack
  const timeKey = Math.floor(Date.now() / 60000).toString();
  const securedData = await encryptBytes(new Uint8Array(encoded), timeKey);
  return { securedData, timeKey };
}

// For POST — sends binary over HTTP, timeKey in header
export const sendSecureResponse = async (
  res: Response,
  data: any,
): Promise<void> => {
  const { securedData, timeKey } = await securePayload(data);
  res.setHeader("X-Key-Time", timeKey);
  res.setHeader("Content-Type", "application/octet-stream");
  res.send(Buffer.from(securedData));
};

// For Ably — timeKey travels with the payload since there are no HTTP headers
export async function buildAblyMessage(
  data: any,
): Promise<{ data: string; timeKey: string }> {
  const { securedData, timeKey } = await securePayload(data);
  const base64 = Buffer.from(securedData).toString("base64");
  return { data: base64, timeKey };
}
