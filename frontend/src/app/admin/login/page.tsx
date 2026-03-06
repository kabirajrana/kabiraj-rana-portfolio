import { redirect } from "next/navigation";

import { LoginForm } from "@/app/admin/login/login-form";
import { ensureCsrfToken } from "@/lib/auth/csrf";
import { getCurrentAdminSession } from "@/lib/auth/session";

export default async function AdminLoginPage() {
  const session = await getCurrentAdminSession();
  if (session?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  const csrfToken = await ensureCsrfToken();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LoginForm csrfToken={csrfToken} />
    </div>
  );
}
