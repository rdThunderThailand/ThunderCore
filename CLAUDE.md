# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Thunder Core is the **multi-tenant control plane** for the Thunder platform: it owns tenants,
users, memberships, roles, and the registry of applications that plug into it. Asset/fuel/SAI
modules are tenant-facing features built on top of that core. Every app-layer product
(e.g. cityzen) authenticates and authorizes against Thunder Core rather than running its own
identity stack.

Stack: **Next.js 16 App Router · React 19 · Supabase (Postgres + Auth + RLS) · Tailwind CSS 4 · TypeScript strict**.
Package manager: **pnpm** (`pnpm-lock.yaml`, `pnpm-workspace.yaml`).

Key libraries (grouped by job):
- **Data / backend:** `axios` (Thunder Core REST client), `@supabase/supabase-js` + `@supabase/ssr`
  (stopgap DB access), `jose` (JWT), `swr` (client fetching), `zustand` (client state, `src/store/`)
- **Forms / validation:** `react-hook-form` + `@hookform/resolvers` + `zod`
- **UI:** `lucide-react` (icons), `sonner` (toasts), `clsx` + `tailwind-merge` (class merging), `recharts` (charts)
- **Maps / calendar:** `mapbox-gl` + `react-map-gl`, `@fullcalendar/*`
- **Ops:** `@vercel/analytics`, `@vercel/speed-insights`

## Commands

```bash
pnpm dev      # next dev — local server on :3000
pnpm build    # next build — production build (Verify Before Done: not sufficient on its own for Thunder-dependent features)
pnpm start    # serve the production build
pnpm lint     # eslint (next core-web-vitals + typescript configs)
```

No test runner is configured — there are no unit/e2e tests in the repo. Verification is manual
build + E2E against live Thunder Core / Supabase (see Workflow Rules).

`node_modules/next/dist/docs/` holds the docs for this exact Next.js version — this is Next.js 16,
which differs from older App Router conventions. Consult it before writing framework code
(see `AGENTS.md`).

## Architecture

**This app is the frontend. It should never talk to Supabase.** The backend is the (old,
parallel-running) Thunder_Core service — Thunder_Core owns the database; the frontend's only
correct data source is the **Thunder_Core REST API**. The Supabase deps (`@supabase/*`) and
`src/utils/supabase/` were **copied in by mistake** from the old backend codebase; they are not an
intended part of this app. Target end-state: **zero Supabase in this repo.**
See `docs/adr/0001-rest-boundary-and-supabase-seam.md`.

The catch: Thunder_Core's REST surface is still thin (basically auth), and the full set of endpoints
the frontend needs isn't known yet. So ~23 files currently read Supabase directly as a temporary
**shim** for endpoints that don't exist. Don't big-bang remove it (features would lose their data)
and don't try to design the endpoint list up front — instead contain the shim so it removes cleanly
and *tells you which endpoints to build*:

1. **Thunder Core REST API (the only correct source).** `src/features/auth/*` and `src/app/dashboard`
   call the Thunder Core `core/v1` API through a single server-side axios client,
   `src/lib/thunder-core.ts` (login/register, `/me`, `/me/memberships`). The app API key is a
   secret — **`thunder-core.ts` must only be imported from Server Components / Server Actions**,
   never from a `'use client'` file. Sessions are httpOnly cookies `tc_access_token` /
   `tc_refresh_token` set by the login Server Action.

