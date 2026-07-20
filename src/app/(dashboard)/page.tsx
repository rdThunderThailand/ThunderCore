import { redirect } from "next/navigation"


export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    redirect('/tenants/management/e316bbcf-2eb6-48ae-b5d9-74d631dec359')
}