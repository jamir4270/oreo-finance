# Oreo — Premium Interactivity & Personality Spec

**Version:** 1.0 · **Status:** Draft · **Companion to:** SRS v1.0, `database-schema.md`, `build-phases.md`, `oreo-design-spec.md`
**Purpose:** This doc is the "polish pass" reference for **Phase 18 — Full Responsive & Branding Polish**. It goes page-by-page and component-by-component and specifies exactly what to add so Oreo stops feeling like "a well-organized shadcn app" and starts feeling like a **designed product with a personality**. It also specs a **marketing landing page** (currently absent) and the **PWA splash screen** (currently absent).

Nothing here contradicts the SRS or schema — this is presentation-layer only. Halted features (Goals, Daily Reminder, Offline Sync) are noted but not polished until un-halted.

---

## 0. Stack Notes (so recommendations are drop-in, not aspirational)

Current confirmed stack, from `package.json` / `components.json`:

- Next.js 16 (App Router), React 19, TypeScript, Tailwind v4
- `shadcn` with the **`base-nova`** style, backed by **`@base-ui/react`** (not Radix) — so any "add a Popover/Tooltip/Dialog" instruction below means `npx shadcn@latest add <component>`, which will generate a Base UI–backed wrapper, not Radix.
- `lucide-react` for icons, `class-variance-authority` + `clsx` + `tailwind-merge` for variants.
- Fonts already wired in `app/layout.tsx`: Fredoka (display), Inter (body), JetBrains Mono (numbers).
- Palette tokens already in `app/globals.css` as `--color-oreo-*` and shadcn semantic tokens.

**New dependencies to add for this pass:**

| Package | Why |
|---|---|
| `motion` (Framer Motion successor, formerly `framer-motion`) | Page/element transitions, layout animations, gesture-based hover/press states, the odometer-style number counter. |
| `@base-ui/react` additions via `npx shadcn add popover hover-card tooltip dialog sheet toast progress skeleton separator badge` | You already depend on `@base-ui/react`; these are the specific primitives this doc references and don't exist yet in the component list. |
| `canvas-confetti` (tiny, ~3kb) | Goal-milestone celebration mentioned in `oreo-design-spec.md` §4, currently unspecified *how*. |
| `recharts` (already allow-listed for artifacts; add as a real dependency here) | Category breakdown / trends charts (FR-7.1, FR-7.2). |

---

## 1. The Core Problem With "Premium But Generic"

Most of what makes an app feel premium isn't more features — it's:

