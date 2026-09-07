"use client";

import { useActionState, useState } from "react";
import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/actions/onboarding";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Search } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { CURRENCIES } from "@/lib/currency";

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
    <div className="flex w-full flex-col gap-4">
      <div className="text-center">
        <h2 className="font-heading text-xl font-medium text-oreo-slate-purple">
          Welcome to Oreo!
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Let&apos;s set up your display currency — this is what dashboard
          totals will be shown in.
        </p>
      </div>

      {/* Currency Selection Card */}
      <Card className="w-full border-0 shadow-oreo-md">
        <form action={formAction}>
          <input type="hidden" name="baseCurrency" value={selectedCurrency} />

          <CardContent className="flex flex-col gap-4 pt-6 pb-6">
            {/* Error message */}
            {state?.error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {state.error}
              </div>
            )}

            {/* Currently selected preview */}
            {selected && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-oreo-periwinkle/20 px-4 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-oreo-slate-purple">
                    {selected.code}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selected.name}
                  </span>
                </div>
                <div className="text-right">
                  <AnimatedCounter 
                    value={1234.56} 
                    prefix={selected.symbol} 
                    className="font-mono text-xl font-semibold text-oreo-slate-purple block" 
                  />
                  <span className="text-xs text-muted-foreground">Preview</span>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="flex flex-col gap-2 mt-2">
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
  );
}
