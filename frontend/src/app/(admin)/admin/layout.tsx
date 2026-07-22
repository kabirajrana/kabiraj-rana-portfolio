import type { ReactNode } from "react";

import { CommandPalette } from "@/components/admin/CommandPalette";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { requireAdminSession } from "@/lib/auth/guards";
import { dashboardRepository } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

type AdminNotifications = {
  unreadMessages: number;
  githubError: string | null;
  githubLastSyncAt: Date | null;
  healthSummary: string | null;
  healthWarnings: number;
  healthErrors: number;
  dueScheduled: number;
};

const EMPTY_NOTIFICATIONS: AdminNotifications = {
  unreadMessages: 0,
  githubError: null,
  githubLastSyncAt: null,
  healthSummary: null,
  healthWarnings: 0,
  healthErrors: 0,
  dueScheduled: 0,
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminSession();
  let notifications = EMPTY_NOTIFICATIONS;

  try {
    const remoteNotifications = await dashboardRepository.getTopbarNotifications();
    notifications = {
      unreadMessages: Number.isFinite(Number(remoteNotifications.unreadMessages)) ? Number(remoteNotifications.unreadMessages) : 0,
      githubError: typeof remoteNotifications.githubError === "string" ? remoteNotifications.githubError : null,
      githubLastSyncAt: remoteNotifications.githubLastSyncAt instanceof Date ? remoteNotifications.githubLastSyncAt : null,
      healthSummary: typeof remoteNotifications.healthSummary === "string" ? remoteNotifications.healthSummary : null,
      healthWarnings: Number.isFinite(Number(remoteNotifications.healthWarnings)) ? Number(remoteNotifications.healthWarnings) : 0,
      healthErrors: Number.isFinite(Number(remoteNotifications.healthErrors)) ? Number(remoteNotifications.healthErrors) : 0,
      dueScheduled: Number.isFinite(Number(remoteNotifications.dueScheduled)) ? Number(remoteNotifications.dueScheduled) : 0,
    };
  } catch {
    // Notifications are optional; an unavailable backend must not block admin access.
  }

  return (
    <div className="flex min-h-screen overflow-x-clip">
      <Sidebar />
      <div className="mx-auto min-w-0 w-full max-w-[1600px] px-3 sm:px-4 lg:px-8">
        <Topbar notifications={notifications} />
        {children}
      </div>
      <CommandPalette />
    </div>
  );
}
