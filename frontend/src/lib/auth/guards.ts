import { redirect } from "next/navigation";

import { getCurrentAdminSession } from "@/lib/auth/session";

export async function requireAdminSession() {
  const session = await getCurrentAdminSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return session;
}
