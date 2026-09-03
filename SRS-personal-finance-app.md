# Software Requirements Specification (SRS)

## Oreo — Personal Finance Tracker

**Version:** 1.0
**Status:** Draft
**Date:** August 29, 2026

---

## 1. Introduction

### 1.1 Purpose

This document specifies the software requirements for Oreo, a personal finance tracking web application. It is intended to guide design and development, and to serve as a shared reference for scope decisions.

### 1.2 Scope

The system is a responsive, installable Progressive Web App (PWA) that allows users to manually track income, expenses, and transfers across multiple accounts and currencies, organize spending into customizable categories, plan budgets and savings goals, and view analytics on their financial activity. The application must be fully usable on both desktop web browsers and mobile devices (installed or browser-based).

The system does **not** include: automated transaction import/logging, bank account linking (Open Banking/Plaid-style integrations), multi-user shared/family accounts, or server-driven push notifications. These are explicitly out of scope for this version.

### 1.3 Definitions

| Term | Definition |
|---|---|
| Account | A container representing where money physically sits (e.g. cash wallet, savings account, e-wallet). Has one fixed currency. |
| Transaction | A logged Expense, Income, or Transfer event. |
| Category | A user-defined label for classifying transactions (e.g. "Groceries", "Salary"), with an associated icon. |
| Goal | A savings target, independent of any specific Account. |
| Budget | A spending limit defined per Category for a recurring period (weekly or monthly), with rollover behavior. |
| Base Currency | A user-configured display currency used to aggregate totals across accounts of differing currencies. |
| PWA | Progressive Web App — installable, offline-capable web application. |

### 1.4 Intended Audience

Developer(s) building the application (Next.js/Supabase/Vercel stack), and the product owner making scope decisions.

---

## 2. Overall Description

### 2.1 Product Perspective

A greenfield web application built on:

- **Frontend/Framework:** Next.js
- **Backend/Database/Auth:** Supabase (Postgres, Auth, Row-Level Security, Realtime)
- **Hosting/Deployment:** Vercel
- **External Service:** Open Exchange Rates API (currency conversion)

### 2.2 Branding

- **App Name:** Oreo — named in memory of a late cat.
- **Mascot:** Black pixel-art cat
- **Color Palette:**

| Swatch | Hex |
|---|---|
| Lightest lavender | `#d8dcff` |
| Soft periwinkle | `#aeadf0` |
| Dusty rose | `#c38d94` |
| Muted mauve | `#a76571` |
| Deep slate purple | `#565676` |

Palette usage should be finalized during UI design (e.g. deep slate purple for primary actions/text, lavender tones for backgrounds, rose/mauve tones for accents or expense-related visual cues), but exact assignment is a design-phase decision, not fixed here.

### 2.3 User Classes

Single class: **Authenticated User**. Each user's data (accounts, transactions, categories, goals, budgets, settings) is fully isolated from other users via Supabase Auth + Row-Level Security. No admin, guest, or shared/family roles are in scope for v1.

### 2.4 Operating Environment

- Modern web browsers (Chrome, Safari, Firefox, Edge) on both desktop and mobile.
- Installable as a PWA on supported mobile OSes (Android/iOS) and desktop OSes.
- Must function with intermittent or no internet connectivity for core transaction logging (see 3.9).

### 2.5 Design and Implementation Constraints

- Must be responsive across mobile and desktop viewports — this is a hard requirement, not a mobile-first-only design. Layouts, navigation, and data-dense views (analytics, transaction lists) must be designed for both contexts.
- Currency conversion relies on a third-party API (Open Exchange Rates); system must degrade gracefully (e.g. use last cached rate) if the API is temporarily unavailable.
- All monetary values must be stored with currency and precision handling appropriate to avoid floating-point rounding errors (e.g. store amounts as integer minor units or use a decimal type).

### 2.6 Assumptions and Dependencies

- User has a Supabase project provisioned with Auth and Postgres.
- Open Exchange Rates free/paid tier provides sufficient request quota for daily rate caching.
- Users are individuals managing personal finances; no business/accounting-grade requirements (e.g. no double-entry bookkeeping, tax reporting, or multi-currency ledger reconciliation) are in scope.

---

## 3. System Features (Functional Requirements)

### 3.1 Authentication & User Management

- FR-1.1: Users can sign up and log in via Supabase Auth (email/password minimum; social providers optional/future).
- FR-1.2: Each user's data is isolated via Row-Level Security; no user can view or modify another user's data.
- FR-1.3: Users can set a **base/display currency** in their profile settings, used for aggregated dashboard totals.
- FR-1.4: Users can log out and reset their password.

### 3.2 Accounts

- FR-2.1: Users can create an Account with a name, type (e.g. Savings, Cash, E-wallet — user-defined or from a preset list), and a fixed currency.
- FR-2.2: Users can edit an Account's name, type, and icon/color. An Account's currency is fixed at creation and cannot be changed afterward, to avoid retroactive conversion ambiguity.
- FR-2.3: Users can archive (soft-delete) an Account. Archiving hides it from active views (transaction entry, active account lists, etc.) while retaining its full transaction history in the database, preserving historical reporting accuracy and Goal contribution totals. Archived Accounts can be restored later.
- FR-2.4: Each Account displays its current balance, computed from its transaction history.

