"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteCertificationAction, upsertCertificationAction } from "@/app/(admin)/admin/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CredentialType = "certificate" | "certification";

export type CredentialRow = {
  id: string;
  type: CredentialType;
  codeLabel: string;
  title: string;
  issuer: string | null;
  issuedDate: Date | null;
  credentialUrl: string;
  isVisible: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeType(value: string | undefined): CredentialType {
  return value === "certificate" ? "certificate" : "certification";
}

export function CredentialsManager({ rows }: { rows: CredentialRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<CredentialType>("certificate");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [codeLabel, setCodeLabel] = useState("");
  const [title, setTitle] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isVisible, setIsVisible] = useState(true);

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => normalizeType(row.type) === activeType)
      .sort((a, b) => {
        const byOrder = Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0);
        if (byOrder !== 0) return byOrder;
        const aCreated = String(a.createdAt ?? "");
        const bCreated = String(b.createdAt ?? "");
        return aCreated.localeCompare(bCreated);
      });
  }, [activeType, rows]);

  const resetForm = () => {
    setEditingId(null);
    setCodeLabel("");
    setTitle("");
    setCredentialUrl("");
    setSortOrder("0");
    setIsVisible(true);
  };

  const isEditing = Boolean(editingId);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>Credentials</CardTitle>
        <div className="inline-flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant={activeType === "certificate" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => {
              setActiveType("certificate");
              resetForm();
            }}
          >
            Certificates
          </Button>
          <Button
            type="button"
            variant={activeType === "certification" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => {
              setActiveType("certification");
              resetForm();
            }}
          >
            Certifications
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <form
          className="grid gap-2 md:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault();
            setFormError(null);
            const formData = new FormData();
            if (editingId) formData.set("id", editingId);
            formData.set("type", activeType);
            formData.set("codeLabel", codeLabel);
            formData.set("title", title);
            formData.set("credentialUrl", credentialUrl);
            formData.set("sortOrder", sortOrder);
            if (isVisible) formData.set("isVisible", "on");

            startTransition(async () => {
              const result = await upsertCertificationAction(formData);
              if (!result?.success) {
                setFormError(result?.message ?? "Failed to save credential.");
                return;
              }

              try {
                resetForm();
                router.refresh();
              } catch (error) {
                setFormError(error instanceof Error ? error.message : "Failed to save credential.");
              }
            });
          }}
        >
          <input
            name="codeLabel"
            placeholder="C1"
            className="rounded-xl border border-border bg-surface p-2.5"
            value={codeLabel}
            onChange={(event) => setCodeLabel(event.target.value)}
            required
          />
          <input
            name="title"
            placeholder={activeType === "certificate" ? "Certificate title" : "Certification title"}
            className="rounded-xl border border-border bg-surface p-2.5 md:col-span-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <input
            name="credentialUrl"
            placeholder="Credential URL"
            className="rounded-xl border border-border bg-surface p-2.5"
            value={credentialUrl}
            onChange={(event) => setCredentialUrl(event.target.value)}
            required
          />
          <input
            type="number"
            name="sortOrder"
            className="rounded-xl border border-border bg-surface p-2.5"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            required
          />
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5">
            <input
              type="checkbox"
              name="isVisible"
              checked={isVisible}
              onChange={(event) => setIsVisible(event.target.checked)}
            />
            Visible
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-5">
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving..."
                : isEditing
                  ? activeType === "certificate"
                    ? "Update Certificate"
                    : "Update Certification"
                  : activeType === "certificate"
                    ? "Add Certificate"
                    : "Add Certification"}
            </Button>
            {isEditing ? (
              <Button type="button" variant="outline" onClick={resetForm} disabled={pending}>
                Cancel Edit
              </Button>
            ) : null}
          </div>
          {formError ? <p className="text-sm text-destructive md:col-span-5">{formError}</p> : null}
        </form>

        <DataTable<CredentialRow>
          rows={filteredRows}
          emptyLabel={activeType === "certificate" ? "No certificates" : "No certifications"}
          columns={[
            { key: "code", header: "Code", render: (row) => row.codeLabel || "-" },
            { key: "title", header: "Title", render: (row) => row.title },
            {
              key: "url",
              header: "URL",
              render: (row) => (
                <a href={row.credentialUrl} className="text-accent" target="_blank" rel="noreferrer noopener">
                  View
                </a>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveType(normalizeType(row.type));
                      setEditingId(row.id);
                      setCodeLabel(row.codeLabel || "");
                      setTitle(row.title || "");
                      setCredentialUrl(row.credentialUrl || "");
                      setSortOrder(String(row.sortOrder ?? 0));
                      setIsVisible(Boolean(row.isVisible ?? true));
                    }}
                  >
                    Edit
                  </Button>
                  <ConfirmDialog
                    triggerLabel="Delete"
                    title={`Delete ${normalizeType(row.type) === "certificate" ? "certificate" : "certification"}`}
                    description="This action cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={async () => {
                      setFormError(null);
                      try {
                        await deleteCertificationAction(row.id);
                        if (editingId === row.id) {
                          resetForm();
                        }
                        router.refresh();
                      } catch (error) {
                        setFormError(error instanceof Error ? error.message : "Failed to delete credential.");
                      }
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
