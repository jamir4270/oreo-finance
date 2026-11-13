# Oreo — Personal Finance Tracker

Oreo is a manual-entry personal finance tracker. You log income, expenses and transfers across multiple accounts and currencies, set budgets per category, and see where your money goes. It runs as an installable PWA with a pixel-art cat mascot.

> **Status:** public prototype. Test data may be reset. See [docs/ROADMAP.md](docs/ROADMAP.md) for known issues and the plan forward.

## Features

- **Accounts:** cash, savings, e-wallet or custom accounts, each in its own currency. Balances are computed from transactions, not stored.
- **Transactions:** expense, income and transfer. You can enter an amount in a foreign currency and it is converted into the account's currency. Cross-currency transfers record the rate used.
- **Budgets:** daily, weekly, monthly or custom periods per category, with rollover. Unspent money carries forward and overspending carries a deficit.
- **Analytics:** category breakdown, income/expense trends and budget health.
- **Multi-currency:** one base currency for totals. Rates come from Open Exchange Rates and are cached in Postgres for 24 hours. A banner appears when rates are stale.
- **PWA:** installable, with iOS splash screens and an offline fallback page. It does not support offline data entry.

Not built yet (planned in the schema): savings goals, realtime sync between devices, reminders and CSV import/export.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions, `proxy.ts`), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui on `@base-ui/react`, Motion, Recharts, Sonner, lucide-react |
| Backend | Supabase: Postgres, Auth and Row-Level Security |
| Bot protection | Cloudflare Turnstile on sign-up |
| Hosting | Vercel, plus a weekly cron to `/api/keepalive` so the free-tier database doesn't pause |

> Next.js 16 differs from older versions (`middleware.ts` → `proxy.ts`, async `params`/`searchParams`, and so on). Read `node_modules/next/dist/docs/` before changing framework code. See `AGENTS.md`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npx supabase start           # optional: local Postgres; otherwise point at a hosted project
npx supabase db push         # apply supabase/migrations
npm run dev
```

### Environment variables

| Variable | Used by | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client + server | Publishable (anon) key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Only used to write the shared `exchange_rates` cache. Never expose it. |
| `OPENEXCHANGERATES_APP_ID` | server only | Free tier is enough (one fetch per day) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | client | Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | server only | Cloudflare Turnstile verification |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |

There is no test suite yet. See the roadmap.

## Project layout

```
app/
  (auth)/        login, signup, onboarding, reset/update password
  (app)/         authenticated pages: dashboard, transactions, accounts, budgets, categories, analytics, settings
  actions/       server actions, one file per domain (all writes go through here)
  api/keepalive  cron target
proxy.ts         session refresh, route protection, onboarding redirect
components/
  ui/            shadcn primitives + house components (mascot, responsive-sheet, icon-picker, ...)
  layout/        AppShell, DesktopSidebar, MobileTopBar, MobileBottomNav
  <domain>/      page clients, cards and dialogs per feature
lib/
  supabase/      server / browser / proxy clients
  budget-periods.ts   period bounds, lazy period creation, rollover
  currency.ts, exchange-rates.ts
supabase/migrations   source of truth for the schema
public/sw.js     service worker (offline fallback only)
```

## Documentation

| Doc | Purpose |
|---|---|
| [docs/ROADMAP.md](docs/ROADMAP.md) | **Start here.** Product critique, known bugs, upgrade path and the UX/speed implementation plan |
| [docs/SRS-personal-finance-app.md](docs/SRS-personal-finance-app.md) | Original requirements |
| [docs/database-schema.md](docs/database-schema.md) | Schema rationale. `supabase/migrations/` wins if they disagree |
| [docs/oreo-design-spec.md](docs/oreo-design-spec.md) | Visual identity, voice and layout |
| [docs/oreo-premium-interactivity-spec.md](docs/oreo-premium-interactivity-spec.md) | Motion and personality spec |
| [docs/archive/](docs/archive/) | Completed build phases and past action plans (history only) |
