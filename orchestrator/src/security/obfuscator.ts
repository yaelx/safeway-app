import { encode } from "@msgpack/msgpack";
import { Response } from "express";

/**
 * Optimized XOR using 64-bit chunks
 */
function fastXor(data: Uint8Array, key: Uint8Array): Uint8Array {
  const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const keyView = new DataView(key.buffer, key.byteOffset, key.byteLength);

  // Using BigUint64Array to work with 8 bytes at a time
  const len8 = Math.floor(data.length / 8);
  const data64 = new BigUint64Array(data.buffer, data.byteOffset, len8);
  const key64 = new BigUint64Array(
    key.buffer,
    key.byteOffset,
    Math.floor(key.length / 8),
  );

  for (let i = 0; i < data64.length; i++) {
    data64[i] = data64[i] ^ key64[i % key64.length];
  }

  // Handle remaining bytes
  for (let i = len8 * 8; i < data.length; i++) {
    data[i] = data[i] ^ key[i % key.length];
  }
  return data;
}

export function securePayload(data: any) {
  const encoded = encode(data);

  const timeKey = Math.floor(Date.now() / 60000).toString();
  const secretSalt = process.env.SECRET_SALT || "";
  const key = new TextEncoder().encode(timeKey + secretSalt);

  const securedData = fastXor(new Uint8Array(encoded), key);

  return { securedData, timeKey };
}

export const sendSecureResponse = (res: Response, data: any) => {
  const { securedData, timeKey } = securePayload(data);
  res.setHeader("X-Key-Time", timeKey);
  res.setHeader("Content-Type", "application/octet-stream");
  res.send(Buffer.from(securedData));
};
