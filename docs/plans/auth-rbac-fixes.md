# Plan: Auth / RBAC fixes

Findings from the 2026-07-21 middleware session. Six independent tasks, ordered by
impact. **Do one task per commit.** Each task below is self-contained — you do not
need the session that produced it.

## Two repos

| Alias | Path | What it is |
|---|---|---|
| **FE** | `/Users/arty/Desktop/Thunder/project/thundercore` | this repo — Next.js frontend |
| **BE** | `/Users/arty/Desktop/Thunder/project/Thunder_Core` | Thunder_Core backend, owns the DB |

Dev servers: FE on `:3000`, BE on `:3001` (`THUNDER_CORE_URL=http://localhost:3001`).
Supabase project `sfiefevtxalqjizdkcsw` (ThunderCore).

## Order

T1 first — it is the root cause of the reported bug and unblocks verifying T2/T3.
T5 and T6 need a product decision before coding; do not start them without an answer.

---

## T1 — `getUserRole` ignores `users.is_super_admin` (BE)

**Priority: highest.** Breaks backend authz *and* frontend RBAC for real super admins.

### Problem

`BE/src/utils/supabase/rbac.ts:25` derives the role tier **only** from membership rows.
A user with no membership falls through to `return 'operator'` — even when
`users.is_super_admin = true`.

### Evidence

Live DB, 7 users with `is_super_admin = true`:

| email | memberships | role_type | `getUserRole` returns |
|---|---|---|---|
| `sa@thunder.com` | 1 | super_admin | `super_admin` ✅ |
| `napatns42@gmail.com` | 1 | super_admin | `super_admin` ✅ |
| `admin@thunder.com` | 1 | company_admin | `company_admin` ⚠️ |
| `admin@thunder.platform` | 0 | — | `operator` ❌ |
| `napat@thunder.co.th` | 0 | — | `operator` ❌ |
| `natchapon@thunder.co.th` | 0 | — | `operator` ❌ |
| `b.natchapon.c@gmail.com` | 0 | — | `operator` ❌ |

Made worse by RLS: `memberships` SELECT policy is `is_tenant_member(tenant_id)`, so a
super admin with no membership reads **zero rows** even if rows existed for others.

Blast radius — `requireSuperAdmin(role)` gates real endpoints:
- `BE/src/app/api/core/v1/users/route.ts:10` — `GET /users`
- `BE/src/app/api/core/v1/users/[id]/route.ts:105` — `DELETE /users/:id`

and FE `requireRole('super_admin')` gates `/tenants`, `/users`, `/applications`.

### Change

`BE/src/utils/supabase/rbac.ts` — in `getUserRole`, **before** the memberships query,
read the caller's own `users` row and short-circuit:

```ts
// users.is_super_admin is platform-level and independent of tenant membership —
// a super admin with zero memberships must not fall through to 'operator'.
const { data: self } = await supabase
    .from('users')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()
if (self?.is_super_admin) return 'super_admin'
```

### Constraints — read before coding

- **Do NOT import the admin client into `rbac.ts`.** This file is imported by
  `'use client'` files (`BE/src/store/useAuthStore.ts`, `BE/src/hooks/useDashboardNav.ts`,
  `BE/src/features/app-registry/ApplicationHomeClient.tsx`). A service-role key there
  leaks to the browser. Use the `supabase` client already passed in.
- RLS allows this read: policy `Users edit own profile` is `ALL` on `auth.uid() = id`.
- `getUserRole` has ~65 call sites. Fixing it here fixes all of them — **do not** patch
  call sites individually.
- Keep the existing membership logic as the fallback for non-super-admins. Do not
  restructure the function.

### Verify

1. `pnpm build` in BE.
2. Log in as `napat@thunder.co.th` (0 memberships, `is_super_admin = true`) on FE :3000.
3. `/tenants`, `/users`, `/applications` must all render — before the fix they redirect
   to `/no-access`.
4. Log in as `companyadmin@thunder.com` — must still be `company_admin`, still blocked
   from `/users`. This is the regression guard: the fix must not promote anyone else.
5. `node tests/api/users-core-v1.test.mjs` in BE (existing suite, expects :3001).

### Risk

R1. Widens access for 4 accounts that *should* have had it. Confirm with the team that
`users.is_super_admin` is the intended source of truth for platform admin — if the
intent is "membership is the only truth", the fix is instead to give those 4 accounts a
`super_admin` membership row and leave the code alone.

---

## T2 — `requireTenantAccess` ignores `role === 'super_admin'` (FE)

**Latent today, one line.** No current user hits it, but it fires the moment someone is
super_admin via membership without the column set.

