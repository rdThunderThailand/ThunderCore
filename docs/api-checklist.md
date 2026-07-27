# API Checklist

ติดตามทุก endpoint 3 ด่าน อัปเดตทุกครั้งที่ทำเสร็จ

| ด่าน | หมายถึง |
|---|---|
| **BE** | เขียนเสร็จที่ `Thunder_Core/src/app/api/core/v1/` + มี regression test ผ่าน |
| **FE** | `thundercore/src/lib/<domain>.ts` เรียก axios จริงแล้ว (ไม่ใช่ `throw`) |
| **E2E** | เปิดเบราว์เซอร์ใช้จริงโดยปิด `NEXT_PUBLIC_DEV_BYPASS` แล้วผ่าน |

**สถานะรวม: BE 21/65 · FE 11/65 · E2E 4/65** (2026-07-20)

> ⚠️ BE ผ่านไม่ได้แปลว่าใช้งานได้จริง — ทุกเส้นที่ E2E ยังไม่ติ๊ก ยังไม่เคยมีคนเปิดหน้าเว็บดู

---

## 1. Auth · `src/features/auth`

| Endpoint | ทำอะไร | BE | FE | E2E |
|---|---|:--:|:--:|:--:|
| `POST /auth/login` | ตรวจ email+password คืน session | ✅ | ✅ | ✅ |
| `POST /auth/register` | สมัครบัญชีใหม่ | ✅ | ✅ | ✅ |
| `GET /me` | ข้อมูลผู้ใช้ที่ล็อกอินอยู่ | ✅ | ✅ | ✅ |
| `GET /me/memberships` | รายการ tenant ที่ผู้ใช้สังกัด | ✅ | ✅ | ✅ |
| `POST /auth/refresh` | ต่ออายุ session ด้วย refresh token | ✅ | ⬜ | ⬜ |

**FE ที่ค้าง:** `refreshSession()` ใน `src/lib/thunder-core.ts` + response interceptor — เป็นงานของทีม middleware
ดู [GUIDE_MIDDLEWARE_RBAC_API.md](GUIDE_MIDDLEWARE_RBAC_API.md) หัวข้อ 1.3

---

## 2. Tenants · `src/lib/tenants.ts`

| Endpoint | ทำอะไร | BE | FE | E2E |
|---|---|:--:|:--:|:--:|
| `GET /tenants` | รายชื่อ tenant ทั้งหมด + จำนวนสมาชิก/แอป | ✅ | ✅ | ⬜ |
| `GET /tenants/usage` | ตัวเลข 4 การ์ดสถิติหัวหน้า `/tenants` | ✅ | ✅ | ⬜ |
| `POST /tenants` | สร้าง tenant ใหม่ (generate `tenant_code` ให้) | ✅ | ✅ | ⬜ |
| `GET /tenants/:id` | ข้อมูล tenant เดียว (หน้า settings ใช้) | ✅ | ✅ | ⬜ |
| `PATCH /tenants/:id` | แก้ชื่อ/สถานะ/ติดต่อ/เว็บไซต์ | ✅ | ✅ | ⬜ |
| `DELETE /tenants/:id` | ลบ tenant (cascade สมาชิก+asset) | ✅ | ✅ | ⬜ |
| `GET /tenants/:id/dashboard` | สรุปหน้า management: quota, device, สมาชิก, log | ✅ | ✅ | ⬜ |

---

## 3. Members · `src/lib/members.ts`, `member-applications.ts`