2. **Supabase = temporary shim behind a per-domain seam (to be deleted).** `app-registry` and
   `platform-tenants` still read Supabase via `src/utils/supabase/*` (`server.ts`, `admin.ts`,
   `client.ts`, `middleware-client.ts`). Treat every such call as a placeholder for a missing REST
   endpoint.

   **Rules for anything new or touched:**
   - Feature code (components, `actions.ts`) **must not import `utils/supabase` directly.** Route all
     data access through a per-domain module in `src/lib/` (same shape as `thunder-core.ts`), named
     after **REST resources** (`listTenants`, `getTenant`, `createApplication`) — not Supabase tables.
     Mark the shim: `// ponytail: Supabase shim — remove when GET /tenants exists`.
   - **`src/lib/*.ts` is the living catalog of endpoints the backend must build.** Each function's
     signature is the future REST contract. When an endpoint lands (old Thunder_Core or Go), swap that
     **one function's** body from a Supabase call to an axios call — features calling it don't change.
   - The Go rewrite is a non-event for the frontend precisely because of this seam — it only ever swaps
     internals of `src/lib/*.ts`, one file at a time.
   - **Migrate `'use client'` Supabase calls first** (highest-risk: browser-direct DB access guarded
     only by RLS/anon key, and impossible once Go owns the DB).
   - **Last step, only when no seam function calls Supabase anymore:** delete `@supabase/*` deps and
     `src/utils/supabase/`.

**RBAC.** Roles are tiers keyed by `roles.role_type` (NOT `roles.code`, the persona):
`super_admin > executive_viewer > company_admin > viewer_auditor > operator`. `rbac.ts` always
queries the DB as source of truth and normalizes legacy pre-migration role strings — don't trust
`app_metadata.role`.

**Routing** (App Router, route groups):
- `src/app/(auth)/` — login, register, register/confirmed
- `src/app/(dashboard)/(platform)/` — `app-registry` and `tenants` management surfaces (nested
  `management/[id]/...` for assets, devices, members, portal, settings)
- `src/app/dashboard/` — the post-login `/me` landing page

**Feature-folder convention.** UI + logic live under `src/features/<feature>/`, not in `app/`.
Route files (`src/app/.../page.tsx`) are thin and render a `*Client.tsx` from the matching feature
folder. Each feature owns its `actions.ts` (Server Actions), `components/`, and client components.
Shared: `src/lib/` (clients, repositories, validations), `src/types/`, `src/utils/`, `src/components/`.

**Import alias:** `@/*` → `./src/*`.

# Workflow Rules

- **Ask First (Pre-Execution Review):** ก่อนเขียนโค้ดหรือเปลี่ยนโครงสร้างหลัก ต้องเสนอ 2–3 ทางเลือกและรอการอนุมัติ
- **Risk tags:** R0 = irreversible (ขออนุญาตก่อน) / R1 = costly (ระบุเหตุผล) / R2 = easy (ทำได้เลย)
- **NO MAGIC:** ห้ามเดาว่ามีไฟล์/โฟลเดอร์อยู่ ถ้าไม่แน่ใจให้ถาม
- **Verify Before Done:** ต้องมีหลักฐานการทดสอบก่อนบอกว่าเสร็จ — ฟีเจอร์ที่พึ่ง external API (Thunder Core ฯลฯ) `npm run build` ผ่านอย่างเดียว**ไม่นับว่าเสร็จ** ต้องมี manual E2E checklist หรือระบุชัดว่ายังไม่ได้ verify กับ Thunder จริง
- **No Scope Creep:** ทำแค่ที่สั่ง ห้ามเพิ่มฟีเจอร์เอง ห้าม refactor โค้ดที่ไม่เกี่ยว

## Conventions

- camelCase (vars/functions), PascalCase (components/types), kebab-case (files), SCREAMING_SNAKE (constants)
- Boolean: is/has/should/can prefix; arrow functions; public API บนสุด helpers ล่าง
- ไฟล์ ≤ 300 บรรทัด; ไม่มี `any`, dead code, commented-out code
- Default = Server Components; `'use client'` เฉพาะ leaf nodes; mutations = Server Actions + `useActionState`
- ไม่ส่ง raw errors จาก Thunder/Supabase ออก frontend
- **ไม่ใส่ Claude เป็น contributor** — ไม่มี "Co-Authored-By: Claude" ใน commits
- **Destructive mutations ต้องมี confirm step** (`window.confirm` / AlertDialog / 2-step button)
- **Optimistic updates ต้องระบุ error strategy** เป็น comment กำกับ (fire-and-forget หรือ rollback + toast)
