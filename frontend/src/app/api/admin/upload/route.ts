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

  if (!serverEnv.CLOUDINARY_CLOUD_NAME || !serverEnv.CLOUDINARY_API_KEY || !serverEnv.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Cloudinary credentials missing" }, { status: 500 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `timestamp=${timestamp}${serverEnv.CLOUDINARY_API_SECRET}`;
  const signature = createHash("sha1").update(paramsToSign).digest("hex");

  const uploadBody = new FormData();
  uploadBody.set("file", file);
  uploadBody.set("api_key", serverEnv.CLOUDINARY_API_KEY);
  uploadBody.set("timestamp", String(timestamp));
  uploadBody.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${serverEnv.CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: uploadBody,
    },
  );

  if (!response.ok) {
    const error = await response.text();
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
