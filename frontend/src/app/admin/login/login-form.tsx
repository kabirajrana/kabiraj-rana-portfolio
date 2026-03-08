"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { adminLoginAction } from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function normalizeNextPath(input: string) {
  if (!input.startsWith("/") || input.startsWith("//") || input.startsWith("/\\")) {
    return "/admin/dashboard";
  }

  return input.startsWith("/admin") ? input : "/admin/dashboard";
}

export function LoginForm({ csrfToken, nextPath }: { csrfToken: string; nextPath: string }) {
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card className="mx-auto w-full max-w-md border-border/70">
      <CardHeader>
        <CardTitle>Admin Sign In</CardTitle>
        <CardDescription>Secure access for portfolio control center.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData();
            formData.set("email", email);
            formData.set("password", password);
            formData.set("csrfToken", csrfToken);
            formData.set("next", normalizeNextPath(nextPath));

            startTransition(async () => {
              const result = await adminLoginAction(formData);
              if (!result.success) {
                toast.error(result.message);
                return;
              }

              toast.success("Welcome back");

              const redirectTo = normalizeNextPath(String(result.redirectTo ?? nextPath));

              // Use full navigation so the fresh session cookie is guaranteed
              // to be sent with the first admin dashboard request.
              setTimeout(() => {
                window.location.replace(redirectTo);
              }, 200);
            });
          }}
        >
          <Input type="email" name="email" placeholder="you@domain.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input type="password" name="password" placeholder="••••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
