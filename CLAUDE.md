# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Read `docs/SESSION_LOG.md` first** — a running log of what each past session
> changed and what's left to do. It's the history/context that keeps you from
> re-deriving work already done. Add an entry there when you finish a session.

## What this is

Thunder Core is the **multi-tenant control plane** for the Thunder platform: it owns tenants,
users, memberships, roles, and the registry of applications that plug into it. Asset/fuel/SAI
modules are tenant-facing features built on top of that core. Every app-layer product
(e.g. cityzen) authenticates and authorizes against Thunder Core rather than running its own
identity stack.

Stack: **Next.js 16 App Router · React 19 · Thunder Core REST (core/v1) · Tailwind CSS 4 · TypeScript strict**.
Package manager: **pnpm** (`pnpm-lock.yaml`, `pnpm-workspace.yaml`).

Key libraries (grouped by job):

- **Data / backend:** `axios` (Thunder Core REST client), `jose` (JWT), `swr` (client fetching),
  `zustand` (client state, `src/store/`). `@supabase/supabase-js` + `@supabase/ssr` are still in
  `package.json` but unused dead weight — nothing imports them (see Architecture).
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
build + E2E against live Thunder Core (see Workflow Rules).

`node_modules/next/dist/docs/` holds the docs for this exact Next.js version — this is Next.js 16,
which differs from older App Router conventions. Consult it before writing framework code
(see `AGENTS.md`).

## Architecture

**This app is the frontend. It never talks to Supabase.** The backend is the (old,
parallel-running) Thunder_Core service — Thunder_Core owns the database; the frontend's only
correct data source is the **Thunder_Core REST API**. `src/utils/supabase/` has already been
deleted and no file imports it. See `docs/adr/0001-rest-boundary-and-supabase-seam.md` for why —
that ADR's Supabase-shim removal is now **done**; what's below describes the seam pattern it left
behind, which is still active. (`@supabase/*` remain in `package.json` but nothing imports them —
pruning the deps themselves is a separate, harmless cleanup, not blocking anything.)

The catch: Thunder_Core's REST surface is still thin, and the full set of endpoints the frontend
needs isn't known yet. So `src/lib/*.ts` seam functions for an unimplemented endpoint don't fall
back to Supabase anymore — they either serve fixture data under dev-bypass, or throw a
`"no REST endpoint yet"` error otherwise:

1. **Thunder Core REST API (the only correct source).** `src/features/auth/*` and `src/app/dashboard`
   call the Thunder Core `core/v1` API through a single server-side axios client,
   `src/lib/thunder-core.ts` (login/register, `/me`, `/me/memberships`). The app API key is a
   secret — **`thunder-core.ts` must only be imported from Server Components / Server Actions**,
   never from a `'use client'` file. Sessions are httpOnly cookies `tc_access_token` /
   `tc_refresh_token` set by the login Server Action, refreshed transparently in `src/middleware.ts`.

2. **Unimplemented endpoints = mock-or-throw behind a per-domain seam (no Supabase involved).**
   Every `src/lib/<domain>.ts` function checks `isDevBypass()` first — `true` returns fixture data
   from `src/lib/mock/<domain>.ts`; `false` on an endpoint that exists calls `thunderCore` (real
   axios); `false` on one that doesn't yet throws via a `noEndpoint(fnName)` helper (see
   `src/lib/applications.ts` for the pattern) so the failure is loud instead of silently serving
   stale/wrong data in production.

   **Rules for anything new or touched:**
   - Feature code (components, `actions.ts`) **must not call Thunder Core or any external API
     directly.** Route all data access through a per-domain module in `src/lib/`, named after
     **REST resources** (`listTenants`, `getTenant`, `createApplication`).
   - **`src/lib/*.ts` is the living catalog of endpoints the backend must build.** Each function's
     signature is the future REST contract. When an endpoint lands, swap that **one function's**
     `noEndpoint(...)` branch for a real `thunderCore` call — features calling it don't change.
   - The Go rewrite is a non-event for the frontend precisely because of this seam — it only ever
     swaps internals of `src/lib/*.ts`, one file at a time.
   - Check `docs/api-checklist.md` for which endpoints already exist on the backend before assuming
     one needs building.

