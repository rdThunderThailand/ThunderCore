# Session Log

Running log of what each work session changed, so anyone (or any AI assistant)
picking up the project can see what was done and continue without re-deriving it.

**Read this file before starting work.** Newest entry first. When you finish a
session, add a new entry at the top using the template at the bottom.

Pairs with `CLAUDE.md` (how the codebase works) and `docs/adr/` (why key
decisions were made). This file is the *history*; those are the *rules*.

---

## 2026-07-17 — Dev bypass + mock seam (tenants, applications)

**Branch:** `feat/auth` · **Commits:** `0519f8c` (tenants), `8d1e736` (applications)

**Goal:** run the frontend on mock data before the Thunder Core REST API exists.
Supabase and most of `src/utils/supabase/*`, `src/utils/auth-context`, several
feature clients, shared UI (Modal/Pagination/SearchInput/table-skeleton) and
`src/hooks/*` had been deleted intentionally in a prior cleanup.

**Done + verified (browser E2E — page renders mock data):**
- **Dev bypass infra:** `src/lib/dev.ts` — `isDevBypass()`, `getDevRole()`.
  Env flags `NEXT_PUBLIC_DEV_BYPASS` + `NEXT_PUBLIC_DEV_ROLE` (both `NEXT_PUBLIC_`
  so server seam and client Header/SideBar agree). Role now comes from env, not
  hardcoded. Change the role → restart `pnpm dev`.
- **tenants surface:** `src/lib/tenants.ts` (seam) + `src/lib/mock/tenants.ts`
  (fixtures) + `src/features/platform-tenants/actions.ts` (`'use server'`).
  `/tenants` renders 3 mock tenants; create/edit/delete wired.
- **applications surface:** `src/lib/applications.ts` + `src/lib/mock/applications.ts`
  + `src/features/platform-applications/actions.ts`. `ApplicationHomeClient.tsx`
  rewritten lean & self-contained (inline table/modal/search) instead of restoring
  ~10 deleted dependencies. `/applications` renders 3 mock apps.
- **eslint:** added `argsIgnorePattern: '^_'` so `_`-prefixed unused args (seam
  params awaiting a REST body) don't warn.

**Pattern to copy for the next surface:**
`src/lib/<domain>.ts` (bypass → mock, else `throw` naming the missing endpoint)
→ `src/lib/mock/<domain>.ts` (fixtures) → `src/features/<domain>/actions.ts`
(`'use server'`, delegates to the seam) → client component uses `getDevRole()`,
never Supabase.

**Not done / next up:**
- These surfaces are still broken — their client components were deleted and need
  rebuilding before the mock pattern applies: **users, assets, members, settings**,
  and all `tenants/management/[id]/*` and `applications/management/[id]/*` sub-pages.
  `pnpm build` fails on them; `pnpm dev` per-route works for tenants/applications.
- Deferred lint error (left on purpose): `tenants-client.tsx:85` calls `setState`
  synchronously in a `useEffect` (`react-hooks/set-state-in-effect`). Benign;
  suggested fix = replace the `showDeleteSuccess` state-banner with sonner
  `toast.success()`.
- Deleted UI primitives and `src/hooks/*` are recoverable from git commit
  `6692233` if a rebuilt surface needs them.

---

## Entry template

```
## YYYY-MM-DD — <short title>

**Branch:** `<branch>` · **Commits:** `<sha>` …

**Goal:** <what this session set out to do>

**Done + verified:** <what shipped, and how it was checked>

**Not done / next up:** <what a follow-up session should pick up>
```
