# Lingua AI — Vercel Deployment Guide

## Prerequisites

- Vercel account (Hobby free tier is sufficient for MVP)
- All credentials from `.env.local` ready
- Neon database with schema already pushed (`pnpm exec prisma db push`)

---

## Step 1 — Push the Production Database Schema

Run this against your Neon production database **before** deploying:

```bash
# Using the direct (non-pooler) connection string for migrations
DATABASE_URL="your-DIRECT_URL-value" pnpm exec prisma db push
```

Verify the tables were created in the Neon console under **Tables**.

---

## Step 2 — Deploy to Vercel

### Option A — Vercel CLI

```bash
pnpm add -g vercel
vercel --prod
```

### Option B — GitHub Integration

1. Push your repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Set **Framework Preset** to `Next.js`
5. Set **Root Directory** to `.` (default)
6. Add all environment variables (Step 3 below) **before** clicking Deploy

---

## Step 3 — Environment Variables in Vercel Dashboard

Go to **Project → Settings → Environment Variables** and add each of these:

### Required (Phase 1 — App won't start without these)

| Variable                   | Where to get it                                                          |
| -------------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`             | Neon → Project → Connection Details → **Pooled** connection string       |
| `DIRECT_URL`               | Neon → Project → Connection Details → **Direct** connection string       |
| `BETTER_AUTH_SECRET`       | Run `openssl rand -base64 32` locally                                    |
| `BETTER_AUTH_URL`          | Your Vercel deployment URL e.g. `https://lingua-ai.vercel.app`           |
| `ANTHROPIC_API_KEY`        | [console.anthropic.com](https://console.anthropic.com) → API Keys        |
| `UPSTASH_REDIS_REST_URL`   | [console.upstash.com](https://console.upstash.com) → Database → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Same Upstash dashboard                                                   |

### Required for Voice Features (Phase 2)

| Variable                    | Where to get it                                                    |
| --------------------------- | ------------------------------------------------------------------ |
| `GROQ_API_KEY`              | [console.groq.com/keys](https://console.groq.com/keys) — free tier |
| `AZURE_SPEECH_KEY`          | Azure Portal → Speech Service → Keys and Endpoint                  |
| `AZURE_SPEECH_REGION`       | Same page (e.g. `eastus`)                                          |
| `GOOGLE_CLOUD_TTS_API_KEY`  | Google Cloud Console → APIs → Text-to-Speech → Credentials         |
| `SUPABASE_URL`              | Supabase → Project → Settings → API                                |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page — use **service_role** key (server-side only)            |

### Optional (Phase 3 — Payments + Social Login)

| Variable                             | Where to get it                                          |
| ------------------------------------ | -------------------------------------------------------- |
| `STRIPE_SECRET_KEY`                  | [stripe.com](https://stripe.com) → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same Stripe dashboard                                    |
| `STRIPE_WEBHOOK_SECRET`              | Stripe → Webhooks → Add endpoint → Signing secret        |
| `GOOGLE_CLIENT_ID`                   | Google Cloud Console → OAuth 2.0 Client IDs              |
| `GOOGLE_CLIENT_SECRET`               | Same page                                                |

---

## Step 4 — Update `BETTER_AUTH_URL`

After your first deploy, Vercel assigns a URL (e.g. `https://lingua-ai-abc123.vercel.app`).

Update the `BETTER_AUTH_URL` environment variable in Vercel to match this exact URL, then **redeploy** (Vercel → Deployments → Redeploy).

If you add a custom domain later, update `BETTER_AUTH_URL` again to the custom domain.

---

## Step 5 — Verify the Deployment

Run through this checklist after deployment:

- [ ] `/` — Landing page loads
- [ ] `/register` — Can create an account
- [ ] `/login` — Can sign in
- [ ] `/dashboard` — Redirects to `/onboarding` on first visit
- [ ] `/onboarding` — Language + level selection works, saves to DB
- [ ] `/dashboard` — Shows progress after onboarding
- [ ] `/curriculum` — Unit browser loads
- [ ] `/lesson/1.1` — Lesson screen loads, AI teacher responds (requires `ANTHROPIC_API_KEY`)
- [ ] `/shadow` — Shadow mode loads phrases
- [ ] `/scenario` — 6 scenario cards shown
- [ ] `/review` — Shows "all done" if no vocabulary yet

### Check Neon for Data

After testing, verify rows appear in Neon Console:

- `User` — your test account
- `UserLanguage` — language + level from onboarding
- `Progress` — created after onboarding

---

## Step 6 — Custom Domain (Optional)

In Vercel → Project → Settings → Domains, add your domain.

Update `BETTER_AUTH_URL` to the custom domain and redeploy.

---

## Troubleshooting

| Symptom                                | Likely cause                                                      |
| -------------------------------------- | ----------------------------------------------------------------- |
| 500 on `/dashboard`                    | `DATABASE_URL` not set or schema not pushed                       |
| Auth redirects loop                    | `BETTER_AUTH_URL` doesn't match deployment URL                    |
| AI teacher not responding              | `ANTHROPIC_API_KEY` missing or out of credits                     |
| Rate limit errors immediately          | `UPSTASH_REDIS_REST_URL` or `TOKEN` missing                       |
| Pronunciation scoring returns fallback | `AZURE_SPEECH_KEY` not set — Claude fallback is active (expected) |
