import { redirect } from "next/navigation";

import { LoginForm } from "@/app/admin/login/login-form";
import { ensureCsrfToken } from "@/lib/auth/csrf";
import { getCurrentAdminSession } from "@/lib/auth/session";

function normalizeNextPath(input: string | undefined) {
  if (!input || !input.startsWith("/")) {
    return "/admin/dashboard";
  }

  if (input.startsWith("//") || input.startsWith("/\\")) {
    return "/admin/dashboard";
  }

  return input.startsWith("/admin") ? input : "/admin/dashboard";
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const session = await getCurrentAdminSession();
  const params = (await searchParams) ?? {};
  const nextPath = normalizeNextPath(params.next);

  if (session?.role === "ADMIN") {
    redirect(nextPath);
  }

  const csrfToken = await ensureCsrfToken();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LoginForm csrfToken={csrfToken} nextPath={nextPath} />
    </div>
  );
}
