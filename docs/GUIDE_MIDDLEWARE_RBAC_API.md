# คู่มือ: Middleware, RBAC และการเขียน API สองฝั่ง

สำหรับคนในทีม (และ AI ที่ช่วยเขียนโค้ด) ที่ต้องต่อ `thundercore` (frontend) เข้ากับ `Thunder_Core` (backend)

> **สถานะไฟล์นี้:** ส่วน "API สองฝั่ง" อ้างอิงโค้ดที่มีอยู่จริงทั้งสอง repo
> ส่วน "Middleware" เป็น **ข้อเสนอ** — `src/middleware.ts` ยังไม่มีในโปรเจกต์
> ส่วน "RBAC ฝั่ง frontend" ยังไม่ได้ implement เช่นกัน

---

## 0. ภาพรวม: ใครเชื่อใจใคร

```
Browser ──cookie(httpOnly)──> thundercore (Next.js Server)
                                   │
                                   │ axios: x-api-key + Authorization: Bearer
                                   ▼
                             Thunder_Core /api/core/v1
                                   │
                                   ▼
                              Supabase (Postgres)
```

กฎเหล็ก 3 ข้อ:

1. **Browser ไม่เคยเห็น token** — เก็บใน httpOnly cookie, JS อ่านไม่ได้
2. **Browser ไม่เคยเห็น `x-api-key`** — อยู่ใน env ฝั่ง server เท่านั้น (`THUNDER_CORE_APP_API_KEY`)
   ดังนั้น `src/lib/thunder-core.ts` **ห้าม** ถูก import จากไฟล์ที่มี `'use client'` เด็ดขาด
3. **Frontend ไม่ใช่ security boundary** — การเช็ค role ฝั่ง frontend คือ UX (ซ่อนปุ่ม)
   การเช็คจริงต้องอยู่ที่ Thunder_Core ทุกครั้ง เพราะ user แก้ request เองได้

ข้อ 3 คือหัวใจ อ่านซ้ำอีกรอบ

---

## 1. Middleware

### 1.1 หน้าที่ของมัน (และที่ไม่ใช่หน้าที่)

| ทำ                                                              | ไม่ทำ                                           |
| --------------------------------------------------------------- | ----------------------------------------------- |
| เช็คว่ามี cookie `tc_access_token` ไหม → ไม่มีก็เด้งไป `/login` | ไม่ verify ลายเซ็น JWT                          |
| เด้ง user ที่ login แล้วออกจาก `/login` ไป `/dashboard`         | ไม่เช็ค role (ยังไม่รู้ว่า user เป็นใครด้วยซ้ำ) |
| ต่อ session ด้วย refresh token เมื่อ access token หมดอายุ       | ไม่ query database                              |

**ทำไมไม่ verify JWT ใน middleware:** middleware วิ่งทุก request รวม navigation ย่อย
การ verify แปลว่าต้องมี public key + crypto ทุกครั้ง แลกมากับความปลอดภัยที่ได้เพิ่ม = ศูนย์
เพราะ Thunder_Core verify ให้อยู่แล้วทุกครั้งที่เรียก API จริง (`getApiAuth` → `supabase.auth.getUser(token)`)

ถ้าคนถือ cookie ปลอมผ่าน middleware เข้ามาได้ เขาจะเจอหน้าเปล่าที่ทุก data fetch ตอบ 401 — ซึ่งถูกต้องแล้ว

### 1.2 โค้ดที่ต้องเขียน — `src/middleware.ts`

