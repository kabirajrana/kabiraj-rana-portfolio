import { motion } from "framer-motion";
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <LoginForm csrfToken={csrfToken} nextPath={nextPath} />
      </motion.div>
    </div>
  );
}
