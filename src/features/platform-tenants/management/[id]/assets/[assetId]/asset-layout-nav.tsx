'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft } from 'lucide-react'

export function AssetLayoutNav({ tenantId, assetId }: { tenantId: string, assetId: string }) {
    const pathname = usePathname()
    const isSettings = pathname.endsWith('/settings')

    return (
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
            <Link
                href={`/dashboard/tenants/management/${tenantId}/assets/${assetId}`}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-between transition-colors ${!isSettings ? 'bg-indigo-50/50 text-indigo-600 border border-indigo-100/50' : 'text-slate-600 hover:bg-slate-50'
                    }`}
            >
                General
                {!isSettings && <ChevronLeft className="w-4 h-4 rotate-180" />}
            </Link>
            <Link
                href={`/dashboard/tenants/management/${tenantId}/assets/${assetId}/settings`}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-between transition-colors ${isSettings ? 'bg-indigo-50/50 text-indigo-600 border border-indigo-100/50' : 'text-slate-600 hover:bg-slate-50'
                    }`}
            >
                Setting
                {isSettings && <ChevronLeft className="w-4 h-4 rotate-180" />}
            </Link>
        </div>
    )
}
