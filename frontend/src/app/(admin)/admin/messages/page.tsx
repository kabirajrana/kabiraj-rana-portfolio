import { format } from "date-fns";

import { deleteMessageAction, updateMessageStatusAction } from "@/app/(admin)/admin/actions";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { contentRepository } from "@/lib/db/repositories";

type MessageRow = Awaited<ReturnType<typeof contentRepository.listMessages>>[number];

export default async function AdminMessagesPage() {
  const messages = await contentRepository.listMessages();

  return (
    <section className="pb-8">
      <PageHeader title="Messages" description="Inbox workflow for read/unread state, archive, and moderation actions." />

      <DataTable<MessageRow>
        rows={messages}
        emptyLabel="No messages"
        columns={[
          { key: "sender", header: "Sender", render: (row) => <div><p className="font-medium">{row.sender}</p><p className="text-xs text-muted">{row.email}</p></div> },
          {
            key: "message",
            header: "Message",
            render: (row) => (
              <div className="max-w-[520px] space-y-1">
                <p className="line-clamp-1 font-medium">{row.subject}</p>
                <p className="line-clamp-3 text-xs text-muted whitespace-pre-wrap">{row.body}</p>
              </div>
            ),
          },
          { key: "status", header: "Status", render: (row) => <Badge>{row.status}</Badge> },
          { key: "date", header: "Date", render: (row) => format(row.createdAt, "MMM d, HH:mm") },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" size="sm" variant="outline">View</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{row.subject}</DialogTitle>
                      <DialogDescription>
                        {row.sender} · {row.email}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-xl border border-border/70 bg-surface p-4 text-sm whitespace-pre-wrap">
                      {row.body}
                    </div>
                  </DialogContent>
                </Dialog>
                <form action={async () => {
                  "use server";
                  await updateMessageStatusAction(row.id, row.status === "UNREAD" ? "READ" : "UNREAD");
                }}>
                  <Button type="submit" size="sm" variant="outline" className="whitespace-nowrap">Toggle Read</Button>
                </form>
                <form action={async () => {
                  "use server";
                  await updateMessageStatusAction(row.id, "ARCHIVED");
                }}>
                  <Button type="submit" size="sm" variant="outline">Archive</Button>
                </form>
                <form action={async () => {
                  "use server";
                  await deleteMessageAction(row.id);
                }}>
                  <Button type="submit" size="sm">Delete</Button>
                </form>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
