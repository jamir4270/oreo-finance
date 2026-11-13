# Design Specification — Oreo (Personal Finance Tracker)

**Version:** 1.0 · **Status:** Draft · **Companion to:** Oreo SRS v1.0

This document translates the SRS into visual and UX direction: how the app should look, feel, and behave across breakpoints. It covers identity, layout patterns, and key screens at a high level — not a full component library. Component-level specs (exact button states, form field variants, etc.) can follow once this direction is validated.

---

## 1. Design Personality

Oreo is **cozy and playful, not cutesy-childish**. It's a finance app people will open daily, sometimes to face numbers they're not thrilled about — the softness of the design should make that easier, not undercut the seriousness of the data. Think: a warm, competent friend helping you track money, not a game.

Guiding principles:
- **Rounded, soft, approachable** — generous corner radii, soft shadows instead of hard borders, breathing room between elements.
- **Mascot-forward, but purposeful** — the pixel-art cat shows up at meaningful moments (empty states, milestones, onboarding), not as decoration scattered across every screen.
- **Numbers stay legible and serious** — playfulness lives in chrome, illustration, and micro-interaction; monetary figures and data displays stay clean, high-contrast, and unambiguous.
- **Quiet confidence** — one signature moment per screen at most. Everything else stays calm so the cat and the key number can stand out.

---

## 2. Color System

Using the palette fixed in the SRS (§2.2), assigned by role:

| Role | Color | Hex | Usage |
|---|---|---|---|
| Background (primary) | Lightest lavender | `#d8dcff` | App background, card backgrounds on desktop |
| Background (surface) | White / near-white | tint of `#d8dcff` at ~95% | Cards, sheets, modals — keeps lavender as an ambient tone, not everywhere |
| Primary / interactive | Deep slate purple | `#565676` | Primary buttons, active nav state, headings, links |
| Secondary accent | Soft periwinkle | `#aeadf0` | Selected states, chart series, progress fills, secondary buttons |
| Expense / warm accent | Muted mauve | `#a76571` | Expense amounts, over-budget states, destructive actions |
| Expense highlight | Dusty rose | `#c38d94` | Expense category chips, expense chart segments |
| Income / positive | Dusty teal | `#5f8f8a` (accent `#93bcb7`) | Income amounts, positive balance states, "under budget" indicators |

Dusty teal was added as an extension to the SRS's fixed palette (§2.2) specifically to give income/positive states a color distinct from the lavender-mauve-purple family, confirmed as the studio's recommended option.

Color usage rules:
- Deep slate purple is the only color used for primary CTAs and active navigation — keeps a single, consistent "this is actionable/selected" signal.
- Mauve/rose are reserved for expense-related meaning (amounts, over-budget bars, expense chart slices). Dusty teal is reserved for income/positive meaning (income amounts, under-budget states, positive balances). Don't use either decoratively elsewhere, or the "this means spending vs. earning" signal gets diluted.
- Lavender/periwinkle carry backgrounds, neutral chrome, and non-financial UI. They should never be the only thing distinguishing an expense from income in a chart — pair color with position/label/icon for accessibility.

---

## 3. Typography

Two type roles plus one data-specific treatment:

- **Display (headings, nav labels, mascot-adjacent copy):** **Fredoka** — rounded, friendly geometric sans. This is where the "cozy" personality lives. Used for page titles, section headers, and empty-state messages. Not used for body paragraphs or data.
- **Body / UI text:** **Inter** for labels, descriptions, settings, and general UI text. Clean and highly legible; neutral, doesn't compete with Fredoka.
- **Monetary / tabular data:** **JetBrains Mono** for all amounts — transaction lists, balances, budget progress. This keeps figures scannable and aligned in columns, and gives money a distinct rhythm from prose, reinforcing "this is data you can trust" even inside a playful shell.

Confirmed pairing: Fredoka + Inter + JetBrains Mono.

Type scale should be generous rather than dense — this is not a data-terminal aesthetic. Comfortable line heights, clear hierarchy between page title / section header / body / caption.

---

## 4. Iconography & Mascot