### 3.3 Transactions — Expense, Income, Transfer

- FR-3.1: Users can add an Expense transaction: amount, currency (inherited from account), category, account, date, optional note/attachment.
- FR-3.2: Users can add an Income transaction: amount, category, account, date, optional note.
- FR-3.3: Users can add a Transfer transaction between two of their own Accounts. If accounts differ in currency, the transfer must apply an exchange rate (fetched or cached) to compute the destination amount.
- FR-3.4: Users can edit any transaction (amount, category, account, date, note).
- FR-3.5: Users can delete any transaction; deletion recalculates affected account balances.
- FR-3.6: All transactions are logged manually by the user — no automated or scheduled transaction creation exists in this system.

### 3.4 Categories

- FR-4.1: Users can create custom Categories, each scoped to a transaction type (Expense, Income, or Transfer).
- FR-4.2: Each Category has a name and an icon, selected from a curated fixed icon set (~50–100 icons, e.g. sourced from Lucide).
- FR-4.3: Users can edit a Category's name and icon.
- FR-4.4: Category deletion is blocked while any transaction references that Category. Users must first reassign or remove those transactions (e.g. via a bulk-reassign action) before the Category can be deleted.
- FR-4.5: A default set of common categories should be pre-seeded for new users (e.g. Groceries, Transport, Salary), which users can then edit or delete.

### 3.5 Savings Goals

> **⚠️ HALTED — This feature will not be developed yet.** The annotation-based contribution model (allocating income to goals without physically separating funds) has an integrity problem: goal progress can become misleading when the user spends money that was "allocated" to a goal. These requirements are preserved for future reference. A redesigned approach (e.g., account-linked goals) may be revisited post-v1.

- FR-5.1: Users can create a Goal with a name, target amount, and optional target date. Goals are account-agnostic — a Goal is not tied to any specific Account, so it can be funded from income logged against any of the user's Accounts.
- FR-5.2: When logging Income, users can optionally allocate the amount (or a portion) toward any Goal, regardless of which Account the income is logged against.
- FR-5.3: Goal progress (current allocated amount vs. target) is displayed on the Goal itself, and can be viewed as a rolled-up total across all contributing Accounts/transactions.
- FR-5.4: Users can edit or delete a Goal without affecting the underlying transactions (deleting a goal removes the goal label, not the money/transactions).

### 3.6 Budget Planner

- FR-6.1: Users can create a Budget for a specific Category, specifying a limit amount and a period type: **Weekly**, **Monthly**, or **Custom** (user-defined start and end date).
- FR-6.1a: Weekly and Monthly periods repeat automatically. Custom periods do not auto-repeat — the user manually defines a new Custom period for that Category when ready, at which point rollover (FR-6.3) is applied from the prior period if applicable.
- FR-6.2: The system tracks actual spending against the budgeted category for the current period and displays progress (e.g. amount spent / limit).
- FR-6.3: At the end of a period, the following period's effective limit is adjusted by the prior period's variance: unused amounts **increase** the next period's effective limit (surplus rollover); overspent amounts **reduce** the next period's effective limit dollar-for-dollar (deficit rollover). Effective limit = base limit ± prior period's variance.
- FR-6.4: Users can edit or delete a Budget at any time; edits take effect from the current period forward (historical periods are not retroactively recalculated).
- FR-6.5: Multi-currency budgets are computed in the category's transactions' account currencies, converted to base currency for display, consistent with dashboard aggregation (3.7).

### 3.7 Analytics Dashboard

- FR-7.1: Category breakdown view — spending (and income) grouped by category, displayed as pie/bar charts, filterable by date range.
- FR-7.2: Trends-over-time view — income vs. expense over time, displayed as a line/area chart, filterable by date range and account.
- FR-7.3: Budget vs. actual view — progress bars or similar visualization per active budget, showing spent vs. limit vs. rollover-adjusted limit.
- FR-7.4: All dashboard monetary totals are converted to the user's base currency using cached exchange rates (see 3.8).
- FR-7.5: Dashboard must be usable on both mobile and desktop viewports, with charts resizing/reflowing appropriately.

### 3.8 Multi-Currency Support

- FR-8.1: Each Account has one fixed currency, set at creation.
- FR-8.2: Exchange rates are fetched from the Open Exchange Rates API and cached (daily refresh) to avoid excessive API calls.
- FR-8.3: All cross-currency aggregation (dashboard totals, cross-currency transfers) uses the cached rate at time of computation/transaction.
- FR-8.4: If the exchange rate API is unavailable, the system falls back to the last successfully cached rate and indicates to the user that the rate may be stale.

### 3.9 Offline Support & Sync (PWA)

> **⚠️ HALTED / ROLLED BACK — Full offline data mutation will not be developed.** The application is built on an online-first architecture (Next.js Server Components, Server Actions). Bolting on an offline-first sync engine creates massive architectural friction. The app will remain online-first. Basic PWA installability (FR-9.1) and Live Multi-Device Sync (FR-9.6) are still supported.

