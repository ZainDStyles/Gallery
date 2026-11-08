import "server-only";
import { hash, verify } from "@node-rs/argon2";

// OWASP-recommended Argon2id settings (19 MiB, 2 iterations).
const OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export const hashPassword = (password: string) => hash(password, OPTIONS);

// Used when the email does not exist, so a failed login takes the same time
// whether or not the account exists.
let dummyHash: Promise<string> | null = null;

export async function verifyPassword(passwordHash: string | null, password: string): Promise<boolean> {
  if (!passwordHash) {
    dummyHash ??= hashPassword("not-a-real-password-placeholder");
    await verify(await dummyHash, password).catch(() => false);
    return false;
  }
  return verify(passwordHash, password).catch(() => false);
}

export function passwordProblem(password: string): string | null {
  if (password.length < 12) return "Use at least 12 characters.";
  if (password.length > 200) return "That password is too long.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9\W_]/.test(password)) return "Mix letters with numbers or symbols.";
  return null;
}
