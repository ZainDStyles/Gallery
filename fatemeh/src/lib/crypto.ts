import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, hkdfSync, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "./env";

/**
 * One master key (ENCRYPTION_KEY) is stretched into separate sub-keys with HKDF,
 * so a key used for one purpose can never decrypt data from another.
 */
type KeyPurpose = "photos" | "totp" | "ip-hash";
const keyCache = new Map<KeyPurpose, Buffer>();

function subKey(purpose: KeyPurpose): Buffer {
  const hit = keyCache.get(purpose);
  if (hit) return hit;
  const master = Buffer.from(env().ENCRYPTION_KEY, "base64");
  const key = Buffer.from(hkdfSync("sha256", master, Buffer.from("fatemeh.v1"), Buffer.from(purpose), 32));
  keyCache.set(purpose, key);
  return key;
}

const VERSION = 1;

/**
 * AES-256-GCM. Output layout: [version:1][iv:12][tag:16][ciphertext].
 * `aad` binds the ciphertext to its context (e.g. its storage key), so an
 * encrypted file cannot be swapped for another one without detection.
 */
export function encrypt(plain: Buffer, purpose: KeyPurpose, aad: string): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", subKey(purpose), iv);
  cipher.setAAD(Buffer.from(aad));
  const body = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([Buffer.from([VERSION]), iv, cipher.getAuthTag(), body]);
}

export function decrypt(blob: Buffer, purpose: KeyPurpose, aad: string): Buffer {
  if (blob.length < 29 || blob[0] !== VERSION) throw new Error("Unsupported encrypted payload");
  const iv = blob.subarray(1, 13);
  const tag = blob.subarray(13, 29);
  const decipher = createDecipheriv("aes-256-gcm", subKey(purpose), iv);
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(blob.subarray(29)), decipher.final()]);
}

export const encryptString = (value: string, purpose: KeyPurpose, aad: string) =>
  encrypt(Buffer.from(value, "utf8"), purpose, aad).toString("base64");

export const decryptString = (value: string, purpose: KeyPurpose, aad: string) =>
  decrypt(Buffer.from(value, "base64"), purpose, aad).toString("utf8");

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/** Keyed hash for IP addresses: lets us rate-limit without storing the IP. */
export const hashIp = (ip: string) => createHmac("sha256", subKey("ip-hash")).update(ip).digest("hex").slice(0, 32);

export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

// No 0/O, 1/I/L — easy to read out over the phone.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function humanReference(prefix: string): string {
  const pick = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `${prefix}-${pick()}-${pick()}`;
}