### Problem

`FE/src/lib/rbac.ts:60` lets super admins through on the `is_super_admin` **column only**:

```ts
if (session.isSuperAdmin) return
if (session.role !== 'company_admin') redirect('/no-access')
```

A session with `role: 'super_admin'` but `is_super_admin: false` falls to line 2 and is
redirected — a super admin denied tenant access.

### Change

```ts
// Either signal is enough: the column is platform-level, the tier may come from a
// super_admin membership. Requiring both would deny a legitimate super admin.
if (session.isSuperAdmin || session.role === 'super_admin') return
```

### Verify

`pnpm build` + log in as `sa@thunder.com` and open `/tenants/management/<any-id>` —
renders. No behaviour change expected for existing accounts; this is a latent-path fix.

### Risk

R2.

---

## T3 — `/settings` has no RBAC guard (FE)

### Problem

`FE/src/app/(dashboard)/(platform)/settings/page.tsx` reads `?user=<id>` and renders the
user-edit form with Save and Delete. It calls **no** guard, unlike its sibling pages.

**This is not a privilege-escalation hole** — verified that BE enforces
`requireSuperAdmin(role)` on both `GET /users` and `DELETE /users/:id`. A low-tier user
gets an empty form and failing buttons. It is a UX defect, not a security one. Do not
describe it as a vulnerability in the commit message.

### Change

Match the sibling pages (`users/page.tsx:7`, `tenants/page.tsx:7`):

```ts
import { requireRole } from '@/lib/rbac'
// ...
export default async function UserSettingsPage(props: PageProps) {
    await requireRole('super_admin')
    // ...unchanged
}
```

### Verify

Log in as `companyadmin@thunder.com`, open `/settings?user=<any-id>` → redirected to
`/no-access`. As `sa@thunder.com` → form renders as before.

### Risk

R2. Depends on T1 being correct — if `getUserRole` still returns `operator` for super
admins, this locks them out of `/settings` too.

---

## T4 — no token refresh; users are logged out at access-token expiry (FE)

**Highest real-world pain.** Largest task here.

### Problem

`FE/src/features/auth/actions.ts:56` writes `tc_refresh_token` (30 days when "remember"
is ticked). **Nothing ever reads it.** Grep confirms 3 references total: the `set`, the
`delete` in `logout()`, and the type declaration.

When `tc_access_token` reaches its `expires`, the browser drops it, middleware sees no
session, and the user is bounced to `/login` with a valid refresh token still sitting in
the jar.

BE already has the endpoint: `POST /auth/refresh`
(`BE/src/app/api/core/v1/auth/refresh/route.ts`).

### Contract

Request `{ refresh_token: string }` + `x-api-key`. Response is the same shape as
`/auth/login`:

```ts
{ access_token, refresh_token, expires_at, user_id }
```

**Supabase rotates the refresh token on every call. The new `refresh_token` MUST be
persisted — the old one is dead the moment this returns.** Getting this wrong logs
everyone out after one refresh. 401 means expired/revoked/already-rotated; the only
correct response is to clear both cookies and send the user to `/login`.

### Where this has to live — do not fight this

Next.js only allows cookie writes in a **Server Action, Route Handler, or middleware**.
It throws `Cookies can only be modified in a Server Action or Route Handler`
(`node_modules/next/dist/server/web/spec-extension/adapters/request-cookies.js:53`)
anywhere else. So refreshing inside the `thunder-core.ts` axios interceptor **cannot
work** — that runs during Server Component render.

**Do it in middleware.** It runs before render and can set cookies on the response.

### Change

`FE/src/middleware.ts` — when the access cookie is gone but the refresh cookie survives,
refresh and continue:

```ts
// Access cookie has `expires`, so the browser drops it exactly at expiry. That absence
// (with a surviving refresh cookie) is the whole trigger — no clock maths, and no
// refresh call on requests that already have a valid token.
if (!accessToken && refreshToken) { /* POST /auth/refresh, set both cookies on the response */ }
```

- Make the request with plain `fetch`, **not** `thunder-core.ts` — that module calls
  `cookies()` from `next/headers`, which is unavailable in middleware.
- Read `THUNDER_CORE_URL` / `THUNDER_CORE_APP_API_KEY` from `process.env` directly.
  They are server-side secrets; middleware is server-side, so this is fine — but never
  expose them to a client component.
- On refresh failure: delete both cookies on the response and redirect to `/login`.
- Set the new cookies with the same options as `actions.ts:48-63` (httpOnly, sameSite
  lax, `secure` in prod, `expires` from `expires_at * 1000`). Consider extracting those
  options to one shared constant so login and refresh cannot drift apart.

