"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "@/app/actions/auth";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    login,
    null
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="text-center">
        <h2 className="font-heading text-xl font-medium text-oreo-slate-purple">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Log in to continue tracking your finances
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/reset-password"
                  className="text-xs text-oreo-slate-purple hover:text-oreo-periwinkle transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
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
                <LogIn className="h-4 w-4" />
              )}
              {isPending ? "Logging in…" : "Log in"}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="justify-center pb-6">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-oreo-slate-purple hover:text-oreo-periwinkle transition-colors"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
