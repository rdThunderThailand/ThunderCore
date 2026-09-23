# Session Log

Running log of what each work session changed, so anyone (or any AI assistant)
picking up the project can see what was done and continue without re-deriving it.

**Read this file before starting work.** Newest entry first. When you finish a
session, add a new entry at the top using the template at the bottom.

Pairs with `CLAUDE.md` (how the codebase works) and `docs/adr/` (why key
decisions were made). This file is the *history*; those are the *rules*.

---

## 2026-08-27 — Invite-new-member-by-email: send flow finished, accept flow built

**Branch:** `fix/tenants-lint` · **Commits:** none yet (uncommitted — user is actively editing
this checkout live in an editor; changes left uncommitted for review, see below)

**Goal:** user asked to add "invite a new member into a tenant via email." The admin-side send
flow turned out to already be built (`addMembership` → `POST /tenants/:id/members` falls back to
creating a `user_invitations` row + `invite_url` when the email has no account) — the user
finished surfacing that link in the invite modal mid-session. Testing that live surfaced the real
gap: clicking the invite link went nowhere.

**Done + verified (live curl against the real backend, both dev servers already running on
:3000/:3001, dev-bypass off):**
- **Root cause (FE):** no `/invites/accept` page existed at all, and `src/middleware.ts` redirected
  the (unauthenticated) invitee to `/login` while dropping the token from `next=` and leaking it
  onto `/login`'s own query string instead — the link was doubly broken.
- **`thunder_core_API/src/app/api/core/v1/invites/accept/route.ts`** — added `GET` (app-key only,
  no user session) that hashes the token, looks up `user_invitations`, and returns
  `{ email, status, has_account, tenant, role, expires_at }` so an invitee with no account yet can
  see who invited them before deciding to log in or register. Verified via direct curl with the
  app API key — correct tenant/role/email back for a real pending invite.
- **`src/middleware.ts`** — added `/invites/accept` to `PUBLIC_PATHS`; fixed the `next=` bug in both
  redirect branches (now preserves full path+query instead of just pathname).
- **New:** `src/types/invites.ts`, `src/lib/invites.ts` (seam: `getInviteDetails`, `acceptInvite`,
  dev-bypass mock), `src/features/invites/actions.ts`, `src/features/invites/AcceptInviteClient.tsx`,
  `src/app/(auth)/invites/accept/page.tsx`. Branches on invite status (pending/expired/accepted/
  cancelled), then on visitor state: logged in as a different email (blocked, sign-out CTA) /
  logged in as the matching email ("Accept & join" → `POST /invites/accept`) / not logged in with
  an existing account (`Sign in to accept` → `/login`, then reopen the link) / not logged in with
  **no** account yet.
- **Iterated past the first cut** (user showed the existing `/settings?user=<id>` profile-edit page
  as a style reference and asked for one link → fill in info → done, no separate register/login/
  reopen-the-link steps): the "no account yet" branch is now an inline form on `/invites/accept`
  itself (First Name, Last Name, Email locked to the invited address, Password, Confirm Password)
  instead of a redirect to `/register`. `completeInviteSignup` (new Server Action in
  `features/invites/actions.ts`) chains three already-existing, already-working endpoints in one
  submit: `POST /auth/register` (now takes optional `first_name`/`last_name` — `registerRequest` in
  `src/lib/thunder-core.ts` got a new optional third param for this) → `POST /auth/login` (sets the
  session cookies) → `POST /invites/accept` → `redirect('/dashboard')`. No new backend endpoint
  needed for this part; deliberately avoided pre-provisioning the Supabase auth user at invite time
  (would've needed a new password-set-via-token endpoint — more backend risk for the same end
  result).
- `EmailField` gained optional `defaultValue`/`readOnly` props and `/register/page.tsx` reads
  `?email=` — kept in even though the invite flow no longer routes through `/register` (harmless,
  backward-compatible, may still be useful for a direct register link).
- Confirmed via curl: `/invites/accept?token=<real pending token>` returns 200 (was a 307 loop to
  `/login?token=...` before this session) and renders the tenant ("AIS"), role ("Company Admin"),
  hidden `token`/`email` inputs, and the `firstName`/`lastName`/`confirmPassword` fields with a
  "Create account & join" submit — i.e. the final inline-form version, not the earlier redirect-to-
  `/register` version.
- `npx tsc --noEmit` clean in both repos; `npx eslint` clean on every touched/new file in both
  repos (backend has pre-existing unrelated errors elsewhere, untouched).

