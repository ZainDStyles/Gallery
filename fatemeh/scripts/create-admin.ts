/**
 * Creates (or resets) a dashboard account. There is no public sign-up.
 *
 *   npm run admin:create -- --email fatemeh@clinic.com --name "Fatemeh" --owner
 *   npm run admin:create -- --email fatemeh@clinic.com --reset      (new password + new 2FA)
 *
 * You'll be asked for a password, then shown a QR code to scan with an
 * authenticator app. The account only works once 2FA is confirmed.
 */
import "dotenv/config";
import { createInterface } from "node:readline";
import QRCode from "qrcode";
import { db } from "../src/lib/db";
import { hashPassword, passwordProblem } from "../src/lib/auth/password";
import { checkTotp, newTotpSecret, sealTotpSecret, totpQrDataUrl } from "../src/lib/auth/totp";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const value = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput.bind(rl);
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => write(s.startsWith(question) ? s : s.replace(/[^\r\n]/g, "•"));
  }
  return new Promise((resolve) => rl.question(question, (a) => (rl.close(), resolve(a.trim()))));
}

async function main() {
  const email = (value("email") ?? (await ask("Email: "))).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("That doesn't look like an email address.");
  const existing = await db().adminUser.findUnique({ where: { email } });
  if (existing && !flag("reset")) throw new Error(`${email} already exists. Use --reset to set a new password and 2FA.`);

  const name = existing?.name ?? value("name") ?? (await ask("Name: "));
  let password = process.env.ADMIN_PASSWORD ?? "";
  if (!password) {
    password = await ask("Password (12+ characters): ", true);
    if (password !== (await ask("Repeat password: ", true))) throw new Error("Passwords didn't match.");
  }
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);

  const data = { name, passwordHash: await hashPassword(password), failedLogins: 0, lockedUntil: null, totpSecretEnc: null, totpEnabledAt: null, totpLastStep: null };
  const user = existing
    ? await db().adminUser.update({ where: { id: existing.id }, data })
    : await db().adminUser.create({ data: { ...data, email, role: flag("owner") ? "OWNER" : "STAFF" } });
  if (existing) await db().adminSession.deleteMany({ where: { userId: user.id } });

  const secret = newTotpSecret();
  await db().adminUser.update({ where: { id: user.id }, data: { totpSecretEnc: sealTotpSecret(secret, user.id) } });
  const { uri } = await totpQrDataUrl(secret, email);

  if (flag("print-secret-for-tests")) {
    console.log(`TOTP_SECRET=${secret}`);
  } else {
    console.log("\nScan this with your authenticator app:\n");
    console.log(await QRCode.toString(uri, { type: "terminal", small: true }));
    console.log(`Or enter this key manually: ${secret}\n`);
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = await ask("Enter the 6-digit code from the app: ");
      if (checkTotp(secret, email, code, null) !== null) break;
      if (attempt === 2) throw new Error("Codes didn't match. Run the command again with --reset.");
      console.log("That code didn't match, try again.");
    }
  }
  await db().adminUser.update({ where: { id: user.id }, data: { totpEnabledAt: new Date() } });
  console.log(`\n✓ ${existing ? "Reset" : "Created"} ${user.role === "OWNER" ? "owner" : "staff"} account for ${email} with two-factor authentication.`);
}

main()
  .catch((e) => {
    console.error(`\n✗ ${e instanceof Error ? e.message : e}`);
    process.exitCode = 1;
  })
  .finally(() => db().$disconnect());
