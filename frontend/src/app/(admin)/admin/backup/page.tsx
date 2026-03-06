import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BackupControls } from "../settings/backup-controls";

export default function AdminBackupPage() {
  return (
    <section className="space-y-4 pb-8">
      <PageHeader title="Backup & Export" description="Export JSON snapshots and import with dry-run validation." />
      <Card>
        <CardHeader>
          <CardTitle>JSON Backup</CardTitle>
        </CardHeader>
        <CardContent>
          <BackupControls />
        </CardContent>
      </Card>
    </section>
  );
}
