import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/auth/session";
import { searchAdmin } from "@/lib/admin/search";

export async function GET(request: Request) {
  const session = await getCurrentAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const items = await searchAdmin(query);

  return NextResponse.json({ items });
}