```ts
import { NextResponse, type NextRequest } from "next/server";

// ponytail: เช็คแค่ว่า cookie มีอยู่ ไม่ verify — Thunder_Core verify ให้ทุก call อยู่แล้ว
// อัปเกรดเป็น verify jose ตรงนี้ก็ต่อเมื่อมีหน้าที่ต้อง render ข้อมูล sensitive ก่อน fetch เสร็จ

const PUBLIC_PATHS = ["/login", "/register", "/register/confirmed"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("tc_access_token")?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // ยังไม่ login แต่จะเข้าหน้าใน → เด้งไป login พร้อมจำปลายทางไว้
  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // login แล้วแต่ยังวนอยู่หน้า login → เด้งเข้าระบบ
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // กัน middleware วิ่งทับ static assets และ /api — matcher นี้สำคัญกว่าที่คิด
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**จุดที่คนพลาดบ่อย:**

- ลืม `matcher` → middleware วิ่งทับรูปภาพทุกไฟล์ ช้าลงทั้งเว็บ
- ใส่ `/api` ไว้ใน matcher → route handler ของตัวเองโดนเด้งไป `/login` งงกันทั้งทีม
- ใช้ `request.cookies.set()` แล้วคิดว่า browser จะได้ cookie — **ไม่ได้** ต้อง set บน `response.cookies`

### 1.3 Token refresh — ส่วนที่ backend ต้องสร้างก่อน

ตอนนี้ `tc_refresh_token` ถูก set ตอน login ([auth/actions.ts:56](../src/features/auth/actions.ts:56)) แต่**ไม่เคยถูกใช้เลย**
พอ access token หมดอายุ user จะเจอ 401 แล้วต้อง login ใหม่

ต้องมี `POST /api/core/v1/auth/refresh` ที่ Thunder_Core ก่อน (ยังไม่มี) รับ `{ refresh_token }` คืน `LoginSession` ก้อนเดิม

พอมีแล้ว ให้ทำ refresh ที่ **axios response interceptor** ไม่ใช่ที่ middleware:

```ts
// src/lib/thunder-core.ts — เพิ่มต่อจาก request interceptor เดิม
thunderCore.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    // ponytail: retry รอบเดียวพอ; วนซ้ำกว่านี้แปลว่า refresh token ตายแล้ว ให้ตกไป logout
    if (error.response?.status !== 401 || original._retried) throw error;

    original._retried = true;
    const refreshed = await refreshSession(); // เรียก POST /auth/refresh + set cookie ใหม่
    original.headers.Authorization = `Bearer ${refreshed.access_token}`;
    return thunderCore(original);
  },
);
```

**ทำไมไม่ทำที่ middleware:** middleware ไม่รู้ว่า token ใกล้หมดอายุจริงไหมโดยไม่ decode
และมันวิ่งทุก navigation — จะกลายเป็นยิง refresh รัวๆ ส่วน interceptor ยิงเฉพาะตอนโดน 401 จริง = ครั้งเดียวต่อการหมดอายุ

⚠️ `cookies().set()` เรียกได้เฉพาะใน Server Action / Route Handler เท่านั้น
ถ้า 401 เกิดตอน render Server Component จะ set cookie ใหม่ไม่ได้ → ให้ `redirect('/login')` แทน

---

## 2. RBAC

### 2.1 ลำดับชั้น (source of truth = `roles.role_type` ไม่ใช่ `roles.code`)

```
super_admin > company_admin > executive_viewer > viewer_auditor > operator
```

`roles.code` คือ "persona" (เช่น `city_officer`) ใช้แสดงผล — **ห้ามเอามาตัดสินสิทธิ์**
และ **ห้ามเชื่อ `app_metadata.role` ใน JWT** เพราะมีข้อมูลเก่าค้างจากก่อน migration

### 2.2 ฝั่ง Backend — บังคับใช้จริงตรงนี้

Thunder_Core มี helper ครบแล้ว ใช้ตามนี้:

```ts
import {
  apiHandler,
  getApiAuth,
  requireAppKey,
  requireSuperAdmin,
  type RouteContext,
} from "@/lib/api-utils";
import {
  internalError,
  requireTenantAdmin,
  requireUuid,
} from "@/lib/core-api-utils";
```

| Helper                                                     | ใช้เมื่อ                                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `requireAppKey(request)`                                   | **ทุก route** — เช็ค `x-api-key` ว่าเป็น app ที่ลงทะเบียนและ active                  |
| `getApiAuth(request)`                                      | ทุก route ที่ผูกกับ user — verify Bearer token คืน `{ user, role, adminClient }`     |
| `requireUuid(id, 'tenant id')`                             | **ทุก id ที่มาจาก URL** — กัน SQL/PostgREST injection และกัน 500 ปลอม                |
| `requireTenantAdmin(adminClient, user.id, role, tenantId)` | action ระดับ tenant — ผ่านถ้าเป็น `super_admin` หรือ `company_admin` ของ tenant นั้น |
| `requireSuperAdmin(role)`                                  | action ระดับ platform (สร้าง/ลบ tenant, regenerate api key)                          |
| `internalError('summary', err)`                            | error จาก DB — log รายละเอียด แต่ตอบ client แค่สรุป (กัน schema รั่ว)                |

**ลำดับการเรียกสำคัญ** — เช็คถูกที่สุดก่อน แพงที่สุดทีหลัง:

```
requireAppKey → requireUuid → getApiAuth → requireTenantAdmin → query
```

### 2.3 ฝั่ง Frontend — ใช้ซ่อน UI เท่านั้น

ตอนนี้ role มาจาก `getDevRole()` ใน [src/lib/dev.ts](../src/lib/dev.ts) ซึ่งอ่าน env — ใช้ได้แค่ตอน dev bypass

พอ API จริงมาแล้วให้เปลี่ยนเป็นอ่านจาก `getCurrentUser()` ที่มี field `role` อยู่แล้ว
([thunder-core.ts:29](../src/lib/thunder-core.ts:29)) แล้วเขียน helper เดียวจบ:

```ts
// src/lib/rbac.ts
import { getCurrentUser, type ThunderRole } from "./thunder-core";

