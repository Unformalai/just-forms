# Agent prompt — Just Forms

Copy the block below into Claude, Cursor, ChatGPT, or any coding agent. It tells the agent to clone the repo, run the stack survey, and deploy the blueprint.

---

## Copy prompt

```
Deploy Just Forms for me: a self-hosted form blueprint from Unformal.

Repo: https://github.com/Unformalai/just-forms

Before writing code:
1. Clone the repo.
2. Read AGENTS.md, then docs/stack-survey.md, docs/architecture.md, and docs/cost-preference.md.
3. Ask me the stack survey questions. Do not assume my stack.

Deploy rules:
- Default stack: Cloudflare Workers + D1 (lowest cost, ~$0/mo for a small form).
- Only swap database or hosting if I already run Supabase, Neon, Vercel, etc. and reuse is cheaper.
- Follow docs/stack-adaptation.md for any non-default swaps.
- One component at a time. Document what changed and why.

After the survey, do this:
1. Deploy the chosen stack (wrangler login if needed).
2. Apply schema.sql and set ADMIN_PASSWORD (not the example from .dev.vars.example).
3. Customize form fields in schema.sql for my use case (see below).
4. Test /f/:slug submit flow and /admin (list submissions, CSV export).
5. Configure webhook if I gave you a URL.
6. Hand off: live URL, admin URL, monthly cost estimate, and how to edit fields in v1 (SQL).

My form:
- Purpose: [contact / intake / waitlist / application / other]
- Fields I need: [e.g. name, email, company, message, how did you find us]
- Expected volume: [e.g. ~50 submissions/month]

My stack (fill what you know; the agent should still confirm):
- Website hosting: [Cloudflare / Vercel / WordPress / other / not sure]
- Cloudflare account: [yes / no / not sure]
- Existing database: [none / D1 / Supabase / Neon / other]
- Team admin access: [just me / multiple people with SSO]
- Webhook or notification target: [Slack URL / Zapier / email via n8n / none yet]
- Budget: [$0 preferred / already paying for X]
```

---

## Shorter prompt (quick start)

```
Clone https://github.com/Unformalai/just-forms and deploy it for me on Cloudflare Workers + D1.

Read AGENTS.md first. Ask me docs/stack-survey.md questions before swapping any infrastructure.

I need a [contact/intake] form with: [fields].

Default to the cheapest stack. Hand off the live URL, admin login, and cost estimate when done.
```

---

## What the agent should not do

- Skip the stack survey
- Add Supabase/Neon/Vercel without a reuse justification
- Position this as a hosted Unformal product
- Promise Tally feature parity (no builder, payments, or file uploads in v1)

If I only need a hosted no-code form, tell me to use Tally instead.
