import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/auth/session";
import { contentRepository } from "@/lib/db/repositories";

export async function POST() {
  const session = await getCurrentAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await contentRepository.autoPublishScheduledContent();
  return NextResponse.json({ success: true, result });
}