const TIERS: ThunderRole[] = [
  "operator",
  "viewer_auditor",
  "company_admin",
  "executive_viewer",
  "super_admin",
];

/** ponytail: UX gate เท่านั้น — สิทธิ์จริงบังคับที่ Thunder_Core ทุก endpoint */
export async function hasAtLeast(tier: ThunderRole): Promise<boolean> {
  const { role } = await getCurrentUser();
  return TIERS.indexOf(role) >= TIERS.indexOf(tier);
}
```

ใช้ใน Server Component:

```tsx
{
  (await hasAtLeast("super_admin")) && (
    <RegenerateApiKeyButton appId={app.id} />
  );
}
```

**อย่าทำ:** ส่ง role ลงไปเป็น prop ให้ client component แล้วให้มันตัดสินใจเรื่อง security
ซ่อนปุ่มได้ แต่ Server Action ที่ปุ่มนั้นเรียกต้องเช็คซ้ำเสมอ (จริงๆ คือ Thunder_Core เช็คให้)

จุดที่มี `// ponytail:` คาไว้ว่ายังไม่ enforce — ต้องกลับมาปิดตอน API จริงมา:

- `regenerateApiKey` และ `updateApplicationScenario` ใน [src/lib/applications.ts](../src/lib/applications.ts)

---

## 3. เขียน API สองฝั่ง — ตัวอย่างเต็ม

ใช้ `GET /tenants` เป็นตัวอย่าง (เป็นเส้นที่ควรทำเป็นลำดับต้นๆ) ไล่ครบ 4 ชั้น

### ชั้นที่ 1 — Backend: `Thunder_Core/src/app/api/core/v1/tenants/route.ts`

```ts
import {
  apiHandler,
  getApiAuth,
  requireAppKey,
  requireSuperAdmin,
} from "@/lib/api-utils";
import { internalError } from "@/lib/core-api-utils";

export async function GET(request: Request) {
  return apiHandler(async () => {
    await requireAppKey(request);
    const { role, adminClient } = await getApiAuth(request);
    requireSuperAdmin(role);

    const { data, error } = await adminClient
      .from("tenants")
      .select(
        "id, name, type, status, contact_email, website_url, description, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw internalError("Failed to fetch tenants", error);
    }

    return { success: true, data: data || [] };
  });
}
```

สังเกต 4 อย่าง:

1. ทุกอย่างห่อใน `apiHandler` — มันแปลง message เป็น status code ให้เอง
2. `throw new Error('...')` ธรรมดา ไม่ต้อง `NextResponse.json({ error })` เอง
3. **คำขึ้นต้นของ error message เป็นตัวกำหนด status** ดูตาราง 3.1
4. response envelope คือ `{ success, data }` เสมอ

### 3.1 ตาราง error message → HTTP status (จาก `apiHandler`)

| message มีคำว่า                                       | status      |
| ----------------------------------------------------- | ----------- |
| `Unauthorized`, `Not authenticated`                   | 401         |
| `Permission denied`, `Forbidden`, `Only Super Admins` | 403         |
| `not found`, `Not found`                              | 404         |
| `already`, `Already`                                  | 409         |
| `Invalid`, `Validation`, `required`                   | 400         |
| อื่นๆ ทั้งหมด                                         | 500 (+ log) |

จำไว้: อยากได้ 404 ก็เขียน `throw new Error('Tenant not found')` แค่นั้น
อยากได้ 500 แบบไม่รั่ว schema ใช้ `internalError()`

### ชั้นที่ 2 — Frontend seam: `thundercore/src/lib/tenants.ts`

เปลี่ยนเฉพาะ **body ของฟังก์ชันเดียว** ไม่แตะ signature:

```ts
// ก่อน
export async function getTenants(): Promise<Tenant[]> {
  if (isDevBypass()) return MOCK_TENANTS;
  throw new Error(
    "getTenants: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data",
  );
}

// หลัง
import { thunderCore } from "./thunder-core";

export async function getTenants(): Promise<Tenant[]> {
  if (isDevBypass()) return MOCK_TENANTS;
  const res = await thunderCore.get<{ success: boolean; data: Tenant[] }>(
    "/tenants",
  );
  return res.data.data;
}
```

