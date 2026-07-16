## What this is

Thunder Core is the **multi-tenant control plane** for the Thunder platform: it owns tenants,
users, memberships, roles, and the registry of applications that plug into it. Asset/fuel/SAI
modules are tenant-facing features built on top of that core. Every app-layer product
(e.g. cityzen) authenticates and authorizes against Thunder Core rather than running its own
identity stack.

Stack: **Next.js 16 App Router · Supabase (Postgres + Auth + RLS) · Tailwind CSS 4 · TypeScript strict**.

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
