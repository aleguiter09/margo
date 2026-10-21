# TODO — Margo

> Last audit: 2026-03-21 (roadmap + DX refresh)  
> Detailed daily milestones: see agent canvas / PR description for this audit.

---

## Architecture standard (target)

| Concern | Layer | Rule |
|---------|-------|------|
| Reads | Server Component → `services/` → Supabase | No `"use server"` on services |
| Writes | Client UI → `actions/` → `services/` | Zod + `ServerActionResponse` + `revalidatePath` |
| Shared catalogs | App layout → `DataProvider` | Accounts + categories once |
| Forbidden | `createClient` / mutation `fetch` in UI leaves | Keep client components thin |

Known deviation: `settings/services/settings.ts` uses `"use server"` (action/service mix) — fix in Phase A.

---

## Phase A — Quick wins (UI / DX / consistency)

[] **Doc:** Keep README + `.env.example` in sync when adding env vars
[] **UI/UX:** Analytics desktop layout — widen content on `lg+`, wrap dense tables in `overflow-x-auto`, avoid dual 5-col tables crushing in `lg:w-4xl`
[] **UI/UX:** Responsive shell — keep bottom nav on mobile; add desktop top/side nav (Home, Analytics, Settings); move logout out of primary nav into Settings
[] **UI/UX:** Dark mode — wire `next-themes` `ThemeProvider` (tokens already in `globals.css`); toggle in Settings; sync Sonner theme
[] **UI/UX:** Profile block in Settings — email from auth session, locale, theme; optional avatar initial
[] **Refactor:** Split settings into `actions/` + pure `services/` (remove `"use server"` from services)
[] **Refactor:** Replace `INCOME_PARENT_ID = "60"` with type/slug from category metadata
[] **UX:** Date picker presets (today, week, month, last 30 days) — i18n already has `quickSelect`
[] **UX:** Review transfer row display (sent vs received) and daily totals that sum both transfer legs
[] **Quality:** Integration-style tests for balance RPCs / movement services (mocked Supabase)

---

## Phase B — Portfolio differentiators (features)

### Tier 1 — High impact / portfolio wow

[] **Receipt capture (photo → movement)**  
  Camera/file upload → Supabase Storage → Vision/LLM extract (merchant, amount, date) → prefill `MovementForm` → user confirms.  
  Needs: storage bucket + RLS, server action, OCR provider (e.g. AI Gateway / Vision), UI entry from FloatingAdd.

[] **Smart insights strip on Home/Analytics**  
  Rule-based first (over-budget categories, MoM spend spikes, savings rate). Later: LLM narrative. Differentiates from “CRUD expense tracker”.

[] **CSV export / import**  
  Export movements filtered by date/account; import with column mapping. Recruiter-friendly “data portability” story.

### Tier 2 — Product depth

[] Account types + icons/colors (cash, bank, card, savings, investments)
[] Heuristic ordering: most-used account/category as form prefill
[] Movement templates (frequent merchants / amounts)
[] Goals / savings targets linked to accounts or categories
[] Credit-card / quotas widget polish (series UI already partial)
[] Multi-currency (schema + FX rates) — only if portfolio narrative needs it

### Tier 3 — Later / scale

[] Shared household (multi-user with roles) — large RLS redesign
[] Loans widget
[] Push / email digests for upcoming payments

---

## Security hardening (nice-to-have)

> Covered today by `SECURITY INVOKER` RPCs + table RLS (`auth.uid() = user_id`). Optional defense in depth.

[] Add explicit `auth.uid()` filter to `get_balance_timeline` / `get_accounts_balance_at` / `get_category_budget_progress`
[] Add explicit `user_id` filters in services (accounts, movements, budgets)
[] Harden INSERT `WITH CHECK` on `account` / `movement` / `user_category` (today `true`)
[] Make `account.user_id` NOT NULL
[] Set fixed `search_path` on balance RPCs
[] Email template for recover password (route via `/auth/confirm?next=/update-password`)
[] Verify sign-up when email confirmation is required (`createAccount` / `createSettings` without session)

---

## Optional refactors (from AUDITORIA-CODIGO.md)

[] L2 — Schemas Zod por dominio (sacar de `shared/utils/schemas.ts`)
[] L3 — Service `category-update.ts` (`isGlobal` vs custom)
[] L4 — Service `onboarding` en auth
[] L5/L6 — Tipos mínimos / segregados en movements
[] L9 — Tests accounts / categories / budgets
[] L10 — Naming unificado `*-actions.ts`
[] Split `MovementForm.tsx` (~418 LOC) into schedule / transfer / amount sections

---

## Completed (historical)

### Security & safeguards

[X] Version RLS policies (`009_version_rls_policies.sql`)
[X] Validate account / category delete + UNIQUE category_budget
[X] Guard delete on global categories

### Quality

[X] Unit tests (vitest): schemas, series/installments, transfer merge, adapters, budgets, cron auth
[X] i18n NetWorth strings
[X] Decide fate of `movement.applied` (series + cron)
[X] Sanitize action errors; pagination on `getMovementsByFilters`
[X] `revalidatePath` for `/analytics` (and movements where applicable) after movement changes
[X] UpcomingPayments / FutureCommitments “See all” links
[X] CategoryComparison receives `accountId` from Analytics page
[X] Remove `is_default` from accounts; home defaults to all accounts
[X] Complete balance-after / backdating logic
[X] Legal pages, landing, design-system brand tokens

### Infrastructure & product history

[X] Modular architecture, i18n, RHF, shadcn, Lucide, joins, series, transfers, cron, PWA scaffold  
See git history and [`AUDITORIA-CODIGO.md`](./AUDITORIA-CODIGO.md) for the full SOLID audit trail.
