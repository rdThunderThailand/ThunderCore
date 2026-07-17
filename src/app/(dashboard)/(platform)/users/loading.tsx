import { Users } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/table-skeleton'

export default function Loading() {
    return (
        <div className="flex-1 w-full bg-slate-50/50 min-h-screen">
            <TableSkeleton
                title="Users"
                description="Manage team members, roles, and access permissions across the system."
                icon={Users}
                hasStats={false}
            />
        </div>
    )
}
