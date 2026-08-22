# Just Forms

A small form app you host on your own Cloudflare account.

Unformal publishes this. You own the deploy. This is not a hosted SaaS.

If you need the next question, [unformal.ai](https://unformal.ai).

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
