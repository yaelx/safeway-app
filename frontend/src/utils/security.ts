import { decode } from "@msgpack/msgpack";

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // bytes

/**
 *  both sides run identical HKDF derivation from timeKey + SECRET_SALT → same 256-bit AES key
 */
async function deriveKey(timeKey: string): Promise<CryptoKey> {
  const secretSalt = import.meta.env.SECRET_SALT ?? "";
  console.log("🔑 SALT present:", secretSalt.length > 0);
  console.log("🔑 timeKey:", timeKey);
  const rawKey = new TextEncoder().encode(timeKey + secretSalt);

  // Import the raw material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "HKDF" },
    false,
    ["deriveKey"],
  );

  // Derive the actual AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode(secretSalt),
      info: new TextEncoder().encode("payload-encryption"),
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["decrypt"],
  );
}

/**
 * slices off the first 12 bytes as IV, decrypts the rest; throws automatically if tampered
 * Core decrypt — expects: [12-byte IV][ciphertext+16-byte tag]
 */
async function decryptBytes(
  encrypted: Uint8Array,
  timeKey: string,
): Promise<Uint8Array> {
  const iv = encrypted.slice(0, IV_LENGTH);
  const ciphertext = encrypted.slice(IV_LENGTH);

  const key = await deriveKey(timeKey);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext,
  );

  return new Uint8Array(decrypted);
}

export async function decodeSecurePayload(
  base64Data: string,
  timeKey: string,
): Promise<any> {
  // 1. Base64 → Uint8Array
  const binaryString = atob(base64Data);
  const encrypted = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    encrypted[i] = binaryString.charCodeAt(i);
  }

  // 2. Decrypt (throws if tampered)
  const decryptedBytes = await decryptBytes(encrypted, timeKey);

  // 3. MessagePack → object
  return decode(decryptedBytes);
}

// For POST responses — reads binary body + X-Key-Time header
export async function decodeHttpResponse(response: Response): Promise<any> {
  const timeKey = response.headers.get("X-Key-Time");
  console.log("📦 X-Key-Time header:", timeKey);
  if (!timeKey) throw new Error("Missing X-Key-Time header");

  const buffer = await response.arrayBuffer();
  console.log("📦 Response buffer size:", buffer.byteLength, "bytes");
  const encrypted = new Uint8Array(buffer); // already aligned, no base64 needed
  console.log("📦 IV (first 12 bytes):", encrypted.slice(0, 12));

  try {
    const decryptedBytes = await decryptBytes(encrypted, timeKey);
    console.log("✅ Decrypted size:", decryptedBytes.byteLength, "bytes");
    const result = decode(decryptedBytes);
    console.log(
      "✅ Decoded:",
      Array.isArray(result)
        ? `Array[${result.length}]`
        : Object.keys(result as any),
    );
    return result;
  } catch (e) {
    console.error("❌ Decryption failed. timeKey was:", timeKey);
    console.error("❌ Buffer size was:", buffer.byteLength);
    console.error("❌ Error:", e);
    throw e;
  }
}

// For Ably messages — timeKey is embedded in the payload (no HTTP headers available)
export async function decodeAblyMessage(msg: {
  data: string;
  timeKey: string;
}): Promise<any> {
  return decodeSecurePayload(msg.data, msg.timeKey);
}
