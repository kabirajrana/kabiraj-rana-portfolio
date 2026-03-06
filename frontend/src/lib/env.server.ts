import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  ADMIN_JWT_SECRET: z.string().min(32),
  ADMIN_SESSION_COOKIE: z.string().default("admin_session"),
  ADMIN_SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 7),
  ADMIN_PREVIEW_COOKIE: z.string().default("admin_preview"),
  ADMIN_PREVIEW_SECRET: z.string().min(16).default("preview_secret_change_me_1234"),
  UPLOAD_PROVIDER: z.enum(["cloudinary", "s3"]).default("cloudinary"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
});

export const serverEnv = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/kabiraj_portfolio",
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET ?? "replace_with_long_random_secret_replace_with_long_random_secret",
  ADMIN_SESSION_COOKIE: process.env.ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS: process.env.ADMIN_SESSION_TTL_SECONDS,
  ADMIN_PREVIEW_COOKIE: process.env.ADMIN_PREVIEW_COOKIE,
  ADMIN_PREVIEW_SECRET: process.env.ADMIN_PREVIEW_SECRET,
  UPLOAD_PROVIDER: process.env.UPLOAD_PROVIDER,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_REGION: process.env.S3_REGION,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
});
