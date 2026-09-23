# API Readiness — ทุกหน้าต้องการ endpoint อะไรบ้าง

สถานะ ณ 2026-07-20 (branch `feat/application`). แหล่งความจริง = `src/lib/*.ts` (seam = endpoint catalog).

**อัปเดต 2026-07-20:** auth/refresh + tenants ทั้งชุด promote จาก `/api/v0.1/` ขึ้น `core/v1` แล้ว
รวม **12 endpoints integrate แล้ว** (ดูหัวข้อ 1) — ตัวเลขด้านล่างเป็นสถานะก่อนหน้า

**สรุปตัวเลขเดิม: 4 endpoints integrate แล้ว / ~48 endpoints ยังไม่มี** — ทุกหน้าที่ไม่ใช่ auth วิ่งด้วย mock (`NEXT_PUBLIC_DEV_BYPASS=true`) และจะ throw ทันทีถ้าปิด bypass.

Supabase = **0 references เหลือแล้ว** (ลบครบ) ดังนั้นทุกอย่างที่ไม่ใช่ `thunder-core.ts` = ช่องว่างล้วนๆ

---

## 1. Integrate แล้ว (Thunder Core `/api/core/v1`)

| Endpoint | ฟังก์ชัน seam | หน้า | Verified |
|---|---|---|---|
| `POST /auth/login` | `loginRequest` | `(auth)/login` | ✅ E2E |
| `POST /auth/register` | `registerRequest` | `(auth)/register` | ✅ E2E |
| `GET /me` | `getCurrentUser` | `/dashboard` | ✅ E2E |
| `GET /me/memberships` | `getMyMemberships` | `/dashboard` | ✅ E2E |

| `POST /auth/refresh` | `refreshSession` (ยังไม่ต่อ) | — | ✅ 12/12 assert |
| `GET /tenants` | `getTenants` | `/tenants` | ✅ API 39/39 · ⚠️ ยังไม่ E2E |
| `GET /tenants/usage` | `getTenantUsageStats` | `/tenants` | ✅ API · ⚠️ ยังไม่ E2E |
| `POST /tenants` | `createTenant` | `/tenants` | ✅ API · ⚠️ ยังไม่ E2E |
| `GET /tenants/:id` | `getTenant` (ใหม่) | `.../settings` | ✅ API · ⚠️ ยังไม่ E2E |
| `PATCH /tenants/:id` | `updateTenant` | `/tenants`, `.../settings` | ✅ API · ⚠️ ยังไม่ E2E |
| `DELETE /tenants/:id` | `deleteTenant` | `/tenants` | ✅ API · ⚠️ ยังไม่ E2E |
| `GET /tenants/:id/dashboard` | `getTenantDashboard` | `.../management/[id]` | ✅ API · ⚠️ ยังไม่ E2E |

Session = httpOnly cookies `tc_access_token` / `tc_refresh_token`.

**Members (2026-07-20, backend only — ทีม frontend ต่อเอง):**

| Endpoint | seam fn ที่จะมาต่อ |
|---|---|
| `GET /tenants/:id/members` (`?page`,`?limit`,`?search`) | `getMemberships` |
| `POST /tenants/:id/members` | `addMembership` |
| `GET /tenants/:id/members/:memberId` | `getMemberDetails` |
| `DELETE /tenants/:id/members/:memberId` | `removeMembership` |
| `PATCH /tenants/:id/members/:memberId/role` | `updateMemberRole` |
| `GET /tenants/:id/members/:memberId/applications` | `getMemberApplications` |
| `POST /tenants/:id/members/:memberId/applications` | `assignApplicationToMember` |
| `DELETE /tenants/:id/members/:memberId/applications/:appId` | `removeApplicationFromMember` |
| `PATCH /users/:id` | `updateMemberProfile` |
| `POST /tenants/:id/invites` | (ต่อผ่าน `addMembership` fallback — ไม่มี seam fn แยก) |
| `GET /tenants/:id/invites` | ยังไม่ต่อ (BE พร้อมแล้ว, ยังไม่มี seam fn) |
| `DELETE /tenants/:id/invites/:invitationId` | ยังไม่ต่อ (BE พร้อมแล้ว, ยังไม่มี seam fn) |
| `GET /invites/accept?token=` | `getInviteDetails` (`src/lib/invites.ts`) |
| `POST /invites/accept` | `acceptInvite` (`src/lib/invites.ts`) |

