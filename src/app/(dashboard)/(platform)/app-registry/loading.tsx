import { AppWindow } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/table-skeleton'

export default function Loading() {
    return (
        <div className="flex-1 w-full bg-slate-50/50 min-h-screen">
            <TableSkeleton
                title="Loading Applications..."
                description="Please wait while we fetch the application data and statistics."
                icon={AppWindow}
                hasStats={true}
            />
        </div>
    )
}
