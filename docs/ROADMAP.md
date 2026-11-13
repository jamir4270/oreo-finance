# Oreo — Review, Roadmap & Implementation Plan

**Date:** 2026-11-13 · **Baseline:** `main` @ `06b1409` (v3.1.0)
**Supersedes:** `docs/archive/*` (phases 0–G)

**Progress (branch `fix/bugs-and-speed`):** done: bugs #1, #3, #7, #8, #9, #11; speed S1–S5 (the S3 migration is applied to the hosted DB) S7 (optimistic add and delete; edits still wait for the server) and S8 (skeletons on every route). S6 is partly done (rates deduplicated per request, not yet cached across requests). Vitest has been added (`npm test`). iOS pass 1 is done: U1–U4, the U5 tabular numbers (`formatMoney` still to do), C1 bottom sheet (Base UI Drawer, no new dependency), C2 tab bar, a C4-style More menu, and the C6 action sheet for sign-out and delete. Next: C8 keypad-first quick log, C3 large titles, C5 swipe actions, and action sheets for the remaining destructive confirms.

This doc has four parts: (1) an honest product critique, (2) bugs and debt found in review, (3) retrofits, upgrades and where to go next, (4) the plan for UX, speed and iOS-grade polish. Part 4 is the one to act on.

---

## 1. Product critique

**What's good**
- The scope discipline is real. Goals were halted rather than half-built. Balances are derived, not stored. Every table has RLS. Budgets pin their currency. These are good calls for a solo prototype.
- Multi-currency with per-transaction foreign entry and recorded transfer rates is more than most hobby finance apps handle.
- The mascot gives the app an identity, which is rare in the category.

**What's holding it back**
1. **Manual entry is the whole product, but it's built like a form.** Manual-entry trackers live or die on how fast you can log, and people churn when logging feels like work. Right now logging means: open the sheet, choose a type, type an amount on a `type="number"` field, pick an account from a select, pick a category, check the date, add a note, submit. It should take 3 taps plus the amount.
2. **The dashboard answers the wrong question.** "Total balance" is something you check once. The number people come back for daily is **"how much can I still spend today / this period?"** The budget data to compute it already exists.
3. **No reason to come back.** `profiles.reminder_time` and `reminder_enabled` exist but nothing uses them. There are no reminders, no streaks surfaced, no widgets. A daily-habit app with no habit loop.
4. **The personality is only skin-deep.** Under the mascot it's a stock shadcn dashboard: same cards, the same hover-first desktop patterns, a full-page "Loading..." mascot, and a fake splash. On a phone it feels like a website, not an app. Part 4 fixes this.
5. **The audience isn't committed to.** It defaults to PHP and testers come from a university page, which means students with allowances, GCash/Maya and small daily budgets. Lean into that: allowance-cycle budgets, e-wallet presets, daily safe-to-spend. 40 currencies is not a selling point for that user.
6. **Engineering hygiene trails the feature count.** There are no tests, no CI and no error monitoring (just `console.error`). The README claimed realtime sync that doesn't exist (now fixed). Nine planning docs sat at the repo root (now moved to `docs/`).

---

## 2. Bugs & debt found in review (ranked)

