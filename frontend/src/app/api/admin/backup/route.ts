import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAdminSession } from "@/lib/auth/session";
import { backendApiRequest } from "@/lib/backend-api";

const backupSchema = z.object({
  siteContent: z.array(z.record(z.string(), z.unknown())).optional(),
  projects: z.array(z.record(z.string(), z.unknown())).optional(),
  experience: z.array(z.record(z.string(), z.unknown())).optional(),
  research: z.array(z.record(z.string(), z.unknown())).optional(),
  seo: z.array(z.record(z.string(), z.unknown())).optional(),
  system: z.array(z.record(z.string(), z.unknown())).optional(),
});

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await backendApiRequest<Record<string, unknown>>("/v1/admin/backup", { method: "GET", cache: "no-store" });
  if (!data) {
    return NextResponse.json({ error: "Backup endpoint unavailable" }, { status: 503 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await getCurrentAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
  const parsed = backupSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid backup payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const result = await backendApiRequest<Record<string, unknown>>(`/v1/admin/backup?dryRun=${dryRun ? "1" : "0"}`, {
    method: "POST",
    body: JSON.stringify(parsed.data),
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!result) {
    return NextResponse.json({ error: "Backup import endpoint unavailable" }, { status: 503 });
  }

  return NextResponse.json(result);
}