| Endpoint | ทำอะไร | BE | FE | E2E |
|---|---|:--:|:--:|:--:|
| `GET /tenants/:id/members` | รายชื่อสมาชิก + ค้นหา + แบ่งหน้า | ✅ | ⬜ | ⬜ |
| `POST /tenants/:id/members` | เพิ่มผู้ใช้ที่มีบัญชีอยู่แล้วเข้า tenant | ✅ | ⬜ | ⬜ |
| `GET /tenants/:id/members/:memberId` | รายละเอียดสมาชิก (หน้า settings) | ✅ | ⬜ | ⬜ |
| `DELETE /tenants/:id/members/:memberId` | เอาสมาชิกออกจาก tenant | ✅ | ⬜ | ⬜ |
| `PATCH /tenants/:id/members/:memberId/role` | เปลี่ยน role (แทนที่ ไม่ใช่เพิ่ม) | ✅ | ⬜ | ⬜ |
| `GET /tenants/:id/members/:memberId/applications` | แอปที่สมาชิกคนนี้เข้าถึงได้ | ✅ | ⬜ | ⬜ |
| `POST /tenants/:id/members/:memberId/applications` | ให้สิทธิ์สมาชิกเข้าแอป | ✅ | ⬜ | ⬜ |
| `DELETE /.../applications/:appId` | ถอนสิทธิ์ (soft flag ไม่ลบ row) | ✅ | ⬜ | ⬜ |
| `PATCH /users/:id` | แก้ชื่อโปรไฟล์ (มีผลข้ามทุก tenant) | ✅ | ⬜ | ⬜ |

**FE ต้องอ่านก่อนต่อ:** สัญญาไม่ตรงกับ mock เดิม 4 จุด — ไม่มี field `role` เป็น string แล้ว (คืน
`role_type`+`role_code`), `:memberId` คือ `memberships.id` ไม่ใช่ `user_id`, `POST` ต้องเป็นบัญชีที่มีอยู่แล้ว,
revoke เป็น soft flag ดูรายละเอียดใน [API_READINESS.md](API_READINESS.md)

---

## 4. Tenant Applications · `src/lib/tenant-applications.ts`

| Endpoint | ทำอะไร | BE | FE | E2E |
|---|---|:--:|:--:|:--:|
| `GET /tenants/:id/applications` | แอปของ tenant (ที่เป็นเจ้าของ + ที่ถูกแชร์มา) | ✅ | ✅ | ⬜ |
| `POST /tenants/:id/applications` | สร้างแอปใหม่ใต้ tenant | ✅ | ✅ | ⬜ |
| `PATCH /tenants/:id/applications/:appId` | แก้ชื่อ/คำอธิบาย/env/url/สถานะ | ✅ | ✅ | ⬜ |
| `DELETE /tenants/:id/applications/:appId` | ลบแอป (ต้อง cascade สิทธิ์ที่ให้ไว้) | ✅ | ✅ | ⬜ |
<!-- | `GET /tenants/:id/applications/:appId/members` | สมาชิกทั้งหมด + ใครเข้าแอปนี้ได้บ้าง | ⬜ | ⬜ | ⬜ | -->
| `POST /.../members/:memberId` | ให้สิทธิ์สมาชิกเข้าแอป | ✅ | ✅ | ⬜ |
| `DELETE /.../members/:memberId` | ถอนสิทธิ์ | ✅ | ✅ | ⬜ |
| `POST /tenants/:id/applications/:appId/launch` | ออก token อายุสั้นแล้วคืน URL เปิดแอป | ⬜ | ⬜ | ⬜ |

**หมายเหตุ:** 3 เส้นสุดท้ายซ้ำกับ members §3 (คนละมุมของตาราง `member_app_access` เดียวกัน) — ตอนทำจริง
ควรใช้ helper ตัวเดียวกัน ส่วน `launch` มี `ApplicationService.launchApplication()` เขียนไว้แล้วแต่ยังไม่มี HTTP surface

---

## 5. Platform Applications · `src/lib/applications.ts`

