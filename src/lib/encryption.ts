/**
 * Client-Side AES-GCM Encryption / Decryption Utilities
 * Uses the Web Crypto API (SubtleCrypto) native to all modern browsers.
 * Derives a 256-bit AES-GCM key from the user's password + salt using PBKDF2 (100,000 iterations).
 */

// Convert BufferSource to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive AES-GCM Key from password & salt
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt any plain text string (JSON string or dataURL) with a password
 * Returns payload: "saltBase64:ivBase64:ciphertextBase64"
 */
export async function encryptData(plainText: string, password: string): Promise<string> {
  if (typeof window === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto API is not available.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const enc = new TextEncoder();
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as any },
    key,
    enc.encode(plainText)
  );

  const saltB64 = arrayBufferToBase64(salt.buffer);
  const ivB64 = arrayBufferToBase64(iv.buffer);
  const cipherB64 = arrayBufferToBase64(encryptedBuffer);

  return `${saltB64}:${ivB64}:${cipherB64}`;
}

/**
 * Decrypt ciphertext with a password
 * Throws an error if the password is incorrect or ciphertext has been altered
 */
export async function decryptData(cipherPayload: string, password: string): Promise<string> {
  if (typeof window === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto API is not available.");
  }

  const parts = cipherPayload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format.");
  }

  const salt = base64ToUint8Array(parts[0]);
  const iv = base64ToUint8Array(parts[1]);
  const cipherBytes = base64ToUint8Array(parts[2]);

  const key = await deriveKey(password, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as any },
      key,
      cipherBytes as any
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (e) {
    throw new Error("Decryption failed. Incorrect password or corrupted data.");
  }
}
