# Stack Adaptation — Just Forms Blueprint

How to swap components away from the reference stack. Only do swaps the stack survey justified. One component at a time.

Reference stack: SvelteKit on Cloudflare Workers + D1 + password auth + optional Turnstile + webhook.

---

## Decision tree

```
Start: reference stack (Workers + D1)
│
├─ Customer already on Cloudflare?
│   └─ YES → ship reference. Done.
│
├─ Customer has Postgres (Supabase / Neon / RDS) AND wants data there?
│   ├─ Keep Workers hosting → swap DB only (HTTP driver or Hyperdrive)
│   └─ Move hosting to Vercel → swap hosting + DB
│
├─ Customer on Vercel only, no DB?
│   ├─ Create free CF account → still reference stack (preferred for cost)
│   └─ Refuse CF → Vercel adapter + Neon free tier (higher cost, document why)
│
└─ Customer needs team SSO?
    └─ swap admin auth only, keep Workers + D1
```

---

## Swap: Database (D1 → Postgres)

**When:** Customer already runs Supabase, Neon, PlanetScale, or RDS and wants submissions alongside existing data.

**When not:** "We prefer Postgres" without existing infra. D1 is cheaper and the schema is SQLite-compatible.

### Steps

1. Provision database (or use existing project). Run `schema.sql` with Postgres syntax tweaks:
   - `INTEGER` booleans stay as `INTEGER` or convert to `BOOLEAN`
   - `datetime('now')` → `NOW()` or `CURRENT_TIMESTAMP`
   - Remove `INSERT OR IGNORE` → `INSERT ... ON CONFLICT DO NOTHING`

2. Replace `src/lib/server/db.ts` D1 calls with a Postgres client:
   - **Workers + Hyperdrive** (recommended if staying on CF): bind Hyperdrive to Neon/Supabase connection string
   - **Vercel / Node**: `@neondatabase/serverless` or `postgres` package

3. Update `src/hooks.server.ts` to attach the DB client instead of `platform.env.DB`

4. Update `wrangler.jsonc` or Vercel env with `DATABASE_URL`

5. Remove or keep D1 binding depending on migration status

### Files touched

| File | Change |
|------|--------|
| `schema.sql` | Postgres variant (consider `schema.postgres.sql`) |
| `src/lib/server/db.ts` | Query layer rewrite |
| `src/hooks.server.ts` | Client injection |
| `src/app.d.ts` | Type `App.Platform.env` |
| `wrangler.jsonc` | Hyperdrive binding or remove D1 |

**Effort:** Medium. Most work is the query layer. Keep SQL similar to ease porting.

---

## Swap: Hosting (Workers → Vercel)

**When:** Customer flatly refuses Cloudflare or entire org is Vercel-only with no CF account policy exception.

**When not:** Cost-sensitive greenfield. Workers + D1 is cheaper.

### Steps

1. Replace `@sveltejs/adapter-cloudflare` with `@sveltejs/adapter-vercel` in `svelte.config.js`

2. Move secrets to Vercel env vars (`ADMIN_PASSWORD`, Turnstile keys, `DATABASE_URL`)

3. Database must move off D1 unless you keep a separate CF account just for D1 (awkward). Pair with Postgres swap.

4. Update deploy docs in README

### Files touched

| File | Change |
|------|--------|
| `svelte.config.js` | Adapter swap |
| `package.json` | Adapter dependency |
| `wrangler.jsonc` | Remove or keep for D1-only deploy |
| `vite.config.ts` | May need Vercel-specific tweaks |

**Effort:** Low–medium for hosting alone. High if combined with DB swap.

---

## Swap: Admin auth (password → SSO)

**When:** Multiple team members need admin access with individual accounts, or org policy forbids shared passwords.

**When not:** Solo operator checking submissions once a day.

### Options

| Provider | Approach |
|----------|----------|
| Supabase Auth | `@supabase/ssr` in `hooks.server.ts`, protect `/admin/*` routes |
| Clerk | `@clerk/sveltekit` middleware pattern |
| Auth0 | OAuth callback route + session cookie |

### Steps

1. Add provider SDK and env vars
2. Replace `src/lib/server/auth.ts` session logic
3. Remove or gate the password login page
4. Keep the rest of the app unchanged

### Files touched

| File | Change |
|------|--------|
| `src/lib/server/auth.ts` | Rewrite |
| `src/hooks.server.ts` | Auth middleware |
| `src/routes/admin/login/` | Replace with OAuth flow |

**Effort:** Medium per provider. Do not swap auth and database to different vendors in the same PR unless necessary.

---

## Swap: Spam protection (Turnstile → other)

**When:** Customer cannot use Cloudflare Turnstile (policy, region, existing hCaptcha account).

### Steps

1. Replace `src/lib/server/turnstile.ts` verify call
2. Update form component widget in `src/routes/f/[slug]/`
3. Swap env var names in README and `.dev.vars.example`

**Effort:** Low.

---

## Swap: Framework (SvelteKit → Next.js)

**Not provided in this repo.** The reference implementation is SvelteKit. If the customer's entire stack is Next.js and they refuse SvelteKit:

- Treat as a port, not a config swap
- Reuse `schema.sql`, data model, and route structure as spec
- Budget significantly more time
- Still prefer Workers + D1 or their existing Postgres

Only recommend this when the customer has a hard framework constraint.

---

## Provider-specific quick notes

### Supabase

- Use existing project → new tables from `schema.sql`
- Auth swap: Supabase Auth for `/admin` if they already use it for their app
- Edge: `@supabase/supabase-js` works on Workers with fetch
- Cost: free tier generous for form volumes under 1k/mo

### Neon

- Serverless Postgres, pairs well with Vercel or Workers via Hyperdrive
- Branching useful for staging form changes
- Cost: free tier, then usage-based

### PlanetScale

- MySQL, not Postgres. Schema needs syntax changes (`TEXT` PKs work, no FK enforcement in older tiers)
- Prefer Neon/Supabase if customer already chose PlanetScale for other reasons

### Cloudflare D1 (default)

- No swap needed
- `wrangler d1 create` + paste `database_id` into `wrangler.jsonc`
- Free tier: 5M reads/day, 100k writes/day (check current CF pricing docs before quoting customers)

---

## What not to adapt

| Request | Response |
|---------|----------|
| "Can you make it multi-tenant SaaS?" | Out of scope. One deploy per customer. |
| "Add Stripe payments" | Different blueprint or Unformal |
| "Build a form builder" | v2 or recommend Tally |
| "Use our Tally form but store in our DB" | Defeats ownership goal |
| "Host it for us" | Unformal is conversations, not hosted forms |

---

## Documentation requirement

Every non-default swap gets a short note in the handoff:

```markdown
## Stack (non-default)
- Hosting: ___ (default: Cloudflare Workers)
- Database: ___ (default: D1)
- Auth: ___ (default: ADMIN_PASSWORD)
- Swapped because: ___
- Monthly cost estimate: $___
- Files changed: ___
```
