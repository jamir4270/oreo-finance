# Oreo Finance — v1.0.0 Post-Launch Action Plan

**Status:** Draft · **Date:** September 4, 2026
**Companion to:** `SRS-personal-finance-app.md`, `database-schema.md`, `build-phases.md`, `oreo-premium-interactivity-spec.md`
**Purpose:** Concrete, sequenced fixes identified from a full code review of the deployed v1.0.0 build, organized by priority so the app is safe and solid for real user testing.

---

## How to use this document

Each item lists the **file(s) involved**, **why it matters**, and a **suggested fix**. Work top to bottom — later phases assume earlier ones are done. Check items off as you go.

---

## Phase A — Correctness bugs (fix before inviting any testers)

These produce *wrong numbers* in a finance app, which is worse than a missing feature. Testers will lose trust in the data immediately if they hit these.

- [ ] **A1. Multi-currency totals are summed without conversion.**
  - **Files:** `app/(app)/dashboard/page.tsx`, `components/accounts/AccountsPageClient.tsx`
  - **Problem:** `activeAccounts.reduce((sum, acc) => sum + acc.balance, 0)` sums raw account balances regardless of each account's currency, then displays the result under the base-currency symbol. A user with a PHP account and a USD account gets a meaningless "Total Balance."
  - **Fix:** Fetch exchange rates (`getExchangeRates()`, already used elsewhere) and run every account's balance through `convertCurrency(balance, account.currency, baseCurrency, rates)` before summing. Apply to both the Dashboard total and the Accounts page total/income/expense figures.

