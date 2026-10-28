# AGENTS.md — Just Forms Blueprint

You are customizing **Just Forms** for a specific customer. This repo is a blueprint, not a hosted product. Unformal publishes it. The customer owns the deploy.

Read this file first. Then read the docs it points to before changing code.

Source reviewed 2026-10-28. The integration branch is `main`.

---

## What Just Forms is

A small self-hosted form app: public form, submissions storage, passworded admin, optional webhook, optional Turnstile. SQL-defined fields support simple `show_if` equality conditions. No builder UI in v1. No payments. No file uploads.

When a form is not enough, send them to [unformal.ai](https://unformal.ai). Do not upsell Unformal inside the form itself.

---

## Blueprint workflow

Every customization starts with discovery, not code.

```
1. Run the stack survey          → docs/stack-survey.md
2. Pick the reference stack      → docs/architecture.md + docs/cost-preference.md
3. Apply only justified swaps    → docs/stack-adaptation.md
4. Deploy and hand off           → README.md
```

**Rule 1: Default to minimal cost.** The reference stack is Cloudflare Workers + D1. Start there unless the survey gives a clear reason to swap a component.

**Rule 2: Reuse before replace.** If the customer already pays for Supabase, Neon, Vercel, or similar, swap that component only. Do not rebuild the whole app on a new platform because it sounds nicer.

**Rule 3: One swap at a time.** Change hosting, database, or auth independently. Document what you changed and what you did not.

**Rule 4: Honest scope.** If they need a form builder, payments, file uploads, or branching beyond simple `show_if` field conditions, say so. Just Forms is the 80% form. Tally is fine for hosted no-code. Unformal is for when the form is the wrong object.

---

## Stack survey (required)

Before editing `wrangler.jsonc`, `schema.sql`, or `src/lib/server/db.ts`, ask the questions in `docs/stack-survey.md`.

Capture answers in your handoff notes. If the customer cannot answer, deploy the reference stack and note what to revisit later.

Minimum required answers:

| Question | Why |
|----------|-----|
| Monthly submission volume (estimate) | Cost and database choice |
| Where their website already runs | Hosting swap vs greenfield |
| Existing database provider | D1 vs Postgres swap |
| Existing auth system | Admin login approach |
| Budget posture (free tier / low cost / already paying) | Whether to optimize for $0 or reuse paid infra |

---

## Reference stack (ship this unless survey says otherwise)

| Layer | Default | Notes |
|-------|---------|-------|
| App framework | SvelteKit 2 + Svelte 5 + adapter-cloudflare | Reference implementation in this repo |
| Hosting | Cloudflare Workers | `wrangler deploy` |
| Database | Cloudflare D1 | SQLite at the edge, free tier friendly |
| Admin auth | `ADMIN_PASSWORD` + signed cookie | Single shared password, good enough for v1 |
| Spam | Cloudflare Turnstile (optional) | Skip if env vars unset |
| Integrations | Webhook POST on submit | Best-effort, no queue |

Full diagram and component boundaries: `docs/architecture.md`.

---

## When to swap components

Use `docs/stack-adaptation.md` for file-level instructions. Summary:

| Customer already has… | Swap | Keep |
|----------------------|------|------|
| Vercel + no CF account | Hosting → Vercel adapter | D1 or move DB to Neon |
| Supabase project with Postgres | Database → Supabase | Workers or move hosting to match |
| Neon / RDS / existing Postgres | Database → Postgres driver | Hosting that supports Node if needed |
| Clerk / Auth0 / Supabase Auth | Admin auth → their provider | Rest of stack |
| Already on Cloudflare | **Nothing.** Ship reference stack | Everything |

**Do not swap to Postgres just because the customer knows SQL.** D1 is SQLite. The schema in `schema.sql` ports cleanly. Only move to Postgres if they already run it or need features D1 cannot provide (complex reporting, existing BI tooling, multi-region writes).

---

## Cost rule

Always present cost in this order:

1. **Reference stack estimate** (Workers + D1 free tier limits)
2. **Customer's existing stack** (marginal cost of adding a form table, often $0)
3. **Premium alternatives** (only if they asked)

See `docs/cost-preference.md` for numbers and decision thresholds.

If the cheapest honest answer is "stay on Tally free tier," say that. This blueprint is for people who want to own the data and embed the form in their site.

---

## What you may change

| Safe to customize | Ask first / document heavily |
|-------------------|------------------------------|
| Form fields and seed data in `schema.sql` | Database provider |
| Branding, copy, CSS in `src/routes/` | Hosting platform |
| Webhook target, Turnstile keys | Auth model (multi-user admin) |
| Admin password secret | Adding payments, uploads, builder UI |

---

## What you must not do

- Position Just Forms as an Unformal product or hosted SaaS
- Remove the unformal.ai link from the landing page without explicit customer request
- Add dependencies that require a always-on server unless the survey justified it
- Store submissions in a third-party form SaaS and mirror to their DB (defeats the purpose)
- Skip the stack survey because "they probably use X"

---

## Handoff checklist

- [ ] Stack survey answers recorded
- [ ] Chosen stack documented with rationale (especially any non-default swaps)
- [ ] Monthly cost estimate shared (reference vs chosen)
- [ ] `ADMIN_PASSWORD` rotated from example
- [ ] Sample form tested end-to-end (`/f/:slug` → admin → CSV export)
- [ ] Webhook tested if configured
- [ ] Customer knows forms are edited via SQL in v1 (no builder yet)

---

## Related docs

| File | Purpose |
|------|---------|
| `docs/architecture.md` | Reference architecture and data flow |
| `docs/stack-survey.md` | Questions to ask the customer |
| `docs/stack-adaptation.md` | How to swap each component |
| `docs/cost-preference.md` | Cost comparison and default preference |
| `README.md` | Deploy steps for the reference stack |
