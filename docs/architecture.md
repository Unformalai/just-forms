# Architecture — Just Forms

Reference architecture for the blueprint. This is what ships in the repo today. Adapt components only when the stack survey justifies it (see `stack-adaptation.md`).

---

## System diagram

```
┌─────────────┐     HTTPS      ┌──────────────────────────────────┐
│  Respondent │ ──────────────►│  Cloudflare Worker (SvelteKit)   │
│  (browser)  │                │                                  │
└─────────────┘                │  /f/:slug      public form        │
                               │  /api/submit   form POST          │
┌─────────────┐     HTTPS      │  /admin/*      password gate      │
│   Operator  │ ──────────────►│  /thanks       confirmation       │
│  (browser)  │                └──────────┬───────────────────────┘
└─────────────┘                           │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
             ┌──────────┐         ┌──────────────┐      ┌─────────────┐
             │    D1    │         │  Turnstile   │      │  Webhook    │
             │ (SQLite) │         │  (optional)  │      │  (optional) │
             └──────────┘         └──────────────┘      └─────────────┘
```

---

## Layers

### 1. Edge app (SvelteKit on Workers)

Single Worker serves static assets and dynamic routes. `@sveltejs/adapter-cloudflare` builds to `.svelte-kit/cloudflare/`.

| Route | Purpose |
|-------|---------|
| `/` | Landing (blueprint positioning) |
| `/f/[slug]` | Render form from D1 |
| `/api/submit` | Validate, store submission, fire webhook |
| `/thanks` | Post-submit page |
| `/admin` | Forms list, submissions, settings, CSV export |

`src/hooks.server.ts` attaches the D1 binding to every request and gates `/admin/*` behind the signed cookie.

### 2. Database (D1)

SQLite at the edge. Five tables:

| Table | Role |
|-------|------|
| `forms` | Form metadata (slug, title, description) |
| `fields` | Field definitions (type, options, conditional `show_if`) |
| `submissions` | One row per attempt (status, timestamps, utm) |
| `answers` | Field values per submission |
| `settings` | Key/value config (webhook URL) |

Schema and seed data: `schema.sql`. v1 has no migrations folder; apply changes with `wrangler d1 execute`.

**Field types today:** `text`, `email`, `textarea`, `choice` (radio), `hidden`.

**Conditionals:** `show_if` JSON `{ "field": "name", "equals": "value" }` on the `fields` row.

### 3. Admin auth

Shared password (`ADMIN_PASSWORD` wrangler secret). On login, server sets a SHA-256 signed cookie (`jf_admin`, 14-day TTL). No user accounts, no roles. Sufficient for a single-operator form admin.

### 4. Spam protection (optional)

Cloudflare Turnstile. If `TURNSTILE_SECRET_KEY` is unset, verification is skipped. Form still works.

### 5. Integrations (optional)

On successful submit, server POSTs JSON to `settings.webhook_url` if set. Fire-and-forget: webhook failures do not block the respondent. Use this to push into Slack, Zapier, n8n, or the customer's existing automation.

---

## Data flow: submit

```
POST /api/submit
  → validate fields (required, email format, show_if visibility)
  → optional Turnstile verify
  → INSERT submissions + answers in D1
  → optional webhook POST (async, errors swallowed)
  → redirect to /thanks
```

No background queue. No email sender built in. If the customer needs email notifications, point the webhook at their existing provider (Resend, Postmark, etc.) or add a small adapter in `src/lib/server/webhook.ts`.

---

## What is intentionally out of scope

| Feature | Why not in v1 | If customer needs it |
|---------|---------------|----------------------|
| Form builder UI | Blueprint is code/SQL-first | Point to Tally, or build a v2 admin CRUD |
| File uploads | Storage + virus scan + CDN cost | R2 binding or external storage swap |
| Payments | Stripe complexity | Separate blueprint or Unformal |
| Multi-tenant SaaS | They host their own instance | One deploy per customer |
| Branching logic | Only `show_if` conditionals | Unformal for real conversations |

---

## Component swap boundaries

Each layer can be swapped independently. The reference repo only implements the left column:

| Layer | Reference | Common swaps |
|-------|-----------|--------------|
| Hosting | Cloudflare Workers | Vercel, Node server |
| Database | D1 | Supabase, Neon, PlanetScale, RDS |
| Auth | Password cookie | Supabase Auth, Clerk |
| Spam | Turnstile | hCaptcha, reCAPTCHA |
| Framework | SvelteKit | Port logic to Next.js (not provided) |

Swap instructions: `stack-adaptation.md`.

---

## Security notes

- Rotate `ADMIN_PASSWORD` before sharing the admin URL
- D1 data stays in the customer's Cloudflare account
- No PII leaves the Worker except via webhook the customer configured
- Turnstile reduces bot spam but is not a guarantee
- HTTPS is handled by Cloudflare; no custom TLS config needed

---

## Deployment artifact

```
pnpm build          → SvelteKit production build
wrangler deploy     → Worker + assets to customer's CF account
wrangler d1 execute → schema + seed to customer's D1 database
wrangler secret put → ADMIN_PASSWORD, optional Turnstile keys
```

The customer owns all Cloudflare resources. Unformal does not host submissions.
