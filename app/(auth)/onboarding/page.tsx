"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/actions/onboarding";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Search } from "lucide-react";

/**
 * Common currencies — ISO 4217 codes with display names.
 * Ordered by general usage / relevance, with PHP first since it's the default.
 */
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

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState<
    OnboardingState,
    FormData
  >(completeOnboarding, null);

  const [selectedCurrency, setSelectedCurrency] = useState("PHP");
  const [search, setSearch] = useState("");

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selected = CURRENCIES.find((c) => c.code === selectedCurrency);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {/* Mascot + Welcome */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex items-center justify-center rounded-2xl bg-card p-5"
            style={{
              boxShadow:
                "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
            }}
          >
            <Image
              src="/oreo.svg"
              alt="Oreo — pixel-art black cat mascot"
              width={96}
              height={96}
              className="h-24 w-24"
              style={{ imageRendering: "pixelated" }}
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="font-heading text-2xl font-semibold text-oreo-slate-purple">
              Welcome to Oreo!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Let&apos;s set up your display currency — this is what dashboard
              totals will be shown in.
            </p>
          </div>
        </div>

        {/* Currency Selection Card */}
        <Card
          className="w-full border-0"
          style={{
            boxShadow:
              "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
          }}
        >
          <form action={formAction}>
            <input type="hidden" name="baseCurrency" value={selectedCurrency} />

            <CardContent className="flex flex-col gap-4 pt-6 pb-6">
              {/* Error message */}
              {state?.error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {state.error}
                </div>
              )}

              {/* Currently selected */}
              {selected && (
                <div className="flex items-center gap-3 rounded-xl bg-oreo-periwinkle/20 px-4 py-3">
                  <span className="font-mono text-lg font-semibold text-oreo-slate-purple">
                    {selected.symbol}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-oreo-slate-purple">
                      {selected.code}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {selected.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="currency-search" className="sr-only">
                  Search currencies
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="currency-search"
                    type="text"
                    placeholder="Search currencies…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Currency grid */}
              <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
                <div className="grid grid-cols-1 divide-y divide-border">
                  {filteredCurrencies.map((currency) => (
                    <button
                      key={currency.code}
                      type="button"
                      onClick={() => setSelectedCurrency(currency.code)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/50 ${
                        selectedCurrency === currency.code
                          ? "bg-oreo-periwinkle/15"
                          : ""
                      }`}
                    >
                      <span className="font-mono text-sm font-medium text-oreo-slate-purple w-8">
                        {currency.symbol}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {currency.code}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {currency.name}
                      </span>
                    </button>
                  ))}
                  {filteredCurrencies.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No currencies match &ldquo;{search}&rdquo;
                    </div>
                  )}
                </div>
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
                  <ArrowRight className="h-4 w-4" />
                )}
                {isPending ? "Saving…" : "Continue"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You can change this later in Settings
              </p>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