**⚠️ 4 เรื่องที่ทีม frontend ต้องรู้ก่อนต่อ members** (สัญญาไม่ตรงกับ mock เดิม):

1. **ไม่มี field `role` เป็น string แล้ว** — คืน `role_type` + `role_code` แทน เพราะ DB จริงไม่มีค่า
   `'owner'|'admin'|'member'` เลย ที่มีคือ `admin_company`/`company_admin`, `operator_technician`/`operator`,
   `super_admin`, `executive_viewer`, `department_admin`, `main_staff` — map เป็น label ฝั่ง UI เอง
   (`role_type` = tier ใช้ตัดสินสิทธิ์, `role_code` = persona ใช้แสดงผล)
2. **`:memberId` คือ `memberships.id` ไม่ใช่ `user_id`** — สองค่านี้คนละคอลัมน์ และ `PATCH /users/:id`
   (แก้โปรไฟล์) ใช้ `user_id` ไม่ใช่ `memberId` ตัว response มีทั้งสองค่าให้
3. ~~**`POST /members` ต้องเป็น user ที่มีบัญชีอยู่แล้ว**~~ — **แก้แล้ว (2026-08-27):** รับ `{ email, role_code }`
   เหมือนเดิม แต่ถ้า email ยังไม่มีบัญชี จะไม่ 404 อีกต่อไป — fallback ไปสร้างคำเชิญแบบเดียวกับ
   `POST /tenants/:id/invites` แทน (token + accept flow, membership จริงเกิดตอน accept เท่านั้น) ผลลัพธ์เป็น
   2 shape ต่างกัน: user เดิม → membership object, email ใหม่ → `{ invitation_id, invite_url, ... }` —
   แยกด้วย `isPendingInvite()` ใน `src/types/members.ts`. company_admin ยังเชิญได้แค่ operator role
   เหมือน `/invites` เดิม
4. **revoke app access เป็น soft flag** (`is_active=false`) ไม่ได้ลบ row — grant ซ้ำหลัง revoke จะปลุกแถวเดิม
   คืน 201 ไม่ใช่ 409

**หมายเหตุ: `PATCH /users/:id` แก้โปรไฟล์ข้ามทุก tenant** เพราะตาราง `users` เป็น global
tenant admin แก้ชื่อสมาชิก = ชื่อเปลี่ยนใน tenant อื่นด้วย (อนุญาตเพราะหน้า member settings ต้องใช้
ไม่ใช่เพราะไม่มีผล) ถ้าอนาคตต้องการโปรไฟล์แยกราย tenant ต้องไปเก็บที่ `memberships`

เทสต์ (ที่ repo Thunder_Core, dev server ต้องรัน — ใส่ `TC_BASE_URL` ถ้า Next เด้งไป port อื่น):
```
node --env-file=.env tests/api/auth-refresh.test.mjs      # 12 assert
node --env-file=.env tests/api/tenants-core-v1.test.mjs   # 39 assert
node --env-file=.env tests/api/members-core-v1.test.mjs   # 46 assert
node --env-file=.env tests/api/invites-core-v1.test.mjs   # 33 assert
```

**⚠️ "ยังไม่ E2E" หมายถึงอะไร:** สัญญาฝั่ง API ยืนยันครบด้วย 39 assert (ชื่อ field ตรงกับที่
component อ่านจริง) แต่ยังไม่เคยเปิดเบราว์เซอร์ดูโดยปิด `NEXT_PUBLIC_DEV_BYPASS` เพราะ
`THUNDER_CORE_URL` ใน `.env` ชี้ไป `thundercore.vercel.app` ซึ่ง**ยังไม่มี endpoint ชุดนี้** (มีแค่ในเครื่อง)
ต้อง deploy Thunder_Core ก่อน หรือชี้ไป `http://localhost:3000` แล้วรัน frontend คนละ port

