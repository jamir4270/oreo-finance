"use client";

import { useEffect } from "react";
import { Mascot } from "@/components/ui/mascot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card
        className="w-full max-w-md border-0"
        style={{
          boxShadow: "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
        }}
      >
        <CardContent className="flex flex-col items-center gap-6 pt-10 pb-10 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-oreo-mauve/20">
            <Mascot pose="confused" className="h-16 w-16" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-3xl font-semibold text-oreo-slate-purple">
              Something went wrong!
            </h2>
            <p className="text-sm text-muted-foreground">
              We encountered an unexpected error. Don't worry, Oreo is on it!
            </p>
          </div>
          <div className="flex gap-4 w-full mt-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => window.location.href = "/dashboard"}
            >
              Go to Dashboard
            </Button>
            <Button
              className="w-full"
              onClick={() => reset()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
