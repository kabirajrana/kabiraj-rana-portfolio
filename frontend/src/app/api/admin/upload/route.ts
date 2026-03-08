import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/auth/session";
import { serverEnv } from "@/lib/env.server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCurrentAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (serverEnv.UPLOAD_PROVIDER === "s3") {
    return NextResponse.json({ error: "S3 upload endpoint is not configured yet" }, { status: 501 });
  }

  const cloudName = serverEnv.CLOUDINARY_CLOUD_NAME?.trim();
  const cloudinaryApiKey = serverEnv.CLOUDINARY_API_KEY?.trim();
  const cloudinaryApiSecret = serverEnv.CLOUDINARY_API_SECRET?.trim();

  const missingCloudinaryEnv: string[] = [];
  if (!cloudName) {
    missingCloudinaryEnv.push("CLOUDINARY_CLOUD_NAME");
  }
  if (!cloudinaryApiKey) {
    missingCloudinaryEnv.push("CLOUDINARY_API_KEY");
  }
  if (!cloudinaryApiSecret) {
    missingCloudinaryEnv.push("CLOUDINARY_API_SECRET");
  }

  if (missingCloudinaryEnv.length > 0) {
    console.error("[admin-upload] Missing Cloudinary configuration", {
      missing: missingCloudinaryEnv,
      uploadProvider: serverEnv.UPLOAD_PROVIDER,
    });

    return NextResponse.json(
      {
        error: `Cloudinary credentials missing: ${missingCloudinaryEnv.join(", ")}`,
        missingVariables: missingCloudinaryEnv,
      },
      { status: 500 },
    );
  }

  const ensuredCloudName = cloudName;
  const ensuredCloudinaryApiKey = cloudinaryApiKey;
  const ensuredCloudinaryApiSecret = cloudinaryApiSecret;

  if (!ensuredCloudName || !ensuredCloudinaryApiKey || !ensuredCloudinaryApiSecret) {
    return NextResponse.json({ error: "Cloudinary configuration validation failed" }, { status: 500 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `timestamp=${timestamp}${ensuredCloudinaryApiSecret}`;
  const signature = createHash("sha1").update(paramsToSign).digest("hex");

  const uploadBody = new FormData();
  uploadBody.set("file", file);
  uploadBody.set("api_key", ensuredCloudinaryApiKey);
  uploadBody.set("timestamp", String(timestamp));
  uploadBody.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${ensuredCloudName}/auto/upload`,
    {
      method: "POST",
      body: uploadBody,
    },
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("[admin-upload] Cloudinary upload failed", {
      status: response.status,
      statusText: response.statusText,
      body: error.slice(0, 500),
    });
    return NextResponse.json({ error }, { status: 500 });
  }

  const payload = (await response.json()) as {
    public_id: string;
    secure_url: string;
    bytes: number;
    format?: string;
    width?: number;
    height?: number;
    resource_type?: string;
  };

  return NextResponse.json({
    key: payload.public_id,
    url: payload.secure_url,
    size: payload.bytes,
    type: payload.resource_type || payload.format || "file",
    width: payload.width,
    height: payload.height,
  });
}