---

## 2. ยังไม่มี — จัดกลุ่มตามหน้า

### 2.1 Tenants (`/tenants`, `/tenants/management/[id]`) — `src/lib/tenants.ts`

| หน้า | Endpoint ที่ต้องมี | seam fn |
|---|---|---|
| `/tenants` | `GET /tenants` | `getTenants` |
| `/tenants` | `GET /tenants/usage` | `getTenantUsageStats` |
| `/tenants` | `POST /tenants` | `createTenant` |
| `/tenants` | `PATCH /tenants/:id` | `updateTenant` |
| `/tenants` | `DELETE /tenants/:id` | `deleteTenant` |
| `/tenants/management/[id]` | `GET /tenants/:id/dashboard` | `getTenantDashboard` |
| `/tenants/management/[id]/settings` | `PATCH /tenants/:id` (+ `contact_email`, `website_url`, `description`) | `updateTenant` |

### 2.2 Tenant Members — `src/lib/members.ts`, `src/lib/member-applications.ts`

| หน้า | Endpoint | seam fn |
|---|---|---|
| `.../members` | `GET /tenants/:id/members` (search + pagination) | `getMemberships` |
| `.../members` | `POST /tenants/:id/members` | `addMembership` |
| `.../members` | `DELETE /tenants/:id/members/:memberId` | `removeMembership` |
| `.../members` | `PATCH /tenants/:id/members/:memberId/role` | `updateMemberRole` |
| `.../members/[memberId]/settings` | `GET /tenants/:id/members/:memberId` | `getMemberDetails` |
| `.../members/[memberId]/settings` | `PATCH /users/:userId` | `updateMemberProfile` |
| `.../members/[memberId]/settings` | `GET /tenants/:id/members/:memberId/applications` | `getMemberApplications` |
| `.../members/[memberId]/settings` | `POST /tenants/:id/members/:memberId/applications` | `assignApplicationToMember` |
| `.../members/[memberId]/settings` | `DELETE …/applications/:appId` | `removeApplicationFromMember` |

### 2.3 Tenant Applications — `src/lib/tenant-applications.ts`

`GET|POST /tenants/:id/applications` · `PATCH|DELETE /tenants/:id/applications/:appId` ·
`GET /tenants/:id/applications/:appId/members` (`getMemberAppAccess`) ·
`POST|DELETE …/members/:memberId` (grant/revoke) ·
`POST /tenants/:id/applications/:appId/launch` → คืน launch URL (`launchApplication`)

### 2.4 Tenant Assets / Devices — `src/lib/assets.ts` (ก้อนใหญ่สุด, 18 fn)

| กลุ่ม | Endpoint |
|---|---|
| Quota | `GET /tenants/:id/quota` |
| Assets | `GET|POST /tenants/:id/assets` · `GET|PATCH|DELETE /tenants/:id/assets/:assetId` |
| Assets | `POST /tenants/:id/assets/:assetId/unregister` |
| Dashboard | `GET /tenants/:id/assets/dashboard` (aggregate — รวม 3 call ได้ในเส้นเดียว) |
| Folders | `GET|POST /tenants/:id/asset-folders` · `PATCH` (rename/move) · `DELETE` · `PATCH /assets/:assetId/folder` |
| Credentials | `GET /tenants/:id/assets/:assetId/credentials` |
| Devices | `GET /assets/:assetId/devices` · `GET|PATCH /tenants/:id/devices/:deviceId` |
| Activity | `GET /assets/:assetId/activity-logs` |
| v2 | `GET /tenants/:id/assets-v2` (`tenant-assets-v2.ts` — asset+devices nested) |

**ข้อสังเกต:** server-side validation ที่ mock ทำอยู่ (quota check, serial/MAC uniqueness, ห้าม move folder เข้าตัวเอง) ต้องย้ายไปฝั่ง backend ทั้งหมด — เป็น trust boundary

### 2.5 Applications (platform) — `src/lib/applications.ts`

