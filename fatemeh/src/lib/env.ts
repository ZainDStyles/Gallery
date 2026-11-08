import "server-only";
import { z } from "zod";

/**
 * Server-side configuration, validated once on first use.
 * Every variable is documented in `.env.example`.
 */
const bool = (fallback: boolean) =>
  z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => (v === undefined ? fallback : v === "true" || v === "1"));

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

    // 32 random bytes, base64. Generate with: openssl rand -base64 32
    ENCRYPTION_KEY: z
      .string()
      .min(1, "ENCRYPTION_KEY is required (openssl rand -base64 32)")
      .refine((v) => Buffer.from(v, "base64").length === 32, "ENCRYPTION_KEY must decode to exactly 32 bytes"),

    STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
    LOCAL_STORAGE_DIR: z.string().default(".private-storage"),
    S3_BUCKET: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_ENDPOINT: z.string().url().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_FORCE_PATH_STYLE: bool(false),

    EMAIL_PROVIDER: z.enum(["console", "resend", "smtp"]).default("console"),
    EMAIL_FROM: z.string().default("Fatemeh Website <no-reply@example.com>"),
    NOTIFY_EMAIL: z.string().email().optional(),
    RESEND_API_KEY: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SEND_PATIENT_CONFIRMATION: bool(true),

    CRON_SECRET: z.string().min(16).optional(),
    RETENTION_MONTHS: z.coerce.number().int().min(1).max(120).default(12),
    CONTACT_RETENTION_MONTHS: z.coerce.number().int().min(1).max(120).default(6),
    AUDIT_RETENTION_MONTHS: z.coerce.number().int().min(6).max(120).default(24),

    REQUIRE_2FA: bool(true),
    PAYMENTS_ENABLED: bool(false),
    MAX_UPLOAD_MB: z.coerce.number().min(1).max(25).default(12),
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_DRIVER === "s3") {
      for (const key of ["S3_BUCKET", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"] as const) {
        if (!env[key]) ctx.addIssue({ code: "custom", path: [key], message: `${key} is required when STORAGE_DRIVER=s3` });
      }
    }
    if (env.EMAIL_PROVIDER === "resend" && !env.RESEND_API_KEY) {
      ctx.addIssue({ code: "custom", path: ["RESEND_API_KEY"], message: "RESEND_API_KEY is required when EMAIL_PROVIDER=resend" });
    }
    if (env.EMAIL_PROVIDER === "smtp" && !env.SMTP_HOST) {
      ctx.addIssue({ code: "custom", path: ["SMTP_HOST"], message: "SMTP_HOST is required when EMAIL_PROVIDER=smtp" });
    }
  });

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid server configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** Public base URL, without a trailing slash. */
export function appUrl(): string {
  const e = env();
  return (e.APP_URL ?? e.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export const isProduction = () => env().NODE_ENV === "production";
