import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/auth/session";
import { contentRepository } from "@/lib/db/repositories";

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asRecordArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object").map((item) => item as Record<string, unknown>)
    : [];
}

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const settings = (await contentRepository.getGithubSettings()) ?? {};
  const labContent = asObject(settings.labContent);

  return NextResponse.json({
    demos: asRecordArray(labContent.demos),
    experiments: asRecordArray(labContent.experiments),
    notebooks: asRecordArray(labContent.notebooks),
  });
}

export async function PUT(request: Request) {
  const session = await getCurrentAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = asObject(await request.json());
  const settings = (await contentRepository.getGithubSettings()) ?? {};

  await contentRepository.upsertGithubSettings({
    ...settings,
    id: String(settings.id ?? "default"),
    labContent: {
      demos: asRecordArray(payload.demos),
      experiments: asRecordArray(payload.experiments),
      notebooks: asRecordArray(payload.notebooks),
      updatedAt: new Date().toISOString(),
    },
  });

  revalidatePath("/github");
  revalidatePath("/admin/lab");

  return NextResponse.json({ success: true });
}