| # | Severity | Where | Problem | Fix |
|---|---|---|---|---|
| 1 | **High** (wrong money) | `lib/budget-periods.ts` `computePeriodBounds` (monthly) | For anchor days 29–31, `new Date(y, m-1, 31)` overflows into the next month **before** the clamp runs. With anchor 31 and today = Mar 1, the period computes as **Mar 3 → Apr 30**, which starts after today. Spending is counted against the wrong window. (Verified.) | Clamp the day before constructing the date: `new Date(y, m, Math.min(anchorDay, daysIn(y, m)))`. Add a unit test covering days 28–31 across Feb and leap years. |
| 2 | **High** | `ensureCurrentPeriods` + `budgets/page.tsx` | Rollover reads the prior period's `actual_spent`, which is only written when someone opens /budgets, and it's written fire-and-forget from a Server Component (Vercel can freeze the function before it finishes). Skipped periods are never created, so rollover jumps over them or rolls over a stale `0` spent, which means the full limit. | Compute `actual_spent` from transactions when closing a period, not as a side effect of viewing. Better: do it in a Postgres function `ensure_budget_periods(user_id, today)` that backfills every missing period in order. |
| 3 | Medium | `computeActualSpentBatched` | `spentMap` is keyed by `categoryId`, so two budgets on the same category (e.g. daily plus monthly) overwrite each other. | Key by `budget_id` / `periodId`. |
| 4 | Medium | everywhere using `new Date().toISOString().split('T')[0]` | "Today" is UTC on Vercel. For a UTC+8 user it's yesterday from 00:00 to 08:00 local, which breaks daily budgets, the daily count and default dates. | Add a `profiles.timezone` column (set from `Intl.DateTimeFormat().resolvedOptions().timeZone` at onboarding) and compute "today" with it. |
| 5 | Medium | dashboard, budgets, analytics | Past foreign-currency transactions are converted at **today's** rate, so history and closed budget periods shift as FX moves. | Store `base_amount` (in the user's base currency at write time) or a rate snapshot on each transaction. |
| 6 | Medium | `lib/currency.ts`, `lib/exchange-rates.ts` | A missing rate returns the **unconverted** amount, so ₩10,000 gets added as ₱10,000. With no cache and the API down, rates fall back to `{USD:1}` and everything is silently wrong. | Throw or return `null` and show "rate unavailable". Never mix units silently. |
| 7 | Low–Med | `app/actions/transactions.ts` | Converted amounts are stored unrounded (`12.345678…`), and `parseFloat` accepts `"1e3"`. | Round to the currency's minor units (`Intl.NumberFormat(..).resolvedOptions().maximumFractionDigits`) before insert. Validate with a strict regex. |
| 8 | Low | `transactions/page.tsx` | `account` and `category` search params are interpolated into a PostgREST `.or()` filter string. RLS limits the blast radius, but this is still filter injection. | Validate them as UUIDs before use. |
| 9 | Low | `createTransaction` overdraft check | Four queries pull every transaction for the account just to compute one balance. | One query against the `account_balances` view (see §4 S3). |
| 10 | Low | `MobileBottomNav`, `AppShell` | `pb-safe` isn't a Tailwind 4 utility, so it does nothing. There's no `viewport-fit=cover` and the layout uses `h-screen`. Result: the tab bar sits on the home indicator, the last list row hides under the bar, and iOS tap-status-bar-to-scroll-top doesn't work because scrolling happens in an inner `<main>`. | See §4 U1. |
| 11 | Debt | `transactions.ts` | `createTransaction` and `updateTransaction` duplicate about 80 lines of validation and conversion. | Extract one `parseTransactionForm()` helper. |
| 12 | Debt | repo | No tests, no CI, no error tracking. | Add Vitest for `lib/` (budget periods, currency), a GitHub Action running lint, typecheck and tests, and Sentry or Vercel's built-in monitoring. |

---

## 3. Retrofits, upgrades, where to go next

### Retrofits (do these regardless of platform)
- **Move domain math into Postgres.** Balances, period spend, rollover and safe-to-spend become views or RPCs (`security_invoker = true` so RLS still applies). This is the single highest-leverage change. It makes the web app faster (one query instead of N rows shipped to JS), and a future native client can reuse it without re-implementing money logic.
- **One formatting helper:** `formatMoney(amount, currency)` built on `Intl.NumberFormat`. Today amounts are rendered as `${symbol}${n.toFixed(2)}`, which is wrong for JPY, KRW and VND (0 decimals) and for negative-sign placement.
- **One icon map** built from `ICON_NAMES` in `components/ui/icon-picker.tsx`, replacing `import * as LucideIcons` (see S4).
- **Generated DB types** (`supabase gen types typescript`) to remove the `as any` casts around joins.

### Upgrades (features, in value order)
1. **Safe-to-spend** on the dashboard: remaining budget ÷ days left, today's figure first.
2. **Quick log**: keypad-first entry, a remembered last account, the top 6 categories as chips, and optional "repeat last".
3. **Reminders** via Web Push. This works on iOS 16.4+ when the PWA is installed, and the schema fields already exist.
4. **Recurring transactions** (allowance, subscriptions).
5. **CSV export** (already in backlog G4.1).
6. Goals: un-halt only after the above. Retention matters more than more features.

### Where to go next: native?
You're right that this wants to be a mobile app. The options:

| Option | Cost | iOS feel | Verdict |
|---|---|---|---|
| **Harden the PWA** (Part 4) | Low | 80%: no real haptics, no widgets, push only when installed | **Do now.** Most of the work carries over. |
| Capacitor wrapping this Next app | Medium | ~85% | **Skip.** RSC and Server Actions can't be statically exported, and a remote-URL wrapper risks App Store rejection (guideline 4.2). |
| **Expo / React Native** on the same Supabase | High (rewrite about 20 screens) | 100%: native sheets, haptics, widgets, offline SQLite | **Do once retention is proven.** It's cheap to start once the retrofits have moved the logic into Postgres. |

