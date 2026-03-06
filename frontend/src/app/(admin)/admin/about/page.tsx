"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Editor } from "@/components/admin/Editor";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { enablePreviewAction, saveAboutAction } from "../actions";

export default function AdminAboutPage() {
  const [bio, setBio] = useState("<p>Write your story.</p>");
  const [education, setEducation] = useState("<p>Education details</p>");
  const [focusAreas, setFocusAreas] = useState("<p>Focus areas</p>");
  const [timelineNotes, setTimelineNotes] = useState("<p>Timeline notes</p>");
  const [scheduledAt, setScheduledAt] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (status: "DRAFT" | "PUBLISHED" | "SCHEDULED") => {
    const formData = new FormData();
    formData.set("bio", bio);
    formData.set("education", education);
    formData.set("focusAreas", focusAreas);
    formData.set("timelineNotes", timelineNotes);
    formData.set("status", status);
    formData.set("scheduledAt", scheduledAt);

    startTransition(async () => {
      await saveAboutAction(formData);
      toast.success(status === "PUBLISHED" ? "About published" : "Draft saved");
    });
  };

  return (
    <section className="pb-8">
      <PageHeader title="About Manager" description="Rich text authoring with code and math support for your narrative sections." />

      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Editor value={bio} onChange={setBio} />
          <CardTitle className="text-base">Education</CardTitle>
          <Editor value={education} onChange={setEducation} />
          <CardTitle className="text-base">Focus Areas</CardTitle>
          <Editor value={focusAreas} onChange={setFocusAreas} />
          <CardTitle className="text-base">Timeline Notes</CardTitle>
          <Editor value={timelineNotes} onChange={setTimelineNotes} />
          <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="rounded-xl border border-border bg-surface p-2.5" />

          <div className="flex flex-wrap gap-2">
            <Button className="flex-1 min-w-[8.5rem] sm:min-w-0 sm:flex-none" variant="outline" disabled={pending} onClick={() => submit("DRAFT")}>Save Draft</Button>
            <Button className="flex-1 min-w-[8.5rem] sm:min-w-0 sm:flex-none" disabled={pending} onClick={() => submit("PUBLISHED")}>Publish</Button>
            <Button className="flex-1 min-w-[8.5rem] sm:min-w-0 sm:flex-none" variant="outline" disabled={pending} onClick={() => submit("SCHEDULED")}>Schedule</Button>
            <Button className="flex-1 min-w-[8.5rem] sm:min-w-0 sm:flex-none" variant="outline" disabled={pending} onClick={() => startTransition(async () => { await enablePreviewAction(); toast.success("Preview enabled"); })}>Preview</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
