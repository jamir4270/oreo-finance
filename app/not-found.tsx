import Link from "next/link";
import { Mascot } from "@/components/ui/mascot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card
        className="w-full max-w-md border-0"
        style={{
          boxShadow: "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
        }}
      >
        <CardContent className="flex flex-col items-center gap-6 pt-10 pb-10 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-oreo-lavender/50">
            <Mascot pose="confused" className="h-20 w-20" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-3xl font-semibold text-oreo-slate-purple">
              404 - Page Not Found
            </h2>
            <p className="text-sm text-muted-foreground">
              Oreo couldn't find the page you were looking for. It might have been moved or deleted.
            </p>
          </div>
          <Link href="/dashboard" className="w-full">
            <Button className="w-full mt-4">
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
