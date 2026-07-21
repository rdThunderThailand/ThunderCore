# Session Log

Running log of what each work session changed, so anyone (or any AI assistant)
picking up the project can see what was done and continue without re-deriving it.

**Read this file before starting work.** Newest entry first. When you finish a
session, add a new entry at the top using the template at the bottom.

Pairs with `CLAUDE.md` (how the codebase works) and `docs/adr/` (why key
decisions were made). This file is the *history*; those are the *rules*.

---

## 2026-07-20 — Users path: BE/FE wired + settings page Save/Delete made real

**Branch:** `feat/api` · **Commits:** none yet (uncommitted)

**Goal:** finish the users batch from the handoff (`GET /users`, `DELETE /users/:id`),
then make the `/settings` page's Save and Delete buttons — found to be non-functional
UI stubs while checking the click-through flow — actually persist.

**Done + verified (backend test + live browser E2E against real Supabase):**
- **`GET /users` / `DELETE /users/:id`** (Thunder_Core, carried over from a prior
  session, verified this session): `tests/api/users-core-v1.test.mjs` run against
  `localhost:3001` — **10/10 passed**. `DELETE` is soft delete (`status='deleted'`,
  `is_active=false`, `deleted_at` set); confirmed by direct DB read.
- **`src/lib/users.ts`** seam: `getUsers`/`deleteUser` now call real axios, no longer
  `throw`. Added `updateUser(id, {first_name, last_name})` → `PATCH /users/:id`
  (backend only accepts these two fields — no endpoint yet for role/status/MFA).
- **`src/features/platform-settings/actions.ts`** (new) — Server Action boundary
  for the settings surface, delegates to the seam (same shape as
  `platform-users/actions.ts`).
- **`settings-clients.tsx`**: `handleSave` → real `updateUser`; `handleDeleteUser` →
  real `deleteUser` + redirect to `/users`. Role select and Active-status toggle are
  now `disabled` (`ponytail:` comment) since nothing persists them yet — leaving them
  editable would silently lie about what Save does.
- **`types/dashboard.ts`**: `Profile.role` loosened `UserRole` → `string`. The global
  roster returns `'super_admin'` or the literal `'User'` (matches `mock/users.ts`
  and how both `users-clients.tsx` and `settings-clients.tsx` already treat it) —
  `UserRole` is a per-tenant tier and doesn't have a generic value for this endpoint.
- **Browser E2E, done live**: `/users` list confirmed hitting real Supabase (not
  mock — matched by querying `users` table directly, live IDs ≠ mock IDs even
  though test emails repeat across sessions). Click-through `/users` → `/settings?user=...`
  confirmed correct user loaded. Save tested on a real row (`benyapa.thon@gmail.com`
  → renamed, DB `updated_at` changed). Delete tested end-to-end on a disposable
  throwaway user created via Supabase admin API for this purpose, then cleaned up
  after — confirmed soft-deleted in DB and removed from the `/users` list on redirect.
- Restored `AGENTS.md` (had been accidentally overwritten with a CLAUDE.md copy by
  a prior session) and removed two stray debug scripts from `Thunder_Core/`
  (`db-probe.mjs`, `db-test-select.mjs`).

**Gotcha hit this session:** the frontend dev server can be running on stale env —
it read `.env` at process start, so a `.env` edit after boot (e.g. flipping
`NEXT_PUBLIC_DEV_BYPASS`) doesn't take effect until restart. Also: both dev servers
(frontend :3000, backend :3001) died mid-session for an unclear reason, and a sloppy
restart command briefly ran both from the `Thunder_Core` directory — always start
each with an explicit subshell `cd` so the wrong app doesn't bind the wrong port.

**Not done / next up:**
- **E2E checkbox in `docs/api-checklist.md` for users (§7) still not ticked** —
  intentionally: what was verified was "GET/DELETE work, Save/Delete on the settings
  page work" via manual browser testing, not a scripted E2E run. Tick it once an
  automated E2E exists, or accept manual verification as sufficient and tick by hand.
- **Role / Active Status / MFA on `/settings` are decorative** (disabled inputs) —
  no backend endpoint exists yet for updating them. If that's wanted, needs its own
  design pass (role changes are RBAC-sensitive, not a simple field PATCH).
- **Nothing committed this session** — all changes above are still working-tree only.
- Everything in the prior handoff's "Open items not yet addressed" (tenants E2E,
  applications batch, assets batch, RBAC gaps, role-ladder doc mismatch) is still
  open and untouched.

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
