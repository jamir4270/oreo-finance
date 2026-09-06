# Oreo — Personal Finance Tracker

Oreo is a cozy, playful, yet highly capable personal finance tracking web application. Designed to be a daily utility, it helps you manually track income, expenses, and transfers, organize spending, plan budgets, and view analytics on your financial activity across multiple accounts and currencies.

## Features

- **Multi-Currency Support:** Manage accounts in different currencies, with automatic cross-currency transfer calculations powered by Open Exchange Rates API.
- **Budgeting with Rollover:** Create weekly, monthly, or custom budgets per category. Surpluses or deficits carry over to the next period.
- **Realtime Sync:** Log a transaction on your phone, and see it instantly appear on your desktop without refreshing.
- **Progressive Web App (PWA):** Installable on both mobile and desktop platforms for a native-like experience.
- **Analytics Dashboard:** Visualize spending breakdowns, trends over time, and budget progress.
- **Cozy Design:** A warm, approachable UI with soft shapes, careful typography (Fredoka, Inter, JetBrains Mono), and a signature black pixel-art cat mascot.

## Tech Stack

- **Frontend:** Next.js (App Router), React 19, TypeScript
- **Styling & UI:** Tailwind CSS, shadcn/ui (powered by `@base-ui/react`), Motion (animations)
- **Backend & Database:** Supabase (Postgres, Auth, Row-Level Security, Realtime)
- **Hosting:** Vercel
- **External Services:** Open Exchange Rates API (currency conversion)