- [ ] **A2. Exchange-rate fallback silently corrupts non-USD base currencies.**
  - **File:** `lib/exchange-rates.ts`
  - **Problem:** If `OPENEXCHANGERATES_APP_ID` is missing or the cache table is empty, `getExchangeRates()` returns `{ USD: 1 }`. Since the default seeded `base_currency` is `'PHP'`, this silently produces wrong converted amounts everywhere with no visible warning to the user.
  - **Fix:**
    1. ~~Confirm `OPENEXCHANGERATES_APP_ID` is actually set in Vercel's Production env vars.~~ ✅ **Confirmed set on Vercel (2026-09-04).**
    2. Still verify the `exchange_rates` table actually has at least one cached row in production — the env var being set doesn't guarantee a successful first fetch happened (network hiccup, wrong key value, OXR quota, etc.). Check the Supabase table directly or trigger one page load that calls `getExchangeRates()` and confirm a row appears with today's `fetched_at`.
    3. Surface the `isStale` flag (already returned by `getExchangeRates()` but currently unused everywhere it's called) as a small inline banner per FR-8.4 — see A3. This still matters even with the key confirmed, since `isStale` also fires on any *future* fetch failure (OXR downtime, quota exhaustion, etc.), not just a missing key.

- [ ] **A3. Stale exchange-rate warning (FR-8.4) is not implemented anywhere.**
  - **Files:** `app/(app)/dashboard/page.tsx`, `app/(app)/transactions/page.tsx`, `app/(app)/budgets/page.tsx`, `app/(app)/analytics/page.tsx`
  - **Problem:** `getExchangeRates()` returns `{ rates, isStale }`, but no page reads or displays `isStale`. The SRS requires the user be told when a stale/cached rate is in use.
  - **Fix:** Add a small amber inline banner component (per the design spec's "errors are direct, not cute" voice) shown wherever `isStale === true`, e.g. "Showing last saved exchange rates — may be up to a day old."

- [ ] **A4. "Undo" buttons on delete/create toasts do nothing.**
  - **Files:** `components/transactions/TransactionsPageClient.tsx`, `components/transactions/TransactionDialog.tsx`, `components/budgets/BudgetsPageClient.tsx`
  - **Problem:** `toast.success(..., { action: { label: "Undo", onClick: () => toast("Undo action will be processed") } })` — clicking Undo does nothing except show another toast. This is actively misleading.
  - **Fix (pick one):**
    - **Quick:** Remove the `action` prop from these toasts entirely until undo is real.
    - **Real fix:** Implement actual undo — for deletes, keep the deleted row's data in local state for ~5s and re-insert via a server action if Undo is clicked, matching the pattern already specced in `oreo-premium-interactivity-spec.md` §6.8.

---

## Phase B — Cleanup (low effort, removes confusion for anyone touching the repo)

- [ ] **B1. Remove debug logging from production route.**
  - **File:** `app/auth/callback/route.ts`
  - **Fix:** Delete the `console.log`/`console.warn`/`console.error` calls, or gate them behind `process.env.NODE_ENV === "development"`.

- [ ] **B2. Delete dead component.**
  - **File:** `components/layout/AddTransactionModal.tsx`
  - **Problem:** Superseded by `TransactionDialog`; not imported anywhere. Still shows "This form will be fully implemented in Phase 9" if ever rendered.
  - **Fix:** Delete the file.

- [ ] **B3. Remove or gate the orphaned Goals page.**
  - **File:** `app/(app)/goals/page.tsx`
  - **Problem:** Not linked from `DesktopSidebar` or `MobileBottomNav`/`MORE_MENU_ITEMS`, but still reachable by direct URL, showing a stale "Coming in Phase 11" placeholder.
  - **Fix:** Either delete the route until Goals is un-halted, or make it explicitly return a 404 (`notFound()` from `next/navigation`).

- [ ] **B4. Resolve duplicate PWA manifest.**
  - **Files:** `public/manifest.json`, `app/manifest.ts`
  - **Problem:** `app/layout.tsx` metadata points at `/manifest.json` while Next also auto-serves `app/manifest.ts` at `/manifest.webmanifest`. Two manifests can conflict.
  - **Fix:** Keep `app/manifest.ts` (the dynamic, type-checked version) and delete `public/manifest.json` + the `manifest: "/manifest.json"` line in `app/layout.tsx`'s metadata, letting Next wire up `/manifest.webmanifest` automatically. Update icon paths in `app/manifest.ts` to match what `scripts/generate-splash.js` actually outputs (`/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/icon-512-maskable.png` — currently `app/manifest.ts` points at a nonexistent `/oreo.png`).

- [ ] **B5. Add branded 404 and error pages.**
  - **Files:** create `app/not-found.tsx`, `app/error.tsx`
  - **Problem:** No custom error/not-found pages exist — a mistyped URL or thrown error currently falls back to Next's generic default, breaking the branded experience everywhere else.
  - **Fix:** Build simple pages reusing the `Mascot` component with `pose="confused"`, consistent with the "errors are direct, not cute" voice rule in `oreo-design-spec.md` §7.

- [ ] **B6. Consolidate duplicated `getCurrencySymbol()`.**
  - **Files:** `components/budgets/BudgetCard.tsx`, `BudgetDetailDialog.tsx`, `EditBudgetDialog.tsx`, `components/accounts/AccountsPageClient.tsx`, `components/analytics/CategoryBreakdownChart.tsx`, `TrendsChart.tsx`, `BudgetHealthCard.tsx`
  - **Fix:** Move the single implementation into `lib/currency.ts` and import it everywhere instead of re-declaring it seven times.

- [ ] **B7. Reconcile the two account-currency lists.**
  - **Files:** `components/accounts/CreateAccountDialog.tsx` (10 currencies), `components/settings/SettingsClient.tsx` / `app/(auth)/onboarding/page.tsx` (40 currencies)
  - **Problem:** A user can onboard with e.g. KRW as base currency but can't create an account in KRW, since `CreateAccountDialog`'s list is a smaller subset.
  - **Fix:** Extract one shared `CURRENCIES` constant (in `lib/currency.ts` or a new `lib/constants.ts`) and use it in both places.

---

## Phase C — Performance (do this before scaling past a handful of concurrent testers)

- [ ] **C1. Fix N+1 queries on Budgets and Analytics pages.**
  - **Files:** `app/(app)/budgets/page.tsx`, `app/(app)/analytics/page.tsx`, `lib/budget-periods.ts`
  - **Problem:** Both pages run `for (const budget of budgets) { await ensureCurrentPeriod(...); await computeActualSpent(...) }` — sequential round-trips per budget, each also running its own full transaction-table query. A tester with 8 budgets triggers 16+ sequential Supabase calls per page load.
  - **Fix:** Batch `ensureCurrentPeriod` calls with `Promise.all` where they don't depend on each other, and refactor `computeActualSpent` to accept multiple `(category_id, period range)` tuples and do one grouped query instead of one query per budget.

- [ ] **C2. Paginate or bound the Analytics transaction fetch.**
  - **File:** `app/(app)/analytics/page.tsx`
  - **Problem:** Fetches the entire current year's transactions unconditionally (`gte("txn_date", currentYearStart)`), with no cap. Fine now, will visibly slow down as a tester's history grows.
  - **Fix:** Either respect the client-side `dateRange` filter at the query level instead of over-fetching and filtering client-side, or cap the initial fetch and lazy-load older data only when "This Year"/"All Time" is selected.

- [ ] **C3. Re-check the `revalidatePath` calls for over-invalidation.**
  - **Files:** `app/actions/transactions.ts`, `app/actions/accounts.ts`, `app/actions/budgets.ts`
  - **Problem:** Several actions revalidate multiple full paths (e.g. `/transactions` and `/accounts` together) on every single mutation, forcing full re-fetches of pages the user isn't even looking at.
  - **Fix:** Scope revalidation to only the paths that actually changed data the user could currently be viewing; consider `revalidateTag` for finer-grained invalidation if this becomes a bottleneck.

---

## Phase D — Polish from your own spec that's still outstanding

Referenced in `oreo-premium-interactivity-spec.md` but not yet implemented. Not blockers, but do the highest-impact ones before a wider testing round.

- [ ] **D1. Skeleton loading states** (§2.7). Currently only `app/(app)/loading.tsx` (a full-page mascot spinner) exists — no per-section skeletons on Accounts/Transactions/Budgets/Analytics while their data streams in.
- [ ] **D2. Dashboard balance count-up animation** (§2.8, §5.4). `AnimatedCounter` component already exists and is used on the Dashboard — verify it also fires correctly after A1's currency-conversion fix, and extend the same treatment to Accounts page totals.
- [ ] **D3. Realtime multi-device sync (Phase 14 / FR-9.6).** No `.channel()` subscriptions exist anywhere in the codebase. If a tester has two tabs open, changes in one won't appear in the other without a manual refresh — worth explicitly telling testers this isn't wired up yet, or implementing it if two-tab usage is expected during testing.
- [ ] **D4. Toast for stale-rate / degraded states** — ties into A3, but also applies to the transfer form's live conversion preview in `TransactionDialog.tsx`, which should show "Rate as of X" per the spec.

---

## Phase E — Operational readiness (free-tier hosting)

- [x] **E1. Confirm `OPENEXCHANGERATES_APP_ID` and all Supabase keys are set in Vercel's Production environment** (not just `.env.local`), per A2. — ✅ OpenExchangeRates key confirmed set on Vercel (2026-09-04). Still double-check the three Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are present too, since `exchange-rates.ts` needs the service role key specifically to write the cache row (it bypasses RLS on `exchange_rates`).
- [ ] **E2. Set up a weekly keep-alive ping to Supabase** (a Vercel Cron Job or GitHub Action hitting any API route) — Supabase Free projects pause after 7 days with zero API requests, and a paused project 500s until manually resumed from the dashboard. This is the most likely way testing gets interrupted for reasons that have nothing to do with the app itself.
- [ ] **E3. Spot-check Supabase egress usage weekly** in the dashboard's Usage tab once testers are active — the 5 GB/month egress cap is the tightest free-tier constraint for this app (tighter than Vercel's 100 GB bandwidth), and Phase C's N+1 fixes directly reduce it.
- [ ] **E4. Note the Vercel Hobby non-commercial restriction** — fine for an unpaid beta, but flag internally if testing ever involves payment, ads, or anything that could be read as commercial use, since that requires Pro regardless of traffic volume.

---

## Suggested sequencing

1. **Phase A** (correctness) — must ship before any tester touches the app.
2. **Phase B** (cleanup) — same sitting as Phase A, low effort, high signal-to-noise for a first impression.
3. **Phase E1–E2** (env vars + keep-alive) — do alongside A/B, before inviting testers, so the app doesn't go dark mid-test.
4. **Phase C** (performance) — before growing past ~10-20 concurrent testers.
5. **Phase D** (polish) — ongoing, prioritize D1 (skeletons) and D3 (decide/communicate Realtime status) first.
