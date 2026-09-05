# Oreo Finance — Phase F: Public Testing Readiness

**Status:** In progress · **Date:** September 2026
**Context:** Phases A–E of the post-launch action plan are complete. App is live, Vercel Web Analytics is on, email/auth confirmed working via personal Gmail SMTP (no custom domain — acceptable for a prototype). Realtime sync deferred indefinitely; skeleton loaders partially implemented. Next step: posting to a university Facebook page for live testing — a step up in exposure from a private beta, since posters are strangers and the thread is public.

---

- [x] **F1. Raise Supabase Auth rate limits for the custom-SMTP + shared-network context.** ✅ Done.
  - **Where:** Supabase Dashboard → Authentication → Rate Limits (not just the local `supabase/config.toml`, which only applies to local dev unless pushed).
  - **Why:** `email_sent = 2`/hour is a legacy default sized for Supabase's *shared* mail service — now that Gmail SMTP is doing the sending, this cap was artificially low. `sign_in_sign_ups = 30` per 5 minutes is scoped **per IP**; testers on the same campus/dorm wifi share a public IP, so a signup rush from one location could otherwise trip this.
  - **Values used:** `email_sent` raised to ~30–60/hour, `sign_in_sign_ups` raised to ~60–100 per 5 minutes.

- [ ] **F2. Enable CAPTCHA on signup.**
  - **Where:** Supabase Dashboard → Authentication → Bot and Abuse Protection.
  - **Why:** A public Facebook post is exactly the kind of exposure that attracts bot signups, which would burn through the email quota and pollute the user table.
  - **Fix:** Turn on hCaptcha or Cloudflare Turnstile — a dashboard setting plus one widget added to the signup form.

- [ ] **F3. Add a persistent, post-login feedback link — plus a pre-login fallback.**
  - **Primary placement:** Somewhere always reachable while navigating the app post-login — e.g. a "Report an issue" link in Settings, or a persistent affordance in the header/sidebar. Point it at a Google Form.
  - **Why post-login primary:** Ties every report to an authenticated session, so it's confirmed to be a real user who actually used the app, and follow-ups or data checks are possible. More actionable than scattered Facebook comments.
  - **Fallback placement:** Mirror the same form link in the Facebook post, explicitly framed for pre-login problems — e.g. "Can't sign up or log in? Report it here" — since someone stuck before reaching the app has no way to reach the in-app link.
  - **Form contents to include at minimum:** what they were trying to do, what happened instead, device/browser, and optionally their account email (optional, for looking up their data if needed).

  Form link: `https://forms.gle/33Et1FaoLFyPtzM66`

- [ ] **F4. Set expectations in the Facebook post itself.**
  - **Why:** Random forum/FB readers may treat a prototype like a finished product, enter real financial data, or be confused by rough edges that are known and expected at this stage.
  - **Fix:** Include a line or two in the post: this is a prototype for testing, avoid entering real account numbers, test data may be reset, and where to report issues (F3's form link).

- [ ] **F5. Actively monitor Supabase Usage and Vercel Logs during the initial rollout window.**
  - **Why:** No error-tracking service (e.g. Sentry) is set up. Vercel Web Analytics tracks page views and Web Vitals only — it will **not** surface thrown errors, failed server actions, or Supabase query failures.
  - **Fix:** For at least the first 24–48 hours after posting, manually check Vercel's function logs (for server action/route errors) and Supabase's Logs + Usage tabs (for auth failures, DB errors, and egress trending toward the 5 GB/month free-tier cap).

- [ ] **F6. Decide how to frame the two known, deferred limitations if testers hit them.**
  - **Realtime sync:** deferred indefinitely — a tester with two tabs/devices open won't see the other update without a manual refresh. Worth a one-line mention in F4 if multi-device usage seems likely.
  - **Skeleton loaders:** partially implemented — some views may still show the full-page mascot spinner instead of a shaped placeholder. Cosmetic only.

- [ ] **F7. Add a Terms & Conditions acknowledgment to signup.** *(added — see implementation below)*
  - **Why:** Public exposure + real user accounts + financial-data entry is exactly the situation where a lightweight disclaimer matters: sets expectations (no warranty, prototype status, test data may reset, don't enter real account numbers), and requires an affirmative click before an account is created.
  - **Fix:** Required checkbox + modal on the signup page, enforced both client-side (submit disabled until checked) and server-side (signup action rejects submissions missing the acceptance flag). See `TermsDialog.tsx`, updated `signup/page.tsx`, and updated `actions/auth.ts` provided alongside this document.

---

## Suggested order for what's left

1. **F2** (CAPTCHA) and **F7** (Terms & Conditions) — both are pre-signup gates, do together before the post goes live.
2. **F3** (feedback link) and **F4** (post copy) — needed for the post itself, do right before publishing.
3. **F5** (monitoring) — ongoing, starts the moment the post is live.
4. **F6** — just framing language, folds into F4.
