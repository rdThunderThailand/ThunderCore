import { requireRole } from '@/lib/rbac'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    await requireRole('super_admin')
    return <>{children}</>
}
