import "server-only";
import { db } from "./db";

/**
 * Fixed-window rate limiter stored in Postgres, so it works across
 * serverless instances without needing Redis. Traffic on a clinic site is
 * low enough that one upsert per request is cheap.
 */
export async function rateLimit(bucket: string, id: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = `${bucket}:${id}`;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  const rows = await db().$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "windowStart")
    VALUES (${key}, 1, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."windowStart" < ${windowStart} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "windowStart" = CASE WHEN "RateLimit"."windowStart" < ${windowStart} THEN ${now} ELSE "RateLimit"."windowStart" END
    RETURNING "count"`;

  return (rows[0]?.count ?? 0) <= limit;
}
