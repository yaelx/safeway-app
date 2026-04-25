import { decode } from "@msgpack/msgpack";

/**
 * Optimized XOR de-obfuscator using 32-bit chunks
 */
function fastXor(data: Uint8Array, key: Uint8Array): Uint8Array {
  // Use Uint32Array for 4-byte chunk processing
  const len4 = Math.floor(data.length / 4);
  const data32 = new Uint32Array(data.buffer, data.byteOffset, len4);
  const key32 = new Uint32Array(
    key.buffer,
    key.byteOffset,
    Math.floor(key.length / 4),
  );

  for (let i = 0; i < data32.length; i++) {
    // XOR on 32-bit chunks using standard Numbers
    data32[i] = data32[i] ^ key32[i % key32.length];
  }

  // Handle remaining bytes
  for (let i = len4 * 4; i < data.length; i++) {
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

  // 3. De-obfuscate (Creates a new buffer copy to avoid modifying the original)
  const bytesCopy = new Uint8Array(bytes);
  const decodedBytes = fastXor(bytesCopy, key);

  // 4. Decode MessagePack back to JSON
  return decode(decodedBytes);
}
