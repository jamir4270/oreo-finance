"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mascot } from "@/components/ui/mascot";

interface TermsDialogProps {
  children: React.ReactElement;
}

export function TermsDialog({ children }: TermsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center gap-4 text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-oreo-lavender/50 text-oreo-slate-purple shrink-0">
            <Mascot pose="idle" className="h-8 w-8" />
          </div>
          <div>
            <DialogTitle className="font-heading text-xl text-oreo-slate-purple">
              Terms & Conditions
            </DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Public Testing Prototype
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[300px] mt-4 rounded-md border border-border p-4 text-sm text-muted-foreground leading-relaxed">
          <p className="mb-4">
            Welcome to the Oreo Finance public prototype! By creating an account, you acknowledge and agree to the following:
          </p>
          <h4 className="font-medium text-foreground mb-1">1. Prototype Status</h4>
          <p className="mb-4">
            This application is currently in a testing phase. Features may change, break, or be removed without notice. We are providing this "as-is" without any warranties.
          </p>
          <h4 className="font-medium text-foreground mb-1">2. Test Data Only</h4>
          <p className="mb-4">
            <strong>Please do not enter real account numbers, highly sensitive personal information, or actual bank credentials.</strong> While we take reasonable steps to secure your data, this is a prototype and should be treated as such.
          </p>
          <h4 className="font-medium text-foreground mb-1">3. Data Resets</h4>
          <p className="mb-4">
            As we finalize the database schema and prepare for a stable release, your test data (including transactions, categories, and accounts) <strong>may be permanently reset or deleted</strong>. Do not rely on this prototype as your sole financial record.
          </p>
          <h4 className="font-medium text-foreground mb-1">4. Feedback</h4>
          <p>
            We greatly appreciate your help in testing! If you run into issues, please use the "Feedback" link inside the app to let us know.
          </p>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
