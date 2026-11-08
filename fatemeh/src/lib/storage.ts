import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { decrypt, encrypt } from "./crypto";
import { env } from "./env";

/**
 * Private storage for patient photographs.
 *
 * - Files are encrypted with AES-256-GCM *before* they leave the server,
 *   so even a leaked bucket or disk holds nothing readable.
 * - Keys are random UUIDs: no names, references or dates in file paths.
 * - Nothing here produces a URL. Photos are only ever streamed through the
 *   authenticated admin route (`/api/admin/photos/[id]`).
 *
 * `local` writes outside `public/` (fine for development or a single VPS).
 * `s3` works with any S3-compatible private bucket (AWS S3 London, Cloudflare R2, …).
 */
interface Driver {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
}

function localDriver(): Driver {
  const root = path.resolve(process.cwd(), env().LOCAL_STORAGE_DIR);
  const resolve = (key: string) => {
    if (!/^[a-z0-9-]+\.bin$/.test(key)) throw new Error("Invalid storage key");
    return path.join(root, key.slice(0, 2), key);
  };
  return {
    async put(key, data) {
      const file = resolve(key);
      await mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
      await writeFile(file, data, { mode: 0o600 });
    },
    get: (key) => readFile(resolve(key)),
    remove: (key) => rm(resolve(key), { force: true }),
  };
}

function s3Driver(): Driver {
  const e = env();
  const client = new S3Client({
    region: e.S3_REGION,
    endpoint: e.S3_ENDPOINT,
    forcePathStyle: e.S3_FORCE_PATH_STYLE,
    credentials: { accessKeyId: e.S3_ACCESS_KEY_ID!, secretAccessKey: e.S3_SECRET_ACCESS_KEY! },
  });
  const Bucket = e.S3_BUCKET!;
  return {
    async put(key, data) {
      await client.send(
        new PutObjectCommand({ Bucket, Key: `assessments/${key}`, Body: data, ContentType: "application/octet-stream" }),
      );
    },
    async get(key) {
      const res = await client.send(new GetObjectCommand({ Bucket, Key: `assessments/${key}` }));
      return Buffer.from(await res.Body!.transformToByteArray());
    },
    async remove(key) {
      await client.send(new DeleteObjectCommand({ Bucket, Key: `assessments/${key}` }));
    },
  };
}

let driver: Driver | null = null;
const getDriver = () => (driver ??= env().STORAGE_DRIVER === "s3" ? s3Driver() : localDriver());

export const newStorageKey = () => `${randomUUID()}.bin`;

export async function putPrivate(key: string, plain: Buffer) {
  await getDriver().put(key, encrypt(plain, "photos", key));
}

export async function getPrivate(key: string): Promise<Buffer> {
  return decrypt(await getDriver().get(key), "photos", key);
}

export async function removePrivate(...keys: string[]) {
  await Promise.all(keys.map((k) => getDriver().remove(k).catch(() => undefined)));
}