Order: Part 4 → measure 2–4 weeks of tester retention → decide on Expo.

---

## 4. Implementation plan: UX, speed and iOS-grade polish

Each step is small, shippable on its own, and lists the files it touches. Effort is for one developer.

### Phase S: Speed (≈2–3 days)

| Step | Change | Files | Why |
|---|---|---|---|
| S1 | **Remove `FakeSplash`.** iOS already shows the `startupImage` splash, so this only adds about 1.1 s of overlay to every cold load on every platform. | `app/layout.tsx`, delete `components/landing/FakeSplash.tsx` | Fastest win in the repo |
| S2 | **Stop triple auth round-trips.** `getUser()` calls the Auth server in `proxy.ts`, then again in `(app)/layout.tsx`, then again in each page: three network hops before any data loads. Keep one validating call in the proxy. In layouts and pages use `supabase.auth.getClaims()` (verifies the JWT locally with asymmetric keys), wrapped in React `cache()` so it runs once per request. | `proxy.ts`, `lib/supabase/server.ts` (+ `getUserId()` helper), every `app/(app)/**/page.tsx` | −200–600 ms per navigation |
| S3 | **`account_balances` view** (`SUM` by account, `security_invoker`). Replaces shipping every transaction row to JS on the dashboard and accounts pages, and the 4-query overdraft check. | new migration; `dashboard/page.tsx`, `accounts/page.tsx`, `actions/transactions.ts` | Load time stays flat instead of growing with history |
| S4 | **Kill `import * as LucideIcons` in client components.** Seven client files pull the entire icon set into the browser bundle. Export `ICON_MAP` once from `icon-picker.tsx` (only the ~55 curated icons) and look icons up there. | `icon-picker.tsx`, `AccountCard`, `BudgetCard`, `BudgetDetailDialog`, `CategoryCard`, `TransactionCard`, `TransactionDetailDialog`, `dashboard/page.tsx` | Likely the largest JS reduction available. Measure with `next build` |
| S5 | **Parallelize queries.** The layout runs 3 sequential awaits, and the pages run 3–5. Use `Promise.all`. | `(app)/layout.tsx`, dashboard, transactions, budgets, analytics pages | Removes waterfalls |
| S6 | **Cache exchange rates across requests** (they change daily). Use Next 16 `"use cache"` + `cacheLife("hours")`, or `unstable_cache`. Check `node_modules/next/dist/docs` for which is current. | `lib/exchange-rates.ts` | Removes one DB read per page |
| S7 | **Optimistic writes.** `useOptimistic` for add, edit and delete transaction. The sheet closes instantly and the row appears immediately. Roll back with a toast on error. | `TransactionDialog`, `TransactionsPageClient` | Perceived speed is what users feel |
| S8 | **Skeletons, not the mascot loader.** Replace `(app)/loading.tsx` with per-page skeletons matching the final layout (several already exist) and add one for `/categories`. | `app/(app)/loading.tsx`, `categories/loading.tsx` | No layout jump. The cat belongs in empty states |

Done when: Lighthouse mobile ≥ 90 on the dashboard, the first-load JS of `/transactions` is measured and reduced, and no page has sequential Supabase awaits.

### Phase U: iOS foundation (≈2–3 days)

| Step | Change | Files |
|---|---|---|
| U1 | **Safe areas and real document scroll.** Export `viewport = { viewportFit: "cover", themeColor }`. Replace `h-screen` + inner `overflow-y-auto` with normal body scroll, so you get rubber-banding, the collapsing URL bar and tap-status-bar-to-top. Add utilities for `env(safe-area-inset-*)` and use `min-h-dvh`. | `app/layout.tsx`, `AppShell.tsx`, `globals.css`, `MobileBottomNav.tsx` |
| U2 | **Motion tokens as springs.** iOS motion is spring-based, interruptible and has no bounce for UI chrome. Add `lib/motion.ts` with three presets: `snappy` (`type:"spring", visualDuration:0.25, bounce:0`) for taps and toggles, `smooth` (`0.4, bounce:0`) for sheets and pages, and `bouncy` (`0.45, bounce:0.25`) reserved for celebrations. Wrap the app in `<MotionConfig reducedMotion="user">`. Retire the ad-hoc `duration: 0.8 / 1.2` animations. | new `lib/motion.ts`, `app/layout.tsx`, `animated-counter`, `GoalProgressRing`, `CategoryBreakdownChart`, budget bars |
| U3 | **Touch-first press states.** `-webkit-tap-highlight-color: transparent` and `touch-action: manipulation` globally. Pressables get `active:scale-[0.97] active:opacity-80` with a `snappy` release. Gate hover styles behind `@media (hover:hover)` (Tailwind 4 does this by default for `hover:`, so audit inline-style hovers). | `globals.css`, `button.tsx`, cards |
| U4 | **Inputs that don't fight iOS.** Money fields use `type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*"` instead of `type="number"` (which has the wrong keyboard, accepts `e`, and scroll changes the value). Inputs need a font size of at least 16px or Safari zooms on focus. Use `enterKeyHint="done"`. | `TransactionDialog`, `CreateAccountDialog`, `Create/EditBudgetDialog`, `input.tsx` |
| U5 | **Numbers look like Apple's.** Use `formatMoney()` (§3) everywhere. Switch amounts from JetBrains Mono to Inter with `tabular-nums`, so it reads like Apple Wallet rather than a terminal. Keep mono for codes only. | `globals.css`, all cards |

