import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-oreo-slate-purple">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, preferences, and base currency.
        </p>
      </div>

      <div className="flex flex-col mt-8 gap-8">
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <h2 className="font-heading text-xl text-oreo-slate-purple">Coming in future phases</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            This section will contain base currency selection, reminders, and profile management.
          </p>
        </div>

        {/* Logout Section */}
        <div className="rounded-2xl border border-border p-6 bg-card">
          <h3 className="font-medium text-lg text-foreground mb-4">Account</h3>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