1. **Everything responds.** Every interactive element has a hover, focus, active/pressed, disabled, and loading state, and the transition between them is never instant (`transition-all` alone isn't enough — needs consistent duration/easing tokens).
2. **Nothing pops in — things arrive.** Lists stagger in. Modals scale+fade, not just fade. Numbers count up, not snap.
3. **The brand shows up in the boring moments**, not just the fun ones — loading states, error states, empty states, 404s, the favicon, the splash screen.
4. **One shape language, repeated on purpose.** Right now the palette/type system is defined but the *shape* vocabulary (corner radii, blob accents, the cat) isn't systematized — add a deliberate "Oreo motif" (see §2.6).

---

## 2. Global System Upgrades (apply once, inherited everywhere)

### 2.1 Motion tokens

Add to `app/globals.css` under `@theme inline`:

```css
--ease-oreo: cubic-bezier(0.22, 1, 0.36, 1); /* snappy-but-soft, "paw landing" */
--ease-oreo-in: cubic-bezier(0.5, 0, 0.75, 0);
--duration-xs: 120ms;
--duration-sm: 180ms;
--duration-md: 260ms;
--duration-lg: 400ms;
```

Rules of thumb:
- Hover/focus feedback: `duration-xs`–`duration-sm`.
- Modal/sheet open, list item enter: `duration-md`, `ease-oreo`.
- Page-level transitions, celebration moments: `duration-lg`.
- Never use a linear easing for anything the user's eye follows (progress bars can be linear while actively filling, but their *appearance* should ease in).

### 2.2 Elevation system (shadows currently ad hoc, inline `boxShadow` in `app/page.tsx`)

Replace inline shadow strings with tokens:

```css
--shadow-oreo-sm: 0 1px 3px rgba(86,86,118,0.06), 0 1px 2px rgba(86,86,118,0.04);
--shadow-oreo-md: 0 4px 24px rgba(86,86,118,0.08), 0 1px 4px rgba(86,86,118,0.04);
--shadow-oreo-lg: 0 12px 40px rgba(86,86,118,0.14), 0 4px 12px rgba(86,86,118,0.06);
--shadow-oreo-glow-primary: 0 0 0 4px rgba(86,86,118,0.12); /* focus ring alt */
```

Map to Tailwind utilities (`shadow-oreo-sm/md/lg`) via `@theme inline`. Card resting state = `sm`, hover = `md`, dragged/active modal = `lg`.

### 2.3 Hover/focus/active state matrix (apply to every clickable surface)

| State | Treatment |
|---|---|
| Rest | Base surface (`bg-card`), `shadow-oreo-sm` |
| Hover | Lift 2px (`translate-y-[-2px]`), `shadow-oreo-md`, background shifts toward `--color-oreo-surface`, `duration-sm ease-oreo` |
| Focus-visible | 2px `--color-oreo-periwinkle` ring with 2px offset — **never remove focus rings**, just restyle them on-brand |
| Active/pressed | Scale `0.98`, shadow drops back to `sm`, `duration-xs` |
| Disabled | Opacity 50%, no hover transform, cursor `not-allowed` |
| Loading | Content replaced by skeleton shimmer (see §2.7), never a layout-shifting spinner-in-place-of-text |

The `Button` component (`components/ui/button.tsx`) currently only has `active:not-aria-[haspopup]:translate-y-px` — extend this to the full matrix above, and add `hover:shadow-oreo-sm` for `default`/`secondary` variants so buttons visibly lift.

### 2.4 Cursor & pointer personality

- Default cursor stays system default (accessibility) EXCEPT:
- On the **landing page only**, use a custom two-layer cursor: a small periwinkle dot with a lagging slate-purple ring (classic "premium site" cursor, built with `motion`'s `useSpring` tracking `pointermove`). Disabled entirely on touch devices and respects `prefers-reduced-motion`.
- Draggable elements (icon picker reorder, if ever added) get `cursor-grab` / `cursor-grabbing`.

### 2.5 Sound: skip it

Do not add audio feedback. It's high-effort, easy to get wrong (autoplay policies), and the design spec's "quiet confidence" principle (§1) argues against it. Skip.

### 2.6 The "Oreo motif" — a repeatable, distinctive shape language

Right now the differentiator is only color + Fredoka. Add **one consistent geometric motif** used sparingly across the product so it reads as designed, not templated:

- **The "bite mark" corner.** A single rounded-concave notch (like a bite taken out of a cookie) applied to exactly one corner of hero cards / the dashboard's big balance card / the landing page hero image frame. Implement as an SVG `clip-path` (`clip-path: path(...)`), not a border-radius trick, so it stays crisp. Use it maybe 3–4 times total across the whole app — it's a signature, not a pattern.
- **Two-tone card edge.** Cards that represent money "leaving" (expenses, over-budget) get a 3px mauve/rose top edge; money "entering" (income, under-budget) gets a 3px dusty-teal top edge. Cheap to build (`border-t-[3px]`), reinforces the existing color-meaning rules in the design spec, and adds visual rhythm to otherwise identical card grids.
- **Paw-print bullet/divider.** A tiny 12px paw-print SVG (matching the pixel-cat's foot) used as a list bullet in empty states and the landing page feature list instead of a generic dot. One asset, reused.

### 2.7 Loading states — skeletons, not spinners

Every list/card that fetches data (Accounts, Transactions, Budgets, Analytics) needs a **skeleton** version shaped exactly like the real content (same card dimensions, shimmering placeholder blocks), not a centered spinner. Use `shadcn`'s `skeleton` component with a shimmer animation using `--color-oreo-surface` → `--color-oreo-lavender` gradient sweep, `duration-lg`, infinite loop, respecting `prefers-reduced-motion` (fall back to a static pulse).

### 2.8 Number animation

All monetary figures that change (balance after a transaction, budget progress) should **count/roll** from old value to new value over ~500ms using `motion`'s `useMotionValue` + `animate()`, formatted through the existing `decimal.js`-safe formatter at render time (never animate the raw float — animate a display-only interpolated number, keep the underlying value exact). Respect `prefers-reduced-motion` → snap instantly.

### 2.9 Reduced motion & accessibility baseline

Wrap every animation in a `useReducedMotion()` check (from `motion`) or CSS `@media (prefers-reduced-motion: reduce)` fallback. This is a hard requirement, not optional polish — it was implicit in the original design spec's §8 and should be explicit here.

---

## 3. New: Marketing Landing Page

Nothing today serves signed-out visitors except the app shell itself (Phase 6 builds authenticated routes only). Add a real **`/` marketing page** for logged-out users, redirecting authenticated users straight to `/dashboard`.

### 3.1 Structure

| Section | Content | Interactivity |
|---|---|---|
| **Nav** | Logo + wordmark, "Log in" ghost button, "Get started" primary button | Sticky, background goes from transparent to `bg-card`+shadow on scroll (`motion`'s `useScroll`) |
| **Hero** | Big Fredoka headline, one sentence of Inter subtext, primary CTA, and the pixel-cat mascot sitting next to an animated JetBrains-Mono balance counter that loops through a few fake numbers ("$1,204.50 → $3,880.12 → …") | Cat has a subtle idle animation (blink every ~4s, tail flick) via a tiny sprite-swap or CSS keyframe on an SVG; cursor-follow parallax (mascot eyes/head tilt slightly toward pointer, custom cursor per §2.4) |
| **"How it works" (3 steps)** | Log a transaction → categorize → see it roll up in your base currency | Steps reveal on scroll with stagger (`motion`'s `whileInView`), each with a small looping product screenshot/mock (not a static PNG — an actual mini interactive replica, e.g. a fake "add expense" mini-form that types itself) |
| **Feature grid** | Multi-currency, budgets w/ rollover, realtime multi-device sync, PWA installable | Cards with the hover lift from §2.3; paw-print bullets from §2.6 |
| **Screenshots / mock dashboard** | A real (or faithfully mocked) dashboard screenshot inside a browser-chrome frame, using the "bite mark" corner motif once here | Tilt-on-hover (subtle 3D perspective tilt following cursor, `motion`) |
| **Social proof / trust** | Optional — "Built for real personal use, not a SaaS pitch" honesty blurb fits the brand voice better than fake testimonials given this is a personal project | none needed |
| **Final CTA** | Repeat primary CTA + mascot | Confetti-lite burst (`canvas-confetti`, palette-matched colors only) on first click, purely decorative, doesn't block navigation |
| **Footer** | Minimal — link to sign in, maybe a note about the cat the app is named after | none |

### 3.2 Distinct personality directives for this page specifically

- This is the **one page** allowed to be more playful than the in-app screens (per design spec §1, "playfulness lives in chrome... numbers stay serious" — inside the app; the landing page *is* chrome).
- Background: not flat lavender — add a very subtle animated blob gradient (2–3 large, soft, slow-drifting blurred shapes in periwinkle/lavender, `duration` in the 20–40s range, `blur-3xl`, low opacity) behind the hero only.
- Custom cursor (§2.4) lives here.
- This page must still hit Lighthouse performance targets — blobs and cursor tracking must be GPU-transform-only (`transform`, not `top`/`left`), and the whole page should ship almost no JS beyond `motion` + the confetti trigger.

---

## 4. PWA Splash Screen

Today's `manifest.json` doesn't exist yet (it's a Phase 15 task). Speccing it now so branding is consistent when built.

### 4.1 Android / Chromium (manifest-driven, automatic)

Chromium auto-generates the splash screen from the manifest — no extra image needed beyond correct manifest fields:

```json
{
  "name": "Oreo — Personal Finance Tracker",
  "short_name": "Oreo",
  "description": "Track spending, budgets, and goals with a cozy cat by your side.",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#d8dcff",
  "theme_color": "#565676",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- `background_color` = lavender (matches app background so the splash-to-app handoff has zero flash).
- `theme_color` = slate purple (status bar / task-switcher chrome).
- The 512px icon needs a **maskable** variant (cat centered inside the safe zone, ~40% padding) so Android's adaptive-icon mask doesn't crop the cat's ears/tail.

### 4.2 iOS (Safari does NOT read the manifest for splash — needs explicit `<link>` tags)

iOS requires literal pre-rendered PNGs per device size via `apple-touch-startup-image` links in `<head>` (or Next.js's `metadata.appleWebApp` in `app/layout.tsx`). Minimum viable set (covers the vast majority of active iOS devices as of 2026):

| Device class | Size (px) |
|---|---|
| iPhone (390×844 @3x class, e.g. 14/15/16 base) | 1170×2532 |
| iPhone Pro Max class | 1290×2796 |
| iPhone SE / small | 750×1334 |
| iPad | 1668×2388 |
| iPad Pro 12.9" | 2048×2732 |

Each splash image: **solid `#d8dcff` background**, the pixel-cat mascot centered at a fixed pixel-multiple size (per design spec §4 "render at fixed pixel-multiples, not arbitrary scaled sizes"), optionally the Fredoka wordmark "Oreo" beneath it. Generate all sizes from one master SVG/canvas script rather than hand-exporting each (a small Node script using `sharp`, run once at build time into `/public/splash/`).

Wire into `app/layout.tsx` metadata:

```ts
export const metadata: Metadata = {
  // ...existing
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Oreo",
    startupImage: [
      { url: "/splash/iphone-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      // ...one entry per size above
    ],
  },
};
```

### 4.3 In-app "fake splash" for perceived performance

Even with a correct manifest/link setup, there's often a beat of white/blank before hydration. Add a **minimal inline splash** rendered synchronously in `app/layout.tsx` (not a separate route) — just the lavender background + centered static (non-animated, to avoid layout thrash) cat mark — shown until the root providers finish mounting, then cross-fades out over `duration-md`. This should be near-zero JS: inline critical CSS, no external image request blocking it (inline SVG).

---

## 5. Page-by-Page Breakdown

For each page: **current state**, **what's missing**, **specific additions**.

### 5.1 Auth (Sign up / Log in / Reset password) — Phase 5

- **Current:** Not yet built beyond plan.
- **Missing:** Any personality at all — these are usually the most boring screens in every app.
- **Add:**
  - Split-screen layout on desktop (form left, mascot + a rotating one-line "did you know" tip about a feature, right, on a lavender panel); single column stacked on mobile.
  - Inline field validation with **micro-shake** animation (small horizontal shake, `duration-xs`, 2 cycles) on submit error, not just a red border.
  - Password field: eye-toggle icon button with hover state, not a bare unstyled toggle.
  - Magic "loading" state on the submit button: label swaps to a small inline spinner *inside* the button (button width doesn't jump) with text "Signing you in…".
  - Success on signup: brief full-screen mascot "welcome" moment (not a modal — a full transition) before redirecting into onboarding.

### 5.2 Onboarding — base currency (Phase 5)

- **Current:** Planned as a single first-login step.
- **Add:** A currency picker as a searchable combobox (Base UI `Combobox`/`Select` styled), with **flag emoji + code + name**, and a live preview: "Your dashboard balance will show as **₱0.00**" that updates as you type/select — makes an abstract setting feel concrete immediately.

### 5.3 App Shell — Nav, Header (Phase 6)

- **Current:** Sidebar (desktop) / bottom nav (mobile) per design spec §5, not yet built.
- **Add:**
  - **Active nav item:** background pill slides between items using a shared-layout animation (`motion`'s `layoutId`) rather than each item independently fading — this single detail reads as "expensive" out of proportion to its build cost.
  - **Bottom nav "Add" button (mobile):** per design spec this is the emphasized center slot. Make it visually raised above the bar (overlapping the top edge by ~8px), with its own shadow, and a small **press-bounce** (scale down then overshoot slightly past 1.0) on tap.
  - **Sidebar (desktop):** collapsible to icon-only width with a smooth width transition; tooltip (Base UI `Tooltip`) shows the label on hover when collapsed.
  - **Header:** breadcrumb-less; instead show the current section's Fredoka title plus a right-aligned quick-add button and (later) the base-currency balance chip, always visible, so the "important number" is never more than one screen away regardless of which page you're on.

### 5.4 Dashboard (Phase 13 wires real data, but shell exists earlier)

- **Current:** Empty placeholder page in Phase 6; real content in Phase 13.
- **Add:**
  - Big balance figure: **count-up animation** (§2.8) on first paint and whenever it changes via Realtime (Phase 14) — this is the single most-seen number in the app and deserves the most polish.
  - Account balance cards: horizontally scrollable on mobile with **scroll-snap**, and a subtle drag-cursor affordance; on desktop, a responsive grid with stagger-in on route entry.
  - Recent transactions: each row **slides in from the left with stagger** (~40ms delay per row) on first load; when a new transaction arrives via Realtime, it **slides in from the top with a brief highlight flash** (background pulses periwinkle then fades) so multi-device sync is *visible*, not just correct.
  - Budget/goal compact widgets: progress bars **animate their fill** from 0 → value on mount (`ease-oreo`, `duration-lg`), not appear pre-filled.
  - Empty state (brand-new user): full mascot moment per design spec §6.1 — add a subtle idle animation to the cat here specifically (this is the highest-value empty state in the app, worth the extra polish).

### 5.5 Accounts (Phase 7)

- **Add:**
  - Card hover reveals a small overflow menu (⋯) that wasn't visible at rest — reduces visual noise while keeping actions discoverable (Popover/Menu component).
  - Currency lock icon (design spec §6.3) gets a **Tooltip** on hover: "Currency is locked after first use — read more" rather than being a mystery glyph.
  - Archive action: **not** an instant disappear — the card does a brief "fold" or fade+collapse-height animation (`motion`'s `AnimatePresence` + `layout`) before leaving the grid, and a small **undo toast** appears for 5s (Base UI `Toast`), since archiving is a state change users may want to reverse immediately.
  - "Archived" section toggle: chevron rotates 180° on expand, section height animates (`AnimatePresence`), not just conditional render.
  - Create/Edit account: use a **Sheet** (slide-in from the right on desktop, bottom on mobile) rather than a centered modal — keeps context of the list visible, matches the "Add-transaction as a modal/dialog" pattern from the design spec but differentiates account management as a lighter-weight panel.

### 5.6 Categories (Phase 8)

- **Add:**
  - Icon picker: this is the single highest-interactivity component in the app (50–100 icons) — see §6.5 below for the dedicated component spec. On this page specifically, wrap the picker in a **Popover** anchored to the icon field, not a full modal, so users stay oriented.
  - Category chips: hover state lifts + shows a thin colored ring matching the category's assigned accent; selected/active state (when filtering transactions by category) gets a filled background instead of just a border.
  - Delete-blocked state (FR-4.4): instead of a disabled trash icon with no explanation, show the trash icon **enabled**, and on click open a small inline Popover (not a full dialog) saying "Used in 12 transactions — reassign first" with a "Reassign" link, exactly as design spec §6.4 intends but currently under-specified interaction-wise.
  - Default-category seeding (Phase 4/8 finalization): give seeded categories a tiny "seed" badge (a small sprout icon) the first time a user sees them, that disappears once they edit any category — a small delight that also doubles as a subtle tutorial.

### 5.7 Transactions (Phase 9, 10)

- **Add:**
  - **Add transaction flow:** type selector (Expense/Income/Transfer) as three large tappable segmented-control tiles, not a dropdown — each tile has its own accent color at rest (subtle) that intensifies on select, and the form fields below **animate in/out** based on which type is active (shared layout animation so the account field doesn't jump, it morphs from one-account to two-account layout for Transfers).
  - **Transfer currency conversion (FR-3.3):** the computed destination amount doesn't just appear — it **counts up** live as the user types the source amount (debounced), with a small "≈" prefix and a Tooltip showing the exact rate and its fetch timestamp ("Rate as of 2h ago").
  - **Stale-rate fallback (FR-8.4):** don't just show plain text — use a small amber-tinted inline banner with an icon, consistent with the design spec's "errors are direct, not cute" voice rule (§7) — no whimsy here even though the rest of the flow is playful.
  - **List:** date-grouped sections with **sticky date headers** while scrolling (so long history stays scannable); swipe-to-reveal edit/delete actions on mobile (native-feeling gesture via `motion`'s drag constraints) instead of a tap-to-open menu.
  - **Delete:** same undo-toast pattern as Accounts (§5.5) — deletion is exactly the kind of action that benefits from a 5-second grace period.
  - **Filters panel:** sheet/drawer on mobile per design spec §6.2 — add live result-count feedback ("Showing 14 of 212") that updates as filters change, so the panel feels responsive even before it's closed.

### 5.8 Budgets (Phase 12)

- **Add:**
  - Rollover badge (design spec §6.5 "+/− badge"): make it **hoverable** — a Tooltip explains "You had $40 left over last period, added to this period's limit" rather than expecting users to infer the rollover mechanic from a bare number.
  - Progress bar: beyond the fill animation (§2.8), add a **threshold marker** (a thin vertical tick at 100% of the *base* limit, distinct from the rollover-adjusted effective limit) so users can see at a glance how much rollover shifted things — this is a genuinely useful visualization of a mechanic (FR-6.3) that's otherwise invisible.
  - Over-budget state: the whole card gets the mauve top-edge treatment from §2.6, plus a very subtle (2%, one-shot, non-looping) shake or "shiver" the first time a budget crosses into over-budget during a session — signals the moment without being an alarming, repeating animation.
  - Create-budget period-type selector: same segmented-tile pattern as transaction type (§5.7) for consistency — Weekly/Monthly/Custom, with the Custom tile revealing date-range fields inline via height animation.

### 5.9 Goals — *(HALTED, do not build yet)*

Per `build-phases.md` Phase 11 and SRS §3.5, this feature is halted pending a redesign. **Do not implement any of the interactivity below until the feature is un-halted and the data model is revisited.** Documenting the intended polish now purely so it isn't lost:

- Progress ring (not bar) per design spec §6.6, animates like a clock hand sweeping to the current %, not a linear fill.
- Milestone celebrations (25/50/75/100%) use the `canvas-confetti` burst from §3.1's landing page, reused here — same asset/config, one shared `<Confetti />` component.

### 5.10 Analytics (Phase 13)

- **Add:**
  - Charts (`recharts`): animate on mount (bars grow from baseline, line draws left-to-right via stroke-dashoffset), and animate transitions when the date-range filter changes rather than hard-swapping datasets.
  - Tooltips on hover over chart segments: styled to match the app (Fredoka for the label, JetBrains Mono for the number), not the library default.
  - Category breakdown pie/bar: hovering a legend entry **highlights** the corresponding segment across the chart (dim everything else to 40% opacity) — a small linked-interaction detail that makes multi-series charts feel considered.
  - Budget-vs-actual view: reuse the Budgets page's progress-bar-with-threshold component (§5.8) rather than a separate visualization — consistency reduces cognitive load and implementation cost simultaneously.
  - Persisted filters (design spec §6.7): show the active date-range as a removable chip/pill above the charts so it's obvious a filter is applied and easy to clear.

### 5.11 Settings (Phase 5, 12, ongoing)

- **Current:** Intentionally plain per design spec §6.8 ("doesn't need mascot or extra personality; it's a utility screen") — keep it that way, but it still needs the baseline interactivity, just not the flourish.
- **Add:**
  - Grouped list sections with clear dividers (`Separator` component), each row a full-width tappable target with a trailing chevron, standard settings-list pattern.
  - Toggle switches (reminder enabled, when that feature returns) use a smooth thumb-slide, not a CSS-default checkbox.
  - Sign-out: confirmation via a small inline Popover on the button itself ("Sure?" / "Sign out") rather than a full modal — it's a low-stakes, reversible-by-logging-back-in action and doesn't warrant a heavyweight interruption.
  - Base currency change (if ever allowed post-v1): out of scope per SRS §7, no polish needed now.

---

## 6. Component-by-Component Breakdown

### 6.1 `Button` (`components/ui/button.tsx`)

- Add the full hover/active matrix from §2.3 (currently only has the `active:translate-y-px`).
- Add a `loading` prop that swaps the label for an inline spinner **without changing button width** (measure and lock width via `min-width` on mount, or reserve space with a hidden clone — standard technique).
- `destructive` variant hover state should intensify (currently `hover:bg-destructive/20`, fine) but pair with a `focus-visible` ring in mauve, not the default periwinkle, so destructive-focus reads distinctly from primary-focus.

### 6.2 Card (new, currently ad hoc `div`s with inline styles in `app/page.tsx`)

- Formalize as a real `<Card>` component (`components/ui/card.tsx`) wrapping the elevation system (§2.2) and the two-tone edge motif (§2.6) as optional props (`accent="expense" | "income" | "neutral"`).
- Every page listed in §5 should consume this one component rather than reimplementing card chrome per page.

### 6.3 Modal / Dialog / Sheet

- Add both `Dialog` (centered, for confirmations and short forms — e.g. category create) and `Sheet` (edge-anchored, for longer forms and account management, per §5.5) via `npx shadcn add dialog sheet`.
- Both need enter/exit animation: Dialog scales from 0.95→1 + fades; Sheet slides from its anchored edge. Backdrop fades independently and is `pointer-events-none` during the exit animation so rapid re-open doesn't dead-click.
- Focus trap + return-focus-on-close must work (Base UI provides this by default — verify, don't reimplement).

### 6.4 Popover / Tooltip / HoverCard

- Add via `npx shadcn add popover tooltip hover-card`.
- **Tooltip:** used for icon-only buttons (nav collapse, currency lock, overflow menus) — 400ms open delay, 0ms close delay, per standard UX convention (don't make tooltips laggy to dismiss).
- **Popover:** used for confirmations-in-place (sign-out, delete-blocked explanation) and the icon picker anchor.
- **HoverCard:** reserved for a nice-to-have — e.g. hovering an account name inside a transaction row could preview that account's current balance without navigating away. Lower priority than the rest of this doc.

### 6.5 Icon Picker (Phase 8 task, currently unspecified beyond "reusable picker component")

This deserves its own spec since it's used by both Categories and Accounts (icon/color) and is the densest single interaction surface in the app:

- Render inside a **Popover**, not a full-page modal (keeps context).
- Grid of ~50–100 Lucide icons, each a 40×40 hit target with the hover-lift treatment (§2.3) at a smaller scale (`translate-y-[-1px]`, since the grid is dense).
- **Search-to-filter** input pinned at the top of the popover, filters the grid live, no debounce needed at this icon-count scale.
- Selected icon gets a periwinkle filled background + a small check overlay, not just an outline.
- Keyboard navigable (arrow keys move a roving-tabindex focus across the grid) — this is a real accessibility requirement given the grid size, not just polish.

### 6.6 Chart components (new, Phase 13)

- Thin wrapper components around `recharts` primitives per chart type used (pie, bar, line/area) that inject the Oreo color tokens, Fredoka/JetBrains Mono typography, and the mount/update animations from §5.10, so every chart in the app is visually consistent without re-deriving the styling each time.

### 6.7 Progress bar / ring

- One shared `<BudgetProgress>` component (bar) used by Budgets, Analytics, and the Dashboard compact widget.
- One shared `<GoalProgressRing>` component reserved for when Goals is un-halted (§5.9) — build the visual component now if useful for other future radial-progress needs, but don't wire it to the goals data model yet.

### 6.8 Toast / Undo notifications

- Add via `npx shadcn add sonner` (or the toast primitive) — used for delete/archive undo (§5.5, §5.7) and background sync status ("Rate updated", "Reconnected — synced 3 transactions" once offline/realtime features exist).
- Style: rounded per the global radius scale, slide up from bottom-center on mobile / bottom-right on desktop, auto-dismiss with a visible countdown (a thin shrinking progress line along the bottom edge of the toast).

### 6.9 Mascot component

- Formalize as `<Mascot pose="idle" | "wave" | "celebrate" | "sleeping" | "confused" />` — a single component with swappable poses (either sprite-swap between a handful of pre-rendered pixel-art PNGs, or a single SVG with a couple of animated parts like the tail).
- `sleeping` pose is a nice addition for the reminder feature (when un-halted) and for very-old-empty-states ("nothing logged in 30 days? cat's asleep").
- `confused` pose for genuine error states (network failure, exchange rate totally unavailable with no cache) — pairs with the "errors are direct" copy rule, i.e. the mascot can look confused while the text stays plain and helpful.

### 6.10 Form fields (inputs, selects, comboboxes)

- Floating or top-aligned labels (top-aligned recommended — better for a dense finance app, floating labels can hurt scannability for numeric fields) with a focus-state label color shift to slate purple.
- Numeric/amount inputs: right-aligned, JetBrains Mono, with a persistent currency-code suffix chip inside the field (not a separate label) — reduces ambiguity in every amount field across Transactions/Budgets/Goals.
- Inline validation errors appear **below** the field with a slide+fade-in, paired with the micro-shake from §5.1 only on submit (not on every keystroke — that's annoying, not premium).

---

## 7. Implementation Priority (fits inside existing Phase 18)

Ordered by impact-to-effort ratio, assuming this all lands within the existing Phase 18 polish pass before Phase 19 QA:

1. **Global system first:** motion tokens, elevation tokens, Button state matrix, Card component (§2, §6.1, §6.2) — everything else depends on these existing.
2. **Add the missing primitives:** Popover, Tooltip, Dialog, Sheet, Toast, Skeleton via shadcn (§6.3, §6.4, §2.7, §6.8).
3. **Icon picker** (§6.5) — highest-density interaction, used on two pages already in earlier phases; worth doing before broader polish so Categories/Accounts benefit immediately.
4. **Dashboard number animation + realtime highlight** (§5.4) — most-seen screen, biggest perceived-quality lift.
5. **Transaction add/edit flow morph + undo toasts** (§5.5, §5.7) — second most-used flow in the app.
6. **Budgets rollover tooltip + threshold marker** (§5.8) — makes an existing invisible mechanic visible.
7. **Analytics chart polish** (§5.10) — lower traffic than the above, still valuable.
8. **Landing page** (§3) — build once the in-app experience above is solid, since it's showcasing that experience.
9. **PWA splash screen** (§4) — can be done in parallel with anything above; it's isolated (manifest + static assets + one layout.tsx metadata block).
10. **Mascot pose set + Goals visual components** (§6.9, §5.9) — lowest priority; Goals specifically stays fully unbuilt until un-halted.

---

## 8. What NOT to Add (guardrails, per existing design spec)

- No mascot in persistent chrome (nav/header) — design spec §4 already forbids this, still true here.
- No sound.
- No looping/attention-grabbing animation on error or over-budget states beyond a single one-shot cue (§5.8) — repeating alarm-style motion contradicts the "errors are direct, not cute" voice rule.
- No parallax/custom-cursor/blob-background outside the landing page — those are marketing-page-only per §3.2, keeping the in-app experience calm per the original "quiet confidence" principle.
- No dark mode work here — `app/globals.css` is explicitly documented as light-palette-only; out of scope for this pass.
