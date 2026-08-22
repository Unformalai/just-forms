# Cost Preference — Just Forms Blueprint

**Default rule: pick the lowest total monthly cost that meets the customer's requirements.** For most greenfield form deployments, that is Cloudflare Workers + D1 on free tiers.

Reuse existing paid infrastructure only when it avoids new vendors *and* does not increase total cost.

---

## Reference stack cost (default)

| Component | Typical cost | Free tier notes |
|-----------|--------------|-----------------|
| Cloudflare Workers | $0–5/mo | 100k requests/day free on Workers Paid ($5/mo) includes more; check current CF pricing |
| D1 | $0–5/mo | Generous free reads/writes for small forms; scales with submission volume |
| Turnstile | $0 | Free for most sites |
| Custom domain | $0 | If already on Cloudflare DNS |
| **Typical total** | **$0/mo** | Solo site, <1k submissions/mo, no CF Workers Paid needed |

**When reference stack stops being $0:**

- Very high traffic (hundreds of thousands of requests/mo)
- Workers Paid plan required for features (unlikely for a simple form)
- D1 storage exceeds free allocation (large text fields, years of retention)

For a contact/intake form on a small business site, reference stack cost is effectively **zero**.

---

## Comparison matrix

Rough order of monthly cost for the same form app at **~500 submissions/month**:

| Stack | Est. monthly | Best for |
|-------|--------------|----------|
| **Workers + D1** (reference) | **$0** | Greenfield, cost-sensitive, already on CF |
| Workers + D1 + CF Workers Paid | $5 | Need paid Workers features |
| Vercel Hobby + D1 (split) | $0–5 | Awkward split; avoid unless required |
| Vercel Pro + Neon free | $20+ | Org already on Vercel Pro for other apps |
| Supabase free + Workers | $0 | Already have Supabase project |
| Supabase Pro | $25+ | Already paying; marginal form cost $0 |
| Tally free tier | $0 | No self-host, no ownership, no embed control |
| Tally Pro | $29+ | Hosted builder, not this blueprint |

Numbers are directional. Check vendor pricing pages before quoting a customer. CF and Supabase tiers change.

---

## Decision rules

### Rule 1: Start at $0

Unless the survey reveals existing infra, recommend Workers + D1. Do not propose Vercel + Neon because it is familiar.

### Rule 2: Marginal cost of reuse

If the customer already pays for Supabase Pro ($25/mo) for their main app, adding form tables costs **$0 marginal**. That is a valid reason to swap the database off D1.

If they do not have Supabase yet, **do not** add it to save "learning D1." D1 is simpler for this blueprint.

### Rule 3: Tally is the hosted $0 option

When the customer wants:

- Drag-and-drop builder
- No deploy step
- No code/SQL
- Free tier is enough

Say: **use Tally.** Just Forms is for people who want to own the stack and embed the form in their site. This aligns with Unformal's positioning: we are not fighting Tally on free forms.

### Rule 4: Do not stack vendors

Bad: Vercel + Neon + Clerk + Resend + Turnstile for a 50-submission/mo contact form.

Good: Workers + D1 + webhook to email they already receive.

Each new vendor is a billing surface and an ops surface. Justify every one.

### Rule 5: Volume thresholds

| Submissions/mo | Guidance |
|----------------|----------|
| < 1,000 | Reference stack. $0. |
| 1k – 10k | Reference stack likely still $0–5. Recheck D1 limits. |
| 10k – 100k | Model D1 + Workers cost. Consider retention policy (archive old submissions). |
| > 100k | Not a "simple form" anymore. Revisit architecture; may need queue, analytics DB. |

---

## How to present cost to the customer

Use this template:

```markdown
## Cost options

### Recommended: Cloudflare Workers + D1
- Est. $0/mo at your volume (~X submissions/mo)
- You own the data in your Cloudflare account
- One deploy command, no new vendors

### If we reuse your existing Supabase/Neon
- Est. $0 marginal (you already pay $Y/mo for the project)
- Submissions live next to your app data
- Slightly more setup, same ops you already run

### If you do not want to self-host
- Tally free tier: $0, hosted, less control
- Not this blueprint
```

Always show recommended first. Only show alternatives the survey surfaced.

---

## Hidden costs to mention

| Cost | Notes |
|------|-------|
| Engineer time | First deploy ~30–60 min with this blueprint. SQL field edits ongoing. |
| Domain/DNS | $0 if on Cloudflare; otherwise standard registrar cost |
| Webhook targets | Zapier/Make tiers if they route there |
| Compliance | GDPR export/delete is manual in v1 (admin CSV, SQL delete) |
| Opportunity cost | Building a form instead of using Tally. Fine if ownership matters. |

---

## Agent checklist

- [ ] Quoted reference stack cost first
- [ ] Any swap has a marginal-cost justification, not preference
- [ ] Mentioned Tally if they do not need self-host
- [ ] Did not add vendors the customer does not already use
- [ ] Volume estimate documented
- [ ] Linked to current vendor pricing if customer asks for exact numbers
