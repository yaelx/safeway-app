import { encode } from "@msgpack/msgpack";
import { Response } from "express";

/**
 * Optimized XOR using 64-bit chunks
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
    // Bitwise XOR on 32-bit chunks works natively with Numbers
    data32[i] = data32[i] ^ key32[i % key32.length];
  }

  // Handle remaining bytes (less than 4)
  for (let i = len4 * 4; i < data.length; i++) {
    data[i] = data[i] ^ key[i % key.length];
  }
  return data;
}

export function securePayload(data: any) {
  const encoded = encode(data);

  const timeKey = Math.floor(Date.now() / 60000).toString();
  const secretSalt = process.env.SECRET_SALT || "";
  const key = new TextEncoder().encode(timeKey + secretSalt);

  // We must create a copy so we don't mutate the underlying buffer of 'encoded' directly if it's shared
  const dataCopy = new Uint8Array(encoded);
  const securedData = fastXor(dataCopy, key);

  return { securedData, timeKey };
}

export const sendSecureResponse = (res: Response, data: any) => {
  const { securedData, timeKey } = securePayload(data);
  res.setHeader("X-Key-Time", timeKey);
  res.setHeader("Content-Type", "application/octet-stream");
  res.send(Buffer.from(securedData));
};