`res.data.data` ไม่ใช่พิมพ์ผิด — `res.data` คือ body ของ axios, `.data` ข้างในคือ envelope ของ Thunder_Core

**เท่านี้จบ** — ทุกหน้าที่เรียก `getTenants()` ใช้งานได้ทันทีโดยไม่ต้องแก้อะไร นี่คือเหตุผลที่มี seam ชั้นนี้

### ชั้นที่ 3 — Server Action (เฉพาะ mutation): `src/features/platform-tenants/actions.ts`

```ts
"use server";

import * as tenants from "@/lib/tenants";

export async function updateTenant(
  id: string,
  data: Partial<tenants.TenantInput>,
) {
  return tenants.updateTenant(id, data);
}
```

บางคนถามว่าทำไมต้องมีชั้นนี้ ในเมื่อมันแค่ส่งต่อ — เพราะ:

- **read** เรียก seam ตรงจาก Server Component ได้เลย ไม่ต้องมี action
- **write** ต้องผ่าน `'use server'` เพราะ client component เรียก `src/lib` ตรงไม่ได้ (จะลาก `x-api-key` ลง browser bundle)

### ชั้นที่ 4 — หน้าเว็บ

```tsx
// src/app/(dashboard)/(platform)/tenants/page.tsx — Server Component, เรียก seam ตรง
import { getTenants } from "@/lib/tenants";
import { TenantsHomeClient } from "@/features/platform-tenants/TenantsHomeClient";

export default async function TenantsPage() {
  const tenants = await getTenants();
  return <TenantsHomeClient initialTenants={tenants} />;
}
```

```tsx
// TenantsClient.tsx — 'use client', mutation ผ่าน Server Action
"use client";
import { updateTenant } from "./actions";

const handleSave = async (id: string, name: string) => {
  try {
    await updateTenant(id, { name });
    toast.success("บันทึกแล้ว");
  } catch {
    // ponytail: rollback + toast — ไม่ใช่ fire-and-forget
    setTenants(previous);
    toast.error("บันทึกไม่สำเร็จ");
  }
};
```

---

## 4. Checklist ต่อ 1 endpoint

**ฝั่ง Thunder_Core:**

- [ ] `requireAppKey` เป็นบรรทัดแรก
- [ ] `requireUuid` ทุก id ที่มาจาก path
- [ ] guard สิทธิ์ (`requireTenantAdmin` / `requireSuperAdmin`) ก่อน query
- [ ] error จาก DB ห่อด้วย `internalError` ไม่โยน error ดิบออกไป
- [ ] คืน `{ success: true, data }`

**ฝั่ง thundercore:**

- [ ] แก้ **body ของฟังก์ชันเดียว** ใน `src/lib/<domain>.ts` — ห้ามแก้ signature
- [ ] เก็บ `if (isDevBypass())` ไว้ (mock ยังต้องใช้พัฒนา offline)
- [ ] ลบคอมเมนต์ `// ponytail: ... when GET /xxx exists` ที่หมดอายุแล้ว
- [ ] ไม่มีไฟล์ `'use client'` ไหน import `@/lib/thunder-core` หรือ `@/lib/<domain>`
- [ ] ทดสอบทั้ง bypass เปิดและปิด — ปิดแล้วต้องได้ข้อมูลจริง ไม่ใช่ throw
- [ ] `pnpm build` ผ่าน + กดใช้จริงในเบราว์เซอร์ (build อย่างเดียวไม่นับว่าเสร็จ)

---

## 5. หมายเหตุ: Thunder_Core มีของมากกว่าที่ frontend ใช้อยู่

[docs/API_READINESS.md](API_READINESS.md) นับว่า integrate แล้ว 4 เส้น (auth ล้วน) แต่ Thunder_Core มี route พร้อมใช้มากกว่านั้น เช่น

```
/tenants/[id]/apps          /tenants/[id]/apps/enable    /tenants/[id]/apps/disable
/tenants/[id]/roles         /tenants/[id]/invites        /tenants/[id]/organizations
/organizations/[orgId]      /invites/accept              /bookings/*
```

ก่อนจะสั่งให้ backend สร้างเส้นใหม่ **ไปเช็ค `Thunder_Core/src/app/api/core/v1/` ก่อนเสมอ** — บางเส้นอาจแค่ต้อง map ชื่อให้ตรงกับที่ seam ต้องการ ไม่ต้องเขียนใหม่

⚠️ ที่ยืนยันแล้วว่า**ยังไม่มีจริง**และเป็น blocker: `POST /auth/refresh`
