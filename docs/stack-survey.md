# Stack Survey — Just Forms Blueprint

Run this before customizing the blueprint. The goal is to learn what the customer already runs so you reuse it instead of adding new vendors.

Ask these in order. Adapt wording for the channel (call, async doc, chat). Record answers in your handoff notes.

---

## Opening frame

> We're going to deploy a small form you own and host yourself. Before we pick infrastructure, I need five minutes on what you already use. The default is the cheapest stack that works. We only swap pieces if you already pay for something that fits.

---

## 1. Use case (qualify the blueprint)

| # | Question | What you're listening for |
|---|----------|---------------------------|
| 1.1 | What is this form for? (intake, contact, waitlist, application, feedback) | Complexity. Multi-step applications may need Unformal, not Just Forms |
| 1.2 | How many submissions per month, realistically? (10 / 100 / 1k / 10k+) | Cost tier and database choice |
| 1.3 | Does the form need file uploads or payments? | If yes, stop. Just Forms v1 does not do this |
| 1.4 | Do you need a drag-and-drop form builder, or is editing fields once in a while fine? | Builder expectation. v1 is SQL/code |
| 1.5 | Why not Tally (or Typeform, Google Forms)? | If answer is "I just want free hosted," recommend Tally. Blueprint is for ownership and embed |

**Disqualify politely if:** they need conversational follow-ups, heavy branching, payments, uploads, or a no-code builder with frequent edits.

---

## 2. Website and hosting

| # | Question | Maps to |
|---|----------|---------|
| 2.1 | Where does your main website run today? (Cloudflare, Vercel, Netlify, WordPress, custom VPS, nowhere yet) | Hosting swap |
| 2.2 | Do you already have a Cloudflare account with Workers enabled? | Reference stack ready? |
| 2.3 | Is the form embedded in your site (iframe or `/forms` path) or a standalone link? | Routing and CORS |
| 2.4 | Custom domain ready, or fine with `*.workers.dev` for now? | DNS setup scope |

**Decision hint:**

- Already on Cloudflare → ship reference stack, no hosting swap
- On Vercel, no CF account → consider Vercel adapter OR create free CF account (often still cheaper)
- WordPress only → standalone form URL on Workers is fine; embed via link or iframe

---

## 3. Database and data

| # | Question | Maps to |
|---|----------|---------|
| 3.1 | Do you already use a database? Which one? (none / Supabase / Neon / PlanetScale / RDS / Firebase / other) | Database swap |
| 3.2 | Do you need to query submissions from existing BI tools, Metabase, or a data warehouse? | Postgres may be justified |
| 3.3 | Any compliance requirement about where data lives? (EU only, specific cloud, on-prem) | Region and provider |
| 3.4 | Who else needs read access to submissions? (just you / team / automated jobs) | Auth and export needs |

**Decision hint:**

- No database, low volume → **D1** (default)
- Already on Supabase/Neon with spare capacity → **swap DB**, keep or move hosting
- Needs complex SQL analytics on existing Postgres → **swap DB** to their Postgres

---

## 4. Auth and admin

| # | Question | Maps to |
|---|----------|---------|
| 4.1 | Who will check submissions? One person or a team? | Password vs proper auth |
| 4.2 | Do you already use Clerk, Auth0, Supabase Auth, or Google Workspace SSO? | Auth swap |
| 4.3 | Is a shared admin password acceptable for now? | Reference auth is enough for solo operators |

**Decision hint:**

- Solo founder, <5 admins → **password cookie** (default)
- Team with existing SSO → swap admin auth only

---

## 5. Integrations and notifications

| # | Question | Maps to |
|---|----------|---------|
| 5.1 | Where should new submissions go? (email, Slack, CRM, spreadsheet, nowhere / check admin UI) | Webhook target |
| 5.2 | Do you already use Zapier, Make, n8n, or a custom webhook receiver? | Webhook config |
| 5.3 | Email provider in use? (Resend, Postmark, SendGrid, none) | Optional email adapter |

**Decision hint:**

- Webhook to existing automation is the default integration path
- Do not add email sending to the Worker unless they have no automation and explicitly want it

---

## 6. Budget and ops

| # | Question | Maps to |
|---|----------|---------|
| 6.1 | Target monthly infra cost for this form? ($0 / under $10 / under $50 / doesn't matter) | Stack tier |
| 6.2 | Comfortable running `wrangler deploy` or do you need fully managed? | Handoff complexity |
| 6.3 | Who maintains it after launch? (you / their dev / agency) | Documentation depth |

**Decision hint:**

- $0 target → **Cloudflare Workers + D1 free tier** (reference stack)
- Already paying for Vercel Pro + Neon → reuse, marginal cost $0
- "Doesn't matter" is not permission to overspend. Still start with reference stack.

---

## 7. Summary questions (close the survey)

| # | Question |
|---|----------|
| 7.1 | Anything we did not cover that you already pay for and want to reuse? |
| 7.2 | Hard deadline or "whenever"? |
| 7.3 | OK if I send a one-page stack recommendation before we write code? |

---

## Scoring sheet (for the agent)

After the survey, fill this in:

```
Customer: ___
Volume: ___ / month
Website host: ___
CF account: yes / no
Existing DB: none / D1 / Supabase / Neon / other: ___
Admin users: 1 / team
SSO: none / ___
Integrations: webhook to ___
Budget: $___/mo
Builder needed: yes → STOP / no

RECOMMENDED STACK:
  Hosting: ___
  Database: ___
  Auth: ___
  Swaps from reference: ___
  Rationale: ___
  Est. monthly cost: $___
```

Default when unsure: **Cloudflare Workers + D1 + password auth + webhook**. See `cost-preference.md`.
