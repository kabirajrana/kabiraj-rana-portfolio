import type { ReactNode } from "react";

import { CommandPalette } from "@/components/admin/CommandPalette";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { requireAdminSession } from "@/lib/auth/guards";
import { dashboardRepository } from "@/lib/db/repositories";

import { adminLogoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminSession();
  const notifications = await dashboardRepository.getTopbarNotifications();

  return (
    <div className="flex min-h-screen overflow-x-clip">
      <Sidebar />
      <div className="mx-auto min-w-0 w-full max-w-[1600px] px-3 sm:px-4 lg:px-8">
        <Topbar onLogout={adminLogoutAction} notifications={notifications} />
        {children}
      </div>
      <CommandPalette />
    </div>
  );
}