### Phase C: iOS components (≈5–7 days)

| Step | Component | Behavior to match | Notes |
|---|---|---|---|
| C1 | **Bottom sheet** (replace `ResponsiveSheet` on mobile) | Grabber; drag to dismiss with velocity; detents (medium/large); rubber-band at the top; the page behind scales to ~0.94 with rounded corners (iOS card modal); keyboard-aware. | Check whether the installed `@base-ui/react` ships a Drawer. If not, add `vaul`, which is worth the dependency because gesture physics isn't a few lines. Keep the `ResponsiveSheet` API so callers don't change. |
| C2 | **Tab bar** | 49pt + safe area, translucent material (`bg-card/75 backdrop-blur-xl saturate-150`), hairline top border, filled icon for the active tab, no layout shift. Flatten the raised center "+" (that's Material, not iOS) into a normal tab, or move "+" to the nav bar's trailing side. | `MobileBottomNav.tsx` |
| C3 | **Large title nav bar** | 34pt bold title that collapses into a 17pt inline title with a blurred bar on scroll (scroll-linked with Motion's `useScroll`). | `MobileTopBar.tsx` + each page header |
| C4 | **Inset grouped lists** | iOS Settings style: rounded group, 44pt rows, separators inset to the text edge, chevrons on navigable rows. Use for Settings, Accounts, Categories and the "More" menu. | new `components/ui/list.tsx` (one component, two parts: `ListGroup`, `ListRow`) |
| C5 | **Swipe actions + undo** | Swipe a transaction row left to reveal Delete (full swipe commits). Undo toast for 5 s, matching the undo spec in `docs/oreo-premium-interactivity-spec.md` §6.8. | `TransactionCard.tsx` with Motion `drag="x"` |
| C6 | **Action sheets for confirms** | Destructive confirms (sign out, delete) come up from the bottom with a separate Cancel button, instead of Popovers and centered dialogs. | reuse C1 |
| C7 | **Segmented control** | Expense / Income / Transfer as an iOS segmented control with a sliding thumb (Motion `layoutId`). | `TransactionDialog.tsx` |
| C8 | **Keypad-first quick log** | Large centered amount, custom keypad (no OS keyboard jump), category chips below, defaults to last-used account and today, one "Save" button. Target: 3 taps plus the amount. | `TransactionDialog.tsx` (mobile layout) |
| C9 | **Page transitions** | Push/pop slide for drill-ins (list → detail), cross-fade for tab switches. Use React `<ViewTransition>` if Next 16 supports it in this version (check docs for `experimental.viewTransition`). Otherwise skip, since a half-done transition is worse than none. | `next.config.ts`, layouts |

**Haptics:** iOS Safari has no Vibration API, so don't fake it. This is one of the concrete reasons for the native path in §3.

### Phase R: Retention (after S/U/C)
Safe-to-spend dashboard → Web Push reminders → recurring transactions → CSV export. Fix bugs #1–#6 from §2 before or alongside Phase S, because they affect money shown to users. #1 and #3 are one-line fixes plus a test.

### Suggested order
1. Bugs #1, #3, #7, #8 + Vitest + CI (½–1 day)
2. S1, S2, S4, S5 (1 day, biggest speed gains)
3. U1–U5 (2–3 days)
4. S3, S6, S7, S8 + bugs #2, #4–#6 (2–3 days)
5. C1 → C2 → C8 → C4 → C5 → C3 → C6/C7 → C9 (5–7 days)
6. Tester retention check → Phase R or Expo decision