- FR-9.1: The application is installable as a PWA on both mobile and desktop platforms.
- FR-9.2: Users can log Expense/Income/Transfer transactions while offline; these are queued locally.
- FR-9.3: When connectivity is restored, queued transactions automatically sync to the server.
- FR-9.4: Conflict resolution uses a **last-write-wins** strategy based on client-side timestamp, applied only in the rare case of the same record being edited on two devices while offline.
- FR-9.5: Offline support is a fast-follow phase after core CRUD functionality is stable — not required for initial MVP launch, but must be architected for from the start (e.g. local-first data layer) to avoid rework.
- FR-9.6: **Live multi-device sync (v1 requirement, distinct from offline queueing above):** while online, changes made on one device (e.g. logging a transaction on mobile) are pushed live to any other open, connected session for that user (e.g. a desktop browser tab already open) via Supabase Realtime, without requiring a manual refresh or navigation.

### 3.10 Daily Reminder Notification

> **⚠️ HALTED — This feature will not be developed.** The feature relies on client-side scheduled notifications, which cannot reliably wake up a closed progressive web app (PWA) on iOS or Android. Because a push server is out of scope for v1, this feature has been skipped. Requirements are preserved below for historical context.

- FR-10.1: The app sends a local (client-side) daily reminder notification prompting the user to log their transactions.
- FR-10.2: The reminder time is fully user-configurable and can be changed at any time in settings.
- FR-10.3: This is implemented via the browser Notification API and a client-side schedule check — no backend/server-triggered push infrastructure is required.
- FR-10.4: Notification requires user permission grant; app must handle the case where permission is denied or unavailable (e.g. iOS Safari PWA constraints).

### 3.11 Responsive UI/UX

- FR-11.1: All views (transaction entry, accounts, categories, budgets, goals, analytics, settings) must be fully functional and usable on both mobile-sized and desktop-sized viewports.
- FR-11.2: Navigation pattern should adapt to context (e.g. bottom navigation or drawer on mobile, sidebar on desktop) while preserving access to all features in both.
- FR-11.3: The app's branding (color palette, pixel-cat mascot) is applied consistently across breakpoints.

---

## 4. External Interface Requirements

### 4.1 User Interfaces

- Web-based responsive UI (Next.js), installable as a PWA.
- Icon set for categories sourced from a curated fixed library (e.g. Lucide subset).

### 4.2 Software Interfaces

- **Supabase**: Auth, Postgres database, Row-Level Security policies, Realtime (required for live multi-device sync, see FR-9.6).
- **Open Exchange Rates API**: daily exchange rate fetch, cached server-side or via scheduled Supabase function.
- **Vercel**: hosting, deployment, serverless functions (if needed for scheduled rate fetching).

### 4.3 Communications Interfaces

- HTTPS for all client-server communication.
- Service Worker for offline caching and PWA installability.

---

## 5. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | The application must be responsive and fully usable on both desktop and mobile browser widths. |
| NFR-2 | Monetary calculations must avoid floating-point rounding errors (use decimal-safe storage/arithmetic). |
| NFR-3 | User data must be isolated per account via Row-Level Security; no cross-user data leakage. |
| NFR-4 | **(HALTED)** ~~The app must remain usable for transaction logging without an internet connection once offline support ships.~~ (App is strictly online-first). |
| NFR-5 | Exchange rate lookups must not block transaction entry; cached rates are used by default. |
| NFR-6 | The UI must reflect the defined color palette and pixel-cat branding consistently. |
| NFR-7 | Page load and interaction performance should feel instant for core flows (add/edit/delete transaction) — target sub-second UI feedback, with sync happening in the background where applicable. |

---

## 6. Resolved Decisions Log

The following were originally open questions and have since been resolved; kept here for traceability. See the referenced requirements for full detail.

1. **Account deletion** → Soft-delete/archive (FR-2.3). Transaction history is retained, not cascaded or hard-deleted.
2. **Category deletion** → Blocked while any transaction references the Category (FR-4.4).
3. **Budget rollover formula** → Surplus/deficit carries dollar-for-dollar into the next period's effective limit (FR-6.3).
4. **Account currency immutability** → Confirmed: fixed at creation, cannot be changed (FR-2.2).
5. **Category presets** → Confirmed: a default set will be pre-seeded; exact names/icons to be finalized during UI design (FR-4.5).

---

## 7. Out of Scope (v1)

- Bank/institution account linking or automated transaction import.
- Automated or scheduled recurring transaction creation (all logging is manual by design).
- Server-driven/cloud push notifications (reminder is local/client-side only).
- Multi-user shared, family, or joint accounts.
- Admin roles or multi-tenant management.
- Double-entry accounting, tax reporting, or invoicing features.

---

## 8. Future Considerations (Post-v1)

- Smart/adaptive reminder timing based on user logging habits.
- Expanded or searchable icon library, or custom icon uploads.
- Shared/family account support.
