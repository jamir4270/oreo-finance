"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "@/app/actions/auth";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, MailCheck } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { TermsDialog } from "@/components/auth/TermsDialog";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signup,
    null
  );

  // Show success state after sign-up (email confirmation sent)
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
          Create your account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Start tracking your finances with Oreo
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

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
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

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                value="on"
                className="mt-[0.15rem] h-4 w-4 shrink-0 rounded border border-input text-oreo-slate-purple focus:ring-oreo-slate-purple"
                required
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-relaxed text-muted-foreground cursor-pointer"
              >
                I agree to the{" "}
                <TermsDialog>
                  <button
                    type="button"
                    className="text-oreo-slate-purple font-medium hover:text-oreo-periwinkle transition-colors hover:underline"
                  >
                    Terms & Conditions
                  </button>
                </TermsDialog>
              </Label>
            </div>

            {/* Turnstile */}
            <div className="flex justify-center pt-2 min-h-[65px]">
              <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} />
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
                <UserPlus className="h-4 w-4" />
              )}
              {isPending ? "Creating account…" : "Sign up"}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="justify-center pb-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-oreo-slate-purple hover:text-oreo-periwinkle transition-colors"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