| Endpoint | ทำอะไร | BE | FE | E2E |
|---|---|:--:|:--:|:--:|
| `GET /applications` | แอปทั้งแพลตฟอร์ม (หน้า `/applications`) | ✅ | ✅ | ✅ |**********
| `POST /applications` | สร้างแอประดับแพลตฟอร์ม | ✅ | ✅ | ✅ |************
| `GET /applications/:id` | รายละเอียดแอป + ฟิลด์ portal | ✅ | ✅ | ✅ |
| `PATCH /applications/:id` | แก้ข้อมูลทั่วไป + portal (domain, สี, โลโก้) | ✅ | ✅ | ✅ |*********
| `DELETE /applications/:id` | ลบแอป | ✅ | ✅ | ✅ |************
| `GET /applications/:id/tenants` | tenant ที่ได้รับอนุญาตใช้แอปนี้ | ✅ | ✅ | ✅ |
| `POST /applications/:id/tenants` | เพิ่มสิทธิ์ให้ tenant | ✅ | ✅ | ✅ |
| `DELETE /applications/:id/tenants/:tenantId` | ถอนสิทธิ์ tenant | ✅ | ✅ | ✅ |
| `GET /applications/:id/members` | ผู้ใช้ทั้งหมดที่เข้าแอปนี้ได้ | ✅ | ✅ | ⬜ |
| `GET /applications/:id/api-key` | ดู API key ของแอป | ✅ | ✅ | ⬜ |
| `POST /applications/:id/api-key/regenerate` | ออก API key ใหม่ (ต้องเป็น super_admin) | ✅ | ✅ | ⬜ |

**มีอยู่แล้วใน core/v1 ทับกับหมวดนี้:** `POST /tenants/:id/apps/enable` และ `disable` ทำงานเดียวกับ
`POST/DELETE /applications/:id/tenants` แต่เป็น soft-disable (`ended_at`) ซึ่งดีกว่า — ตอนทำอย่าสร้างซ้ำ

**RBAC ที่ยังค้าง:** `regenerate api-key` และ `PUT scenario` มี `// ponytail:` กำกับใน seam ว่ายังไม่มี
super_admin gate ต้อง enforce ที่ backend

---

## 6. Assets & Devices · `src/lib/assets.ts`, `tenant-assets-v2.ts`

ก้อนใหญ่สุด แต่โดดเดี่ยว ทำท้ายสุดได้

| Endpoint | ทำอะไร | BE | FE | E2E |
|---|---|:--:|:--:|:--:|
| `GET /tenants/:id/quota` | โควตาอุปกรณ์ (ใช้ไป/ทั้งหมด) | ⬜ | ⬜ | ⬜ |
| `GET /tenants/:id/assets` | รายการ asset + filter + แบ่งหน้า | ⬜ | ⬜ | ⬜ |
| `GET /tenants/:id/assets/dashboard` | ตัวเลขสรุปหน้า assets (รวม 3 call ในเส้นเดียว) | ⬜ | ⬜ | ⬜ |
| `POST /tenants/:id/assets` | ลงทะเบียน asset + คืน credentials | ⬜ | ⬜ | ⬜ |
| `GET /tenants/:id/assets/:assetId` | รายละเอียด asset | ⬜ | ⬜ | ⬜ |
| `PATCH /tenants/:id/assets/:assetId` | แก้ข้อมูล asset | ⬜ | ⬜ | ⬜ |
| `DELETE /tenants/:id/assets/:assetId` | ลบ asset | ⬜ | ⬜ | ⬜ |
| `POST /tenants/:id/assets/:assetId/unregister` | ถอนทะเบียนแต่เก็บประวัติ | ⬜ | ⬜ | ⬜ |
| `GET /tenants/:id/assets/:assetId/credentials` | ดู credentials ของอุปกรณ์ | ⬜ | ⬜ | ⬜ |
| `PATCH /tenants/:id/assets/:assetId/folder` | ย้าย asset เข้าโฟลเดอร์ | ⬜ | ⬜ | ⬜ |
| `GET /tenants/:id/asset-folders` | โครงสร้างโฟลเดอร์ | ⬜ | ⬜ | ⬜ |
| `POST /tenants/:id/asset-folders` | สร้างโฟลเดอร์ | ⬜ | ⬜ | ⬜ |
| `PATCH /tenants/:id/asset-folders/:folderId` | เปลี่ยนชื่อ / ย้ายโฟลเดอร์ | ⬜ | ⬜ | ⬜ |
| `DELETE /tenants/:id/asset-folders/:folderId` | ลบโฟลเดอร์ | ⬜ | ⬜ | ⬜ |
| `GET /assets/:assetId/devices` | อุปกรณ์ที่ผูกกับ asset | ⬜ | ⬜ | ⬜ |
| `GET /assets/:assetId/activity-logs` | ประวัติการใช้งาน asset | ⬜ | ⬜ | ⬜ |
| `GET /tenants/:id/devices/:deviceId` | รายละเอียดอุปกรณ์ | ⬜ | ⬜ | ⬜ |
| `PATCH /tenants/:id/devices/:deviceId` | แก้ข้อมูลอุปกรณ์ | ⬜ | ⬜ | ⬜ |
| `GET /tenants/:id/assets-v2` | asset พร้อม device ซ้อนใน (หน้าใหม่) | ⬜ | ⬜ | ⬜ |

