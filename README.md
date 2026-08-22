# Just Forms

A small form app you host on your own Cloudflare account.

Unformal publishes this blueprint. You own the deploy. This is not a hosted SaaS.

If you need the next question, [unformal.ai](https://unformal.ai).

## Blueprint docs

This repo is a **template plus agent instructions**, not just deployable code. Before customizing for a customer, read:

| Doc | Purpose |
|-----|---------|
| [`AGENTS.md`](AGENTS.md) | Blueprint agent workflow and rules |
| [`docs/stack-survey.md`](docs/stack-survey.md) | Questions to ask about their existing tech |
| [`docs/architecture.md`](docs/architecture.md) | Reference architecture (Workers + D1) |
| [`docs/stack-adaptation.md`](docs/stack-adaptation.md) | How to swap DB, hosting, auth |
| [`docs/cost-preference.md`](docs/cost-preference.md) | Default to minimal cost (D1) |
| [`docs/agent-prompt.md`](docs/agent-prompt.md) | Copy-paste prompt for Claude / Cursor |

**Default stack:** Cloudflare Workers + D1. Only swap components when the customer already runs something else and reuse saves money.

## What you get

- Public form at `/f/:slug` (seeded example: `intake`)
- Submissions in D1
- Thank you page
- Passworded admin: forms, submissions, settings
- Optional webhook on submit
- Optional Turnstile if you set the env vars

No payments. No file uploads. No builder. The 80 percent form.

## Ten-minute deploy

```
pnpm i
npx wrangler d1 create just-forms
# paste database_id into wrangler.jsonc
npx wrangler d1 execute just-forms --file=schema.sql
pnpm build && npx wrangler deploy
```

Then set the admin password:

```
npx wrangler secret put ADMIN_PASSWORD
```

Optional Turnstile:

```
npx wrangler secret put TURNSTILE_SITE_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Local:

```
cp .dev.vars.example .dev.vars
pnpm i
pnpm db:local
pnpm dev
```

Open `/f/intake` and `/admin`. Default example password is in `.dev.vars.example`.

## Stack

SvelteKit, adapter-cloudflare, D1, Wrangler. `workers_dev` is on because this is your app.

## Notes

- `schema.sql` creates tables and seeds the `intake` form.
- Webhook URL lives in the `settings` table. Empty means skip.
- Turnstile is skipped when the secret is missing.
- Change `ADMIN_PASSWORD` before you share the URL.

## What this is not

Unformal is the product when a form is not enough. Just Forms is the thing you can run yourself when a form is enough.
