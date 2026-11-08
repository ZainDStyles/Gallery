import "server-only";
import { Secret, TOTP } from "otpauth";
import QRCode from "qrcode";
import { decryptString, encryptString } from "../crypto";

const ISSUER = "Fatemeh Admin";

function build(secretBase32: string, label: string) {
  return new TOTP({ issuer: ISSUER, label, algorithm: "SHA1", digits: 6, period: 30, secret: Secret.fromBase32(secretBase32) });
}

export function newTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

export const sealTotpSecret = (secret: string, userId: string) => encryptString(secret, "totp", userId);
export const openTotpSecret = (sealed: string, userId: string) => decryptString(sealed, "totp", userId);

export async function totpQrDataUrl(secret: string, email: string) {
  const uri = build(secret, email).toString();
  return { uri, qr: await QRCode.toDataURL(uri, { margin: 1, width: 220, color: { dark: "#1c1b19", light: "#fbf8f3" } }) };
}

/**
 * Returns the 30-second step the code belongs to, or null if invalid.
 * Callers store the step and reject any code at or before it (no replay).
 */
export function checkTotp(secret: string, email: string, code: string, lastStep: number | null): number | null {
  const clean = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return null;
  const delta = build(secret, email).validate({ token: clean, window: 1 });
  if (delta === null) return null;
  const step = Math.floor(Date.now() / 30000) + delta;
  if (lastStep !== null && step <= lastStep) return null;
  return step;
}
