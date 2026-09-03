"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, LogOut, Shield, Globe } from "lucide-react";
import { toast } from "sonner";
import { updateBaseCurrency } from "@/app/actions/settings";
import { logout } from "@/app/actions/auth";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const CURRENCIES = [
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "PLN", name: "Polish Złoty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "CLP", name: "Chilean Peso", symbol: "CLP$" },
  { code: "ARS", name: "Argentine Peso", symbol: "ARS$" },
  { code: "COP", name: "Colombian Peso", symbol: "COP$" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵" },
] as const;

interface SettingsClientProps {
  email: string;
  baseCurrency: string;
}

export default function SettingsClient({
  email,
  baseCurrency,
}: SettingsClientProps) {
  const [currency, setCurrency] = useState(baseCurrency);
  const [isPending, startTransition] = useTransition();

  const handleCurrencyChange = (newCurrency: string | null) => {
    if (!newCurrency) return;
    setCurrency(newCurrency);
    startTransition(async () => {
      const result = await updateBaseCurrency(newCurrency);
      if (result?.error) {
        toast.error(result.error);
        setCurrency(baseCurrency); // Revert on error
      } else {
        toast.success("Base currency updated successfully.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      
      {/* Account & Security Section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground px-1 uppercase tracking-wider">
          Account & Security
        </h2>
        <Card className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:px-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Email</span>
              <span className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">
                {email}
              </span>
            </div>
          </div>
          <Separator />
          <Link
            href="/update-password"
            className="flex items-center justify-between p-4 sm:px-6 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-oreo-periwinkle/20 text-oreo-slate-purple">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Update Password
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </Card>
      </section>

      {/* Preferences Section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground px-1 uppercase tracking-wider">
          Preferences
        </h2>
        <Card className="flex flex-col overflow-hidden">
          <Dialog>
            <DialogTrigger className="flex w-full items-center justify-between p-4 sm:px-6 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none text-left disabled:opacity-50" disabled={isPending}>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-oreo-periwinkle/20 text-oreo-slate-purple">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    Base Currency
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Used for aggregated dashboard totals
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm font-medium">{currency}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="px-4 py-4 border-b border-border">
                <DialogTitle className="text-center font-heading text-xl">Select Currency</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto flex-1 p-2">
                <div className="grid grid-cols-1 gap-1">
                  {CURRENCIES.map((c) => (
                    <DialogClose
                      key={c.code}
                      onClick={() => handleCurrencyChange(c.code)}
                      className={`flex w-full items-center justify-between px-4 py-3 rounded-md transition-colors hover:bg-muted/50 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${currency === c.code ? "bg-oreo-periwinkle/15" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium text-oreo-slate-purple w-8">
                          {c.symbol}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {c.code}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline-block">
                          {c.name}
                        </span>
                      </div>
                    </DialogClose>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      </section>

      {/* Sign Out Section */}
      <section className="flex flex-col gap-3">
        <Card className="flex flex-col overflow-hidden">
          <Popover>
            <PopoverTrigger className="flex w-full items-center justify-between p-4 sm:px-6 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none group">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive group-hover:bg-destructive/20 transition-colors">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-destructive">
                  Sign Out
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[200px] p-4">
              <div className="flex flex-col gap-3 text-center">
                <span className="text-sm font-medium">Are you sure?</span>
                <div className="flex items-center gap-2">
                  <form action={logout} className="w-full">
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  </form>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </Card>
      </section>

    </div>
  );
}
