# Margo — Personal finance tracker

Margo helps you track accounts, income and expenses, budgets, and net worth — with recurring/installment series, transfers, and analytics — in one place.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase · next-intl · Recharts · Vercel

**Live:** [savv-finances.vercel.app](https://savv-finances.vercel.app/)

---

## Quick start

### Prerequisites

- Node.js **20+** and npm
- A [Supabase](https://supabase.com) project
- (Optional) [Vercel CLI](https://vercel.com/docs/cli) for production env parity

### 1. Clone & install

```bash
git clone https://github.com/aleguiter09/margo.git
cd margo
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in values from **Supabase → Project Settings → API**:

| Variable | Where it is used | Notes |
|----------|------------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server Supabase clients | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server clients | Public (RLS protects data) |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron / admin client only | **Secret** — never commit or expose client-side |
| `SITE_URL` | OAuth + auth email redirects | `http://localhost:3000` locally |
| `CRON_SECRET` | `/api/cron/apply-movements` auth | Required in production for Vercel Cron |

### 3. Database

Apply SQL migrations in order from `src/infra/supabase/migrations/` (via Supabase SQL editor or CLI), then regenerate types if the schema changes:

```bash
npm run db-types
```

Auth tips:

- Enable **Email** (and optionally **Google**) in Supabase Auth.
- Site URL / redirect URLs should include `SITE_URL` and `/auth/callback`, `/auth/confirm`.
- Password recovery must land on `/auth/confirm?next=/update-password`.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint (Next) |
| `npm run test` | Vitest (unit) |
| `npm run test:watch` | Vitest watch mode |
| `npm run db-types` | Regenerate `database.types.ts` from Supabase |

---

## Project structure

```
src/
├── app/                 # Routes (thin): (marketing), (auth), (app), api/cron
├── modules/             # Domain modules (accounts, movements, analytics, …)
│   ├── <domain>/
│   │   ├── actions/     # Server Actions — validate (zod), orchestrate, revalidate
│   │   ├── services/    # Data access + domain logic (Supabase)
│   │   ├── adapters/    # Api/DB → View models
│   │   ├── types/
│   │   ├── pages/       # Route page compositions
│   │   └── ui/          # Presentational / client leaves
├── infra/               # Supabase clients, migrations, i18n
├── ui/                  # shadcn primitives
└── messages/            # next-intl (en / es)
```

Design tokens and semantic colors live in `src/app/globals.css`. See `.cursor/rules/design-system.mdc`.

Collaboration rules for agents/contributors: [`AGENTS.md`](./AGENTS.md).

---

## Architecture convention (reads vs writes)

Use one pattern everywhere:

| Concern | Layer | Rule |
|---------|-------|------|
| **Reads** | Server Component → `services/` → Supabase | No `"use server"` on services; fetch in pages/layouts |
| **Writes** | Client UI → `actions/` (`"use server"`) → `services/` → Supabase | Zod validate; return `ServerActionResponse`; `revalidatePath` |
| **Shared catalog data** | App layout → `DataProvider` | Accounts + categories loaded once per session shell |
| **Never** | UI calling `createClient` / `fetch` for mutations | Keep browser leaves thin |

Cron (`vercel.json` → `/api/cron/apply-movements`) applies due series movements with `CRON_SECRET` + service role.

---

## Feature map (current)

- Accounts, categories (global + custom), budgets
- Movements: income / expense / transfer; recurring & installment series; `applied` balance timing
- Home dashboard: balance, last movements, expenses by category, budgets, upcoming payments
- Analytics: net worth, balance timeline, monthly cashflow, category comparison, future commitments
- Settings: accounts, budgets, categories, language
- Marketing landing + legal (privacy / terms)
- i18n: English / Spanish
- PWA scaffolding (`@ducanh2912/next-pwa`)

Roadmap and daily-sized tasks: [`TODO.md`](./TODO.md).

---

## Testing

```bash
npm run test
```

Unit tests live under `tests/` and mirror `src/` (schemas, adapters, movement/series utils, cron auth, delete guards). Prefer pure utils + mocked boundaries over full E2E for day-to-day work.

---

## Deploy (Vercel)

1. Import the GitHub repo in Vercel.
2. Set the same env vars as `.env.example` (production `SITE_URL` + `CRON_SECRET`).
3. Ensure Supabase Auth redirect URLs include the production domain.
4. Cron is declared in `vercel.json` (`0 5 * * *` → apply due movements).

---

## Contributing / contact

Issues and feature ideas welcome. Reach out at [aleguiter9@gmail.com](mailto:aleguiter9@gmail.com?subject=margo).