**สำคัญ:** validation ที่ mock ทำอยู่ตอนนี้ (เช็คโควตา, serial/MAC ห้ามซ้ำ, ห้ามย้ายโฟลเดอร์เข้าตัวเอง)
เป็น trust boundary ต้องย้ายไป backend ทั้งหมด ห้ามพึ่ง frontend

---

## 7. Users · `src/lib/users.ts`

| Endpoint | ทำอะไร | BE | FE | E2E |
|---|---|:--:|:--:|:--:|
| `GET /users` | ผู้ใช้ทั้งระบบ (หน้า `/users`, `/settings`) | ⬜ | ⬜ | ⬜ |
| `DELETE /users/:id` | ลบผู้ใช้ | ⬜ | ⬜ | ⬜ |

---

## ภาคผนวก — เส้นที่ backend มีแล้วแต่ frontend ยังไม่ได้ใช้

มีอยู่ใน `core/v1` เรียบร้อย ถ้าหน้าไหนต้องการค่อยหยิบไปต่อ ไม่ต้องสร้างใหม่

| Endpoint | ทำอะไร |
|---|---|
| `POST /auth/register-citizen` | สมัครเองผ่านแอปที่เปิด `allow_self_registration` |
| `POST /auth/register-line` | สมัครผ่าน LINE |
| `GET /tenants/:id/apps` | แอปที่ tenant ถูกแชร์มา (ไม่รวมที่เป็นเจ้าของเอง) |
| `POST /tenants/:id/apps/enable` | เปิดใช้แอปให้ tenant |
| `POST /tenants/:id/apps/disable` | ปิดใช้แบบ soft (`ended_at`) |
| `GET /tenants/:id/roles` | role ที่ tenant นี้ใช้ได้ (ใช้ตอนทำ dropdown เปลี่ยน role) |
| `GET /tenants/:id/invites` | คำเชิญที่ค้างอยู่ |
| `POST /invites/accept` | รับคำเชิญ |
| `GET /tenants/:id/organizations` · `GET /organizations/:orgId` | หน่วยงานย่อยใต้ tenant |
| `GET /availability/search` · `bookings/*` | ระบบจอง (คนละโดเมน) |

---

## วิธีอัปเดตไฟล์นี้

1. **BE เสร็จ** → ต้องมี regression test ใน `Thunder_Core/tests/api/` ที่ผ่านจริงก่อนติ๊ก
2. **FE เสร็จ** → `src/lib/<domain>.ts` ต้องไม่มี `throw new Error('...no REST endpoint yet')` เหลือในฟังก์ชันนั้น
3. **E2E เสร็จ** → ปิด `NEXT_PUBLIC_DEV_BYPASS` แล้วกดใช้จริงในเบราว์เซอร์ ไม่ใช่แค่ `pnpm build` ผ่าน

เทสต์ที่มีอยู่ (repo Thunder_Core, ใส่ `TC_BASE_URL` ถ้า dev server ไม่ได้อยู่ที่ :3000):

```
node --env-file=.env tests/api/auth-refresh.test.mjs      # 12 assert
node --env-file=.env tests/api/tenants-core-v1.test.mjs   # 39 assert
node --env-file=.env tests/api/members-core-v1.test.mjs   # 45 assert
```






-----------------------------------

| `GET /applications/:id/scenario` | ระดับสถานการณ์ปัจจุบัน | ⬜ | ⬜ | ⬜ |
| `PUT /applications/:id/scenario` | เปลี่ยนระดับ (normal/watch/crisis/lockdown) | ⬜ | ⬜ | ⬜ |