# Action Plan — Phase G (Senior Review Fixes)

Following your team's own convention (`oreo-v1-action-plan.md` Phases A–E, `oreo-phase-f-public-testing.md` = Phase F), this continues as **Phase G**.

### Phase G1 — Fix now (correctness bugs, small diffs, high tester-visible impact)
- [ ] **G1.1** Fix the stale-toast/auto-close bug in `EditCategoryDialog.tsx` and `EditAccountDialog.tsx`: make the parent's `onOpenChange` stable with `useCallback`, *and* key each dialog by `category?.id` / `account?.id` so React remounts (and resets `useActionState`) when the target changes — mirroring how `EditBudgetDialog` already avoids this for free. This is cleaner than bolting on a `useRef` guard per dialog, since it fixes the root cause (state persisting across different targets) rather than just masking the symptom.
- [ ] **G1.2** Add missing `--destructive-foreground` / `--color-destructive-foreground` tokens in `globals.css`. One-line-ish fix, resolves contrast on every destructive confirm dialog at once.
- [ ] **G1.3** Add `min-w-0` / `truncate` to `CategoryCard.tsx`'s name row, matching `AccountCard.tsx`.

### Phase G2 — Data integrity (small but real; do before more people set up budgets)
- [ ] **G2.1** Add a `currency` column to `budgets` (default = `base_currency` at creation); convert `limit_amount`/`base_limit`/`effective_limit` through `convertCurrency()` wherever they're displayed, the same way `computeActualSpent` already is. This is the real version of the "currency switch corrupts data" bug.
- [ ] **G2.2** (Optional, smaller) Show a currency tag/code next to amounts in `TransactionCard.tsx` / `TransactionDetailDialog.tsx` for clarity, even though no corruption exists there today.

### Phase G3 — UX polish
- [ ] **G3.1** Add a Sign Out affordance to `DesktopSidebar.tsx`'s footer and the mobile "More" sheet, reusing the existing Popover-confirm pattern from `SettingsClient.tsx`. On desktop, the footer is already occupied by the "Give Feedback" button (`components/layout/DesktopSidebar.tsx`, the `<div className="p-4 border-t border-border mt-auto">` block) — don't replace or crowd that link. Instead, either stack Sign Out as its own row above/below Feedback within that footer block, or move Sign Out into a separate small element (e.g. next to the "Oreo" brand header at the top of the sidebar). Confirm the exact placement before implementing. Keep (or remove) the Settings entry per preference.
- [ ] **G3.2** Non-blocking overdraft warning in `createTransaction()` — compute pre-transaction balance, return a warning string alongside success, toast it client-side without blocking submission.

### Phase G4 — Backlog (real, but not urgent)
- [ ] **G4.1** CSV export (baseline) and import (stretch) of transactions.
- [ ] **G4.2** Surface the existing 1-hour session timeout to the user; evaluate PIN/biometric lock as a separate, larger effort.

### Not actioning (push back / clarify instead)
- **Offline/PWA sync** — deliberate, documented architectural decision (SRS §3.9, build-phases Phase 17). Recommend syncing with the reviewer on whether their concern is "the feature is missing" (already decided against, for good reason) vs. "the marketing copy overpromises" (a copy fix, not an engineering one).
- Ask your senior for the missing items **2, 3, 4, and 7** from the numbered list in the original review — earlier validation couldn't check what wasn't included.