| หน้า | Endpoint |
|---|---|
| `/applications` | `GET /applications` · `POST /applications` · `DELETE /applications/:id` |
| `/applications` | `GET /tenants?fields=id,name` (dropdown — reuse `GET /tenants` ได้) |
| `/applications/management/[id]` | `GET /applications/:id` |
| `.../settings` | `PATCH /applications/:id` |
| `.../settings` | `GET /applications/:id/api-key` · `POST /applications/:id/api-key/regenerate` |
| `.../settings` | `GET /applications/:id/tenants` · `POST|DELETE /applications/:id/tenants/:tenantId` |
| `.../members` | `GET /applications/:id/members` |
| `.../portal`, `/portal/domains`, `/portal/customization` | `PATCH /applications/:id` (portal fields: domains, branding) |
| `.../scenario` | `GET|PUT /applications/:id/scenario` |

### 2.6 Users / Settings — `src/lib/users.ts`

`GET /users` (`getUsers`) · `DELETE /users/:id` (`deleteUser`) — ใช้ทั้ง `/users` และ `/settings`

---

## 3. ช่องว่างที่ไม่ใช่ CRUD (ต้องตัดสินใจก่อนเสียบ API จริง)

1. **ไม่มี middleware / route protection** — ไม่มี `src/middleware.ts`; ทุกหน้า dashboard เข้าได้โดยไม่ต้อง login. ต้องมี `GET /me` guard + refresh flow ก่อน production
2. **ไม่มี token refresh** — `tc_refresh_token` ถูก set แต่ไม่เคยถูกใช้ ต้องมี `POST /auth/refresh`
3. **RBAC ยังไม่มีในเส้นทาง** — `getDevRole()` เป็นตัวตัดสิน role ทั้งหมด. เส้นที่ต้อง gate `super_admin` (regenerate API key, update scenario) มี `// ponytail:` คาไว้ว่ายังไม่ได้ enforce — ต้อง enforce ที่ backend ไม่ใช่ frontend
4. **`GET /me/permissions` (หรือฝัง role ใน `/me`)** — ยังไม่มีเส้นบอก role จริงของ user ต่อ tenant

## 4. หนี้ที่ควรเก็บกวาดก่อน integrate

| ที่ | ปัญหา |
|---|---|
| ~~`src/features/platform-users/users-clients.tsx:8`~~ | ~~`'use client'` import `deleteUser` จาก `@/lib/users`~~ — ✅ แก้แล้ว 2026-07-20: เพิ่ม `platform-users/actions.ts` เป็น Server Action boundary (build + E2E ผ่าน) |
| `src/features/platform-scenario/actions.ts` | return ข้อมูล hardcode ในตัว action เอง ไม่ผ่าน seam — เสียบ API จริงแล้วจะลืมไฟล์นี้ |
| `createApplication` ซ้ำ 2 ที่ | มีทั้งใน `lib/applications.ts` และ `lib/tenant-applications.ts` คนละ signature — ต้องตัดสินใจว่า REST เส้นเดียวหรือสองเส้น |
| in-memory state ใน bypass | api-keys, authorizations, scenario เก็บใน module-scope Map — หายเมื่อ restart (ตั้งใจ, มี `ponytail:` กำกับ) |

---

## 5. ลำดับที่แนะนำให้ backend ทำ

1. `POST /auth/refresh` + `/me` role → ปลดล็อก middleware และ RBAC (blocker ของทุกอย่าง)
2. `GET|POST|PATCH|DELETE /tenants` + `/tenants/:id/dashboard` → ปลดหน้า tenants ทั้งชุด (7 fn)
3. `/tenants/:id/members` + `/tenants/:id/applications` → ปลด member/app management (14 fn)
4. `/applications*` → ปลดฝั่ง platform applications (13 fn)
5. `/tenants/:id/assets*` → ก้อนใหญ่สุด ทำท้ายสุดได้เพราะโดดเดี่ยว (19 fn)
6. `/users` → 2 fn, ทำเมื่อไหร่ก็ได้