- **Category icons:** Lucide subset per FR-4.2, ~50–100 icons. Rendered with rounded stroke caps to match the soft aesthetic (Lucide's default stroke works well here — avoid mixing in a sharper icon set).
- **Mascot (pixel-art black cat):** appears in a small, fixed set of contexts so it stays meaningful:
  - Empty states (no transactions yet, no goals yet, no budgets set) — cat with a short, encouraging line in the interface's voice.
  - Goal milestones (25/50/75/100% reached) — small celebratory appearance, not a full-screen takeover.
  - Onboarding / first-run.
  - Optionally, a small idle presence near the "add transaction" action, to make the core daily action feel inviting.
  - **Not** used as a persistent chrome element (no mascot in the nav bar or header on every screen) — that would dilute it into decoration.
- Pixel-art rendering should stay crisp (no blur/anti-aliasing artifacts) — render at fixed pixel-multiples, not arbitrary scaled sizes.

---

## 5. Layout Patterns

Per FR-11.1–11.3, every view must work fully on both mobile and desktop — this is not a mobile-first-only app with a desktop afterthought.

**Mobile (< 768px):**
- Bottom navigation bar, 5 slots: **Home** (dashboard), **Transactions**, **Add** (center, emphasized — primary action), **Budgets/Goals**, **More** (categories, analytics entry, settings).
- Single-column layouts throughout; cards stack vertically.
- Add-transaction is a bottom sheet or full-screen modal, not a separate page navigation, to keep the core loop fast.

**Desktop (≥ 1024px):**
- Left sidebar navigation, persistent: Dashboard, Transactions, Accounts, Categories, Budgets, Goals, Analytics, Settings.
- Multi-column layouts where it aids scanning — e.g. transaction list + filters side-by-side, or dashboard cards in a grid rather than a single stack.
- Add-transaction as a modal/dialog over the current view rather than a full navigation.

**Tablet (768–1024px):** treat as a bridge — collapsible/icon-only sidebar or a top tab bar, single-to-two-column content depending on view. Don't design a third bespoke layout; adapt the mobile and desktop patterns.

Navigation must expose all features at every breakpoint (FR-11.2) — nothing mobile-only or desktop-only.

---

## 6. Key Screens

### 6.1 Dashboard
- Leads with the base-currency aggregate balance (large, tabular-numeral figure) — this is the single most important number in the app and should be the visual anchor.
- Below: quick account balances (horizontally scrollable cards on mobile, grid on desktop), recent transactions, active budget progress (compact), goal progress (compact).
- Empty state (new user, no accounts/transactions yet): mascot + short prompt to add first account/transaction.

### 6.2 Transactions
- Chronological list, grouped by date, tabular-numeral amounts right-aligned, category icon + color left-aligned.
- Expense amounts in mauve, income in the positive accent (see §2 gap), transfers in neutral slate.
- Filters (account, category, date range, type) — a sheet/drawer on mobile, inline panel on desktop.
- Add/Edit transaction form: type selector (Expense/Income/Transfer) first, since it determines which fields appear next (category+account vs. two accounts).

### 6.3 Accounts
- Card per account: name, type icon, currency, current balance in its own currency.
- Archived accounts hidden by default, accessible via a clearly labeled "Archived" toggle/section (not deleted — FR-2.3).
- Currency shown as fixed/locked visual affordance (e.g. a small lock icon) once an account has any transactions, reinforcing FR-2.2's immutability.

### 6.4 Categories
- Grid of category chips (icon + name + color), separated by transaction type (Expense/Income/Transfer tabs or sections).
- Delete action on a category with existing transactions is disabled with an inline explanation and a "reassign transactions" shortcut, rather than a silent block (FR-4.4).

### 6.5 Budgets
- Card per active budget: category, progress bar (spent vs. effective limit), rollover indicator (small "+" or "−" badge showing carried-over amount from FR-6.3) so the user can see *why* their limit moved.
- Over-budget state uses mauve/rose, on-track uses periwinkle/slate — never color alone; always paired with a numeric label ("$40 over" / "$120 left").

### 6.6 Goals

> **⚠️ HALTED — This screen will not be developed yet.** See build-phases.md Phase 11 for rationale. Design direction preserved for future reference.

- Card per goal: name, target date (if set), progress ring or bar, rolled-up total from contributing accounts (FR-5.3).
- Milestone moments (25/50/75/100%) are where the mascot celebration appears.

### 6.7 Analytics
- Category breakdown (pie/bar), trends-over-time (line/area), budget-vs-actual — per FR-7.1–7.3.
- Charts use the palette's expense/positive-accent split consistently with the rest of the app so a user doesn't have to relearn color meaning per screen.
- Date-range and account filters persist across the three analytics views in a single session.

### 6.8 Settings
- Base currency selection, notification/reminder time (FR-10.2), account management, sign out.
- Straightforward list/form layout — this screen doesn't need mascot or extra personality; it's a utility screen.

---

## 7. Voice & Microcopy

- **Active voice, plain verbs, sentence case** — "Add transaction," not "Transaction Submission."
- **Empty states are invitations, not apologies** — e.g. "No transactions yet — add your first one" rather than "You have no transactions."
- **Errors are direct, not cute** — even though the mascot is playful, error/failure states drop the whimsy and state plainly what happened and what to do (e.g. "Couldn't reach the exchange rate service — showing last saved rate"). The cat shows up for warmth in empty/success states, not to soften failures.
- Action labels stay consistent through a flow (a button that says "Save changes" doesn't become "Changes submitted" — it stays "Changes saved").

---

## 8. Motion

Kept deliberate and light — this is a daily-use utility app, not a showcase:
- Micro-interactions on core actions: a small satisfying confirmation when a transaction is added (not a full animation sequence).
- Budget/goal progress bars animate on load/update rather than snapping instantly.
- Mascot moments (milestones, empty states) can carry a small idle animation (blink, tail flick) — subtle, looping, not attention-grabbing.
- Respect `prefers-reduced-motion` throughout.

---

## 9. Resolved Decisions Log

1. **Positive/income accent color** — resolved. Dusty teal (`#5f8f8a` / `#93bcb7`) added as a palette extension for income/positive states (§2).
2. **Typography** — resolved. Fredoka (display) + Inter (body) + JetBrains Mono (monetary/tabular data) (§3).
3. **Next step** — confirmed. A full component-level spec (buttons, form fields, states, spacing scale) follows this document once implementation begins.