**Addendum — register gate blocked every invite signup; fixed with an invite-token bypass:**
User's live browser test of `completeInviteSignup` hit `Unable to create your account right now.
Please try again.` Reproduced directly with curl using a completely fresh, never-used email (not
the user's real one) — same failure: `POST /auth/register` → 403
`Permission denied: account creation is not enabled for this app`. Root cause: the `applications`
row behind `THUNDER_CORE_APP_API_KEY` has `allow_account_creation = false` in the DB — unrelated to
anything built this session, and not fixable through any endpoint (`allow_account_creation` is only
ever read in `auth/register/route.ts`, never written anywhere in the API surface). Did **not**
flip it directly in the database (would need Supabase dashboard/SQL access, and it's a broad
platform-wide switch, not scoped to invites — out of bounds for a one-off script without explicit
sign-off). User chose the better fix instead: **`thunder_core_API/src/app/api/core/v1/auth/register/route.ts`**
now accepts an optional `invite_token` in the body — if it hashes to a `user_invitations` row that
is `status: 'pending'`, not expired, and whose `email` matches the request's `email` exactly, the
`allow_account_creation` gate is bypassed entirely (a verified invite from a tenant admin is its
own authorization; anonymous self-registration is untouched, still gated as before). `registerRequest()`
in `src/lib/thunder-core.ts` grew an `inviteToken` option; `completeInviteSignup` now passes the
invite's own token through. **Verified end-to-end with curl, replicating the exact
register → login → accept chain the Server Action performs:** no-token register still 403s (gate
intact for anonymous signups); bogus token and mismatched-email token both correctly rejected
(`400 Invalid input: invite token is invalid, expired, or does not match this email`); the real
token + its matching email succeeded (`201`), logged in, and accepted — `test001@example.com` is
now a real `active` membership (`membership_id: a7239744-c286-41ae-9766-5886ef5de259`) in tenant
AIS. `tsc`/`eslint` clean on every file this addendum touched.

**Not done / next up:**
- Still never drove a real browser — no Chrome extension connection in this session. The curl chain
  above proves the backend contract end-to-end, but the actual form submit (cookies via the browser,
  not manual headers) and the "wrong email" / "already accepted" / "expired" / "has an account →
  sign in instead" card states are still unverified live.
- `docs/api-checklist.md`'s stale 404 note was already fixed by the peer session
  `thundercore-prj-frontend-d2` mid-session (not by this session) — but neither checklist doc has
  been updated yet for the new `invite_token` param on `POST /auth/register` added in this addendum.
- If `completeInviteSignup` fails partway (e.g. register succeeds but accept fails) the user is left
  logged in with an account but not yet a tenant member; the error message tells them to reopen the
  link and retry (`acceptInvite`/`POST /invites/accept` is idempotent-safe to retry), but this
  recovery path hasn't been exercised live either.
- Everything above is **uncommitted** in the primary checkout (not a job worktree — isolation was
  explicitly skipped this session via `.claude/settings.json` `worktree.bgIsolation: "none"`,
  because the running dev servers watch this exact directory and a worktree would've decoupled
  edits from what was being live-tested).

---

## 2026-07-21 — Auth/RBAC fix plan (T4–T6): token refresh, redirect loop, dead activation button

**Branch:** `feat/api` · **Commits:** this session — see below (T1–T3 + earlier work
already landed in `3da4091` before this entry)

**Goal:** work through `docs/plans/auth-rbac-fixes.md` (T1–T6, six independent fixes
from the prior session's middleware audit). T1–T3 and the `/no-access` Suspense
bug were already committed (`3da4091`) before this entry; this entry covers T4–T6.

**Done + verified:**
- **T4 — token refresh in middleware (FE).** `tc_refresh_token` was written on login
  but never read; access-token expiry logged everyone out even with a valid refresh
  token. Added `src/lib/auth-cookies.ts` (shared cookie-option helpers for login +
  refresh, so the two paths can't drift) and rewrote `src/middleware.ts` to call
  `POST /auth/refresh` when the access cookie is missing but the refresh cookie
  survives — persists the rotated refresh token, clears both cookies and redirects
  to `/login` on failure. Refresh cookie always resets to a sliding 30-day window on
  rotation (confirmed with user: no "remember me" flag survives to middleware, so
  this is the accepted simplification over adding a flag-carrying cookie).
  **Verified against the real BE and real middleware** (not just build): logged in
  as a real account via browser, then drove `localhost:3000/dashboard` with
  hand-crafted `Cookie` headers via Node — missing-access+valid-refresh → 200 +
  rotated cookies; corrupted refresh → 307 to `/login` + both cookies cleared, no
  loop; valid access token → 200 + zero `Set-Cookie` (confirms no needless refresh
  calls).
- **T5 — middleware redirect-loop branch removed (FE).** `src/middleware.ts` no
  longer redirects `/login` → `/dashboard` when a session cookie exists. That branch
  was the root cause of an infinite loop when a token is revoked server-side but not
  yet expired (dashboard 401s → redirects to `/login` → middleware sees the cookie
  → bounces back). Decided with user: delete the branch (plan's option A) rather
  than add a `/logout` route handler — a signed-in user who visits `/login` now just
  sees the login form.
- **T6 — dead "Activate Device" button removed (FE).** `activation-modal.tsx` POSTed
  to `/api/player/retrieve`, a route that doesn't exist anywhere in FE — 404 on every
  submit. Confirmed first that the modal *is* reachable from a real asset-row menu
  (not orphaned dead code) before deciding. Removed only the broken half: the
  "Activate Device" button and its `simulateActivation` handler. The "Retrieve"
  button (shows the activation code via the existing `getAssetCredentials` Server
  Action) still works and is untouched.

**Not done / next up:**
- BE test suite (`node tests/api/users-core-v1.test.mjs`) and the two T1 manual
  login checks (`napat@thunder.co.th`, `companyadmin@thunder.com`) from the plan
  were not re-run this session — T1's code change was build-verified only.
- T6 option B (real activate-by-code Server Action + BE endpoint) is still open if
  that feature is wanted; current state just removes the broken button.

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
