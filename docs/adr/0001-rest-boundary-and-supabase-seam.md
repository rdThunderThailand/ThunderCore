---
status: accepted
---

# Frontend talks only to Thunder_Core REST; Supabase is a mistaken copy to be removed

This app is the migrated Next.js **frontend**. The backend is the old, parallel-running
Thunder_Core service (later to be **rewritten in Go**), and it owns the database. The frontend's
only correct data source is the **Thunder_Core REST API**. The Supabase dependencies (`@supabase/*`)
and `src/utils/supabase/` were **copied in by mistake** when this repo was split off the old
backend codebase — they were never an intended part of the frontend. Target end-state: **zero
Supabase in this repo.**

Removing it now is not possible: Thunder_Core's REST surface is still thin (essentially auth), and
the full set of endpoints the frontend will need isn't known. So ~23 files currently read Supabase
directly as a temporary **shim** for endpoints that don't exist yet. We contain that shim behind a
per-domain module in `src/lib/` rather than removing it big-bang or leaving it scattered.

## Considered options

- **Delete Supabase now, stub the affected features** — rejected: takes ~23 features offline while
  the backend is still incomplete.
- **Keep Direct Supabase as an accepted long-term pattern** — rejected: it's not intended to exist
  at all; it reaches around the frontend's own backend into the DB, and duplicates authorization.
- **Design the full REST endpoint list up front, then build** — rejected: the needed endpoints
  aren't known yet; guessing them wastes effort.

## Consequences

- Feature code must never import `utils/supabase` directly — it goes through `src/lib/<domain>.ts`,
  whose functions are named after REST resources (`listTenants`, `getTenant`, `createApplication`).
- **`src/lib/*.ts` becomes the living catalog of endpoints the backend must build.** Each function
  signature is the de-facto REST contract; endpoints surface from real feature demand, not up-front
  design.
- When an endpoint lands (old Thunder_Core or Go), only that one function's body changes (Supabase
  call → axios call). The Go rewrite is a non-event for the frontend — it only ever swaps seam
  internals.
- `'use client'` components that hit Supabase directly are highest-risk (browser-direct DB access,
  guarded only by RLS + anon key, and impossible once Go owns the DB) and migrate first.
- Final step, once no seam function touches Supabase: delete `@supabase/*` deps and
  `src/utils/supabase/` entirely.
