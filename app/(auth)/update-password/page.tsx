"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/app/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound } from "lucide-react";

export default function UpdatePasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    updatePassword,
    null
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="text-center">
        <h2 className="font-heading text-xl font-medium text-oreo-slate-purple">
          Set new password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a strong password for your account
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
          <CardContent className="flex flex-col gap-4 pt-6 pb-6">
            {/* Error message */}
            {state?.error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {state.error}
              </div>
            )}

            {/* New Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={6}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={6}
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
                <KeyRound className="h-4 w-4" />
              )}
              {isPending ? "Updating…" : "Update password"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