**RBAC.** Roles are tiers keyed by `roles.role_type` (NOT `roles.code`, the persona):
`super_admin > company_admin > executive_viewer > viewer_auditor > operator`. `rbac.ts` always
queries the DB as source of truth and normalizes legacy pre-migration role strings — don't trust
`app_metadata.role`.

**Routing** (App Router, route groups). Platform routes are split by tier into two route groups
under `(dashboard)/` — `(super-admin)` and `(company-admin)`:

- `src/app/(auth)/` — login, register, register/confirmed
- `src/app/(dashboard)/(super-admin)/` — platform-wide surfaces, all guarded with
  `requireRole('super_admin')`: `tenants` (+ `management/[id]/...` for assets, devices, members,
  settings), `applications` (+ `management/[id]/...` for scenario, members, portal, settings),
  `users`, `settings` (the `/settings?user=<id>` user-edit page), `no-access`, `redirect`.
- `src/app/(dashboard)/(company-admin)/[id]/` — **WIP, all files currently empty stubs, no
  guard/logic yet**: `dashboard`, `assets`, `members` (+ `members/[id]/settings`), `settings`.
  Intended as the company-admin-scoped counterpart to `(super-admin)/tenants/management/[id]/...`,
  keyed by tenant id (`[id]`) instead of living under `/tenants/management/`. Do not assume any
  behavior here beyond routing — check the file before building on it, per NO MAGIC.
- `src/app/dashboard/` — the post-login `/me` landing page (bare, outside both groups, no
  explicit RBAC guard — branches on `getCurrentUser()`/`getMyMemberships()` directly).

**Feature-folder convention.** UI + logic live under `src/features/<feature>/`, not in `app/`.
Route files (`src/app/.../page.tsx`) are thin and render a `*Client.tsx` from the matching feature
folder. Each feature owns its `actions.ts` (Server Actions), `components/`, and client components.
Shared: `src/lib/` (clients, repositories, validations), `src/types/`, `src/utils/`, `src/components/`.

**Import alias:** `@/*` → `./src/*`.

## Project structure

Where things live and where new code goes. `@/*` → `src/*`.

```
src/
├── app/                      # Next.js App Router — routes ONLY (thin)
│   ├── (auth)/               #   login, register, register/confirmed
│   ├── (dashboard)/
│   │   ├── (super-admin)/    #   tenants, applications, users, settings, no-access, redirect
│   │   │                     #   (+ management/[id]/… nested) — all require_role('super_admin')
│   │   ├── (company-admin)/  #   [id]/{dashboard,assets,members,settings} — WIP, empty stubs,
│   │   │                     #   no guard/logic yet. Verify before building on it.
│   │   └── layout.tsx
│   └── dashboard/            #   post-login /me landing
│       page.tsx              # each page.tsx is thin: renders a *Client from features/
│
├── features/<feature>/       # UI + logic per feature (the real code lives here)
│   ├── <Feature>Client.tsx   #   client/entry component the route renders
│   ├── actions.ts            #   Server Actions ('use server') — delegate to src/lib seam
│   └── components/           #   feature-local components
│   # current: auth, platform-tenants, platform-applications
│
├── lib/                      # Data layer = the living endpoint catalog (see Architecture)
│   ├── thunder-core.ts       #   server-only axios client for Thunder Core core/v1 (auth)
│   ├── <domain>.ts           #   per-domain seam: REST contract; bypass→mock, else throw
│   ├── dev.ts                #   isDevBypass(), getDevRole() — dev bypass via env
│   └── mock/<domain>.ts      #   fixtures served when NEXT_PUBLIC_DEV_BYPASS=true
│
├── components/               # Shared UI (layout/, ui/, toast) — not feature-specific
├── models/                   # Domain entity types (Application, Asset, Log)
├── types/                    # Shared TypeScript types (index.ts barrel)
├── store/                    # Zustand client state (useAuthStore)
├── i18n/                     # Translations + context
└── utils/                    # Small helpers (cn, …). NOTE: utils/supabase was deleted — do not re-add.
```

**Rules of thumb for new code:**

- New page → thin `app/.../page.tsx` that renders a `*Client.tsx` from `features/`.
- New data access → a function in `src/lib/<domain>.ts` (never call axios/Thunder Core from components directly).
- Mutations → `features/<feature>/actions.ts` (`'use server'`) that call the `src/lib` seam.
- Running without a backend → guard with `isDevBypass()` and serve `src/lib/mock/<domain>.ts`.

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