### Verify

Manual, and it needs a short-lived token — no test suite covers this.

1. Log in. Confirm both cookies exist in DevTools → Application → Cookies.
2. Delete **only** `tc_access_token`. Reload any dashboard page.
3. Expected: page renders, and `tc_access_token` is back with a **new** value, and
   `tc_refresh_token` has also changed (rotation).
4. Now corrupt `tc_refresh_token` and reload → redirected to `/login` with both cookies
   cleared. This is the failure path; do not skip it.
5. Confirm a normal request with a valid access token makes **no** call to
   `/auth/refresh` (check the BE terminal) — otherwise every page load hits the backend.

### Risk

R1. Touches the session path for every request. A bug here logs everyone out or, worse,
loops. Test the failure path (step 4) before merging.

---

## T5 — middleware redirect loop on a revoked-but-unexpired token (FE) — DECISION NEEDED

### Problem

`FE/src/middleware.ts` currently ends with:

```ts
if (hasSession && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

Middleware checks whether the cookie **exists**; pages check whether it **works**. When
a token is revoked server-side but the cookie has not reached its `expires`
(admin disables an account, password change), `/dashboard` gets a 401, calls
`redirect('/login')` at `FE/src/app/dashboard/page.tsx:20`, middleware sees the cookie
still present and bounces back to `/dashboard` — **infinite loop, user cannot recover
without clearing cookies manually.**

The page cannot fix this itself: it cannot delete cookies during render (see T4).

### Options

**A. Delete the branch (recommended).** Three lines out, no new file, loop gone. Cost: a
signed-in user who types `/login` sees the login form instead of being bounced to the
dashboard — which is what most apps do anyway, and logging in overwrites the stale
cookie.

**B. Add a `/logout` Route Handler.** New file that deletes both cookies and redirects;
change `dashboard/page.tsx:20` to `redirect('/logout')`. Keeps the auto-redirect
convenience. Costs a file and leaves every other 401 site needing the same treatment.

Ask before coding. If the answer is A, also check whether anything depends on the
auto-redirect (nothing found in this session — `login()` redirects to `/dashboard`
explicitly at `actions.ts:65`, so the flow does not rely on middleware).

Largely moot once T4 lands for the *expiry* case, but not for the *revoked* case.

### Risk

R2 for option A, R1 for option B.

---

## T6 — `/api/player/retrieve` does not exist (FE) — DECISION NEEDED

### Problem

`FE/src/features/platform-tenants/management/[id]/assets/components/activation-modal.tsx:43`
POSTs to `/api/player/retrieve`. There is **no route handler anywhere in FE**
(`find src/app -name route.ts` returns nothing). The modal is dead — it 404s on submit.

It is also the only client-side `fetch` in the codebase; everything else goes through
Server Components → `src/lib/*` → axios.

### Options

**A. Delete the modal** if activation-by-code is not a shipping feature. Deletion beats
addition — confirm nothing renders it first.

**B. Convert to a Server Action** calling a new `src/lib/<domain>.ts` seam function, per
`CLAUDE.md`. Needs a BE endpoint that does not exist yet; add the function with a
`// ponytail: Supabase shim — remove when POST /players/retrieve exists` marker.

Do **not** add a catch-all API proxy for this. There is no client-side data layer in this
app to justify one, and a catch-all that forwards an app API key is an open relay.

### Risk

R1 for A (deleting a feature), R2 for B.

---

## Notes for whoever picks this up

- No test runner in FE. Verification is `pnpm build` + `pnpm lint` + manual E2E.
  `pnpm build` alone is **not** sufficient for anything touching Thunder Core
  (`CLAUDE.md`, Verify Before Done).
- Set `NEXT_PUBLIC_DEV_BYPASS=false` in `FE/.env.local` for every check here — with
  bypass on, `isDevBypass()` short-circuits both middleware and `rbac.ts`, and you will
  verify nothing. The FE dev server caches env at boot; restart it after editing `.env`.
- Add a `docs/SESSION_LOG.md` entry when done.
- No `Co-Authored-By: Claude` in commits.

### Already done in the session that produced this plan (do not redo)

- `FE/src/middleware.ts` — uncommented the auth gate; added `/` as an exact-match public
  path so the landing page is reachable while signed out.
- `FE/src/lib/rbac.ts` — `TIERS` reordered to `company_admin > executive_viewer`, per
  `CLAUDE.md`; denials now go to `/no-access` instead of `/dashboard`.
- `FE/src/app/(dashboard)/(platform)/no-access/page.tsx` — new, unguarded by design.
