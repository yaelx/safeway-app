// Quick test script: node test-security.js
const { encode, decode } = require("@msgpack/msgpack");

// --- MOCKING THE SERVER LOGIC ---
const SECRET_SALT = "6e15f22bb36c1cb30f9ab17a233035ff";

function fastXor(data, key) {
  for (let i = 0; i < data.length; i++) {
    data[i] = data[i] ^ key[i % key.length];
  }
  return data;
}

function serverSecure(data) {
  const encoded = encode(data);
  const timeKey = "12345678"; // Mock time
  const key = new TextEncoder().encode(timeKey + SECRET_SALT);
  const securedData = fastXor(new Uint8Array(encoded), key);
  return { securedData, timeKey };
}

// --- MOCKING THE CLIENT LOGIC ---
function clientDecode(securedData, timeKey) {
  const key = new TextEncoder().encode(timeKey + SECRET_SALT);
  const decodedBytes = fastXor(new Uint8Array(securedData), key);
  return decode(decodedBytes);
}

// --- EXECUTION ---
const originalData = { shelters: [{ id: 1, lat: 32.8, lng: 35.0 }] };
console.log("Original:", originalData);

// 1. Server side
const { securedData, timeKey } = serverSecure(originalData);
console.log("Secured (Buffer):", securedData);

// 2. Client side
const result = clientDecode(securedData, timeKey);
console.log("Decoded:", result);

// 3. Verification
const success = JSON.stringify(originalData) === JSON.stringify(result);
console.log("\n--- TEST " + (success ? "PASSED" : "FAILED") + " ---");
