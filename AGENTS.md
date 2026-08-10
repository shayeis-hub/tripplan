<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Tulon — project context

Trip-planning app. Hebrew (primary), English, Spanish. Next.js + TypeScript on
Vercel, Firebase (Auth + Firestore), Sentry. **Live in production since
2026-08-06** on Google Play and at https://www.tulon.app — real users, so prefer
additive changes over restructuring existing data.

## Repos
- This one: the web app (the native shell loads it remotely, so a Vercel deploy
  updates the Android app too — no store release needed for web-side changes).
- `tulon-native` (private): Capacitor Android shell, package
  `il.co.tulon.www.twa`. Only needs a new AAB for genuinely native changes.

## Conventions
- **No emojis** anywhere the user sees — lucide icons in the UI, plain text
  elsewhere. This is a standing preference, not a per-task one.
- Canonical domain is `www.tulon.app`; `tulon.co.il` 308-redirects to it. Every
  Google Play Console field must point at tulon.app.
- App version shows in the side-menu footer, sourced from `package.json` via
  `NEXT_PUBLIC_APP_VERSION`. Bump with `npm version x.y.z --no-git-tag-version`.
- Deploy with `npx vercel --prod`. Verify affiliate/env-dependent changes
  against the **live bundle**, not just the local build — a Vercel env var named
  differently from what the code reads fails silently (this happened: Viator).

## Settled decisions — don't re-propose
- Expense categories stay as they are. `food` covers both restaurants and
  grocery shopping and will **not** be split.
- Partner/referral tracking was built and then fully removed: affiliate
  networks don't offer per-click sub-affiliate attribution outside
  TravelPayouts' single `sub_id`.
- Google Maps has no legitimate offline-tiles API, and caching tiles violates
  its ToS. Offline map = a location list, not a cached map.

## Offline behaviour
Firestore persistent cache is on, so a trip already loaded stays readable and
editable offline and syncs on reconnect. Live map, receipt scan, weather and FX
rates all need a connection; rates fall back to the last cached values. First
ever visit to the map screen while offline throws ChunkLoadError (the lazy
chunk was never fetched) — handled with a dedicated explanatory fallback.
