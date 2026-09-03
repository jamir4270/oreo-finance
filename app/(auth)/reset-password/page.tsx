"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword, type AuthState } from "@/app/actions/auth";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, MailCheck, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    resetPassword,
    null
  );

  // Show success state after submitting
  if (state?.success) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Card
          className="border-0"
          style={{
            boxShadow:
              "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
          }}
        >
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-oreo-dusty-teal/10">
              <MailCheck className="h-8 w-8 text-oreo-dusty-teal" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-xl font-medium text-oreo-slate-purple">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                {state.success}
              </p>
            </div>
            <Link
              href="/login"
              className="mt-2 text-sm font-medium text-oreo-slate-purple hover:text-oreo-periwinkle transition-colors"
            >
              Back to login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="text-center">
        <h2 className="font-heading text-xl font-medium text-oreo-slate-purple">
          Reset your password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <Card
        className="border-0"
        style={{
          boxShadow:
            "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
        }}
      >
        <form action={formAction}>
          <CardContent className="flex flex-col gap-4 pt-6">
            {/* Error message */}
            {state?.error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {state.error}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {isPending ? "Sending…" : "Send reset link"}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="justify-center pb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-oreo-slate-purple hover:text-oreo-periwinkle transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
