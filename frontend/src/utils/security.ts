import { decode } from "@msgpack/msgpack";

/**
 * Optimized XOR de-obfuscator using BigUint64Array for 64-bit chunks
 */
function fastXor(data: Uint8Array, key: Uint8Array): Uint8Array {
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

  for (let i = len8 * 8; i < data.length; i++) {
    data[i] = data[i] ^ key[i % key.length];
  }
  return data;
}

export function decodeSecurePayload(base64Data: string, timeKey: string): any {
  // 1. Convert Base64 string to Uint8Array
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 2. Reconstruct the key (Must match the salt used in the backend)
  const secretSalt = import.meta.env.SECRET_SALT || "";
  const key = new TextEncoder().encode(timeKey + secretSalt);

  // 3. De-obfuscate
  const decodedBytes = fastXor(bytes, key);

  // 4. Decode MessagePack back to JSON
  return decode(decodedBytes);
}
