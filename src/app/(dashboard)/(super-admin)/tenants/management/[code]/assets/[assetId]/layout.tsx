import { getAsset } from "@/features/platform-tenants/management/[id]/assets/actions"
import { Server, Smartphone, Laptop, Radio, Cpu, Wifi, Monitor, ChevronLeft } from 'lucide-react'
import Link from "next/link"
import { notFound } from "next/navigation"
import { AssetLayoutNav } from "@/features/platform-tenants/management/[id]/assets/[assetId]/asset-layout-nav"

export function getDeviceIcon(type: string) {
    switch (type?.toLowerCase()) {
        case 'server': case 'gateway': return Server
        case 'smartphone': return Smartphone
        case 'laptop': case 'hmi': return Laptop
        case 'sensor': return Radio
        case 'controller': case 'plc': return Cpu
        case 'router': case 'switch': return Wifi
        default: return Monitor
    }
}

export default async function AssetDetailLayout(props: {
    children: React.ReactNode,
    params: Promise<{ code: string, assetId: string }>
}) {
    const { code: tenantId, assetId } = await props.params

    const asset = await getAsset(tenantId, assetId)

    if (!asset) {
        return notFound()
    }

    const Icon = getDeviceIcon(asset.device_type || asset.type)
    const isOnline = asset.connection_status === 'online'
    const statusColor = isOnline ? 'bg-emerald-500' : 'bg-red-500'
    const statusText = isOnline ? 'text-emerald-500' : 'text-red-500'

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] mx-auto -mt-4 -mb-4 px-4 py-8 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 mt-2 ml-2">
                <Link
                    href={`/dashboard/tenants/management/${tenantId}/assets`}
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-indigo-600" />
                </Link>
                <h1 className="text-xl font-bold text-slate-800">Devices</h1>
            </div>

            <div className="flex gap-6 max-w-7xl">
                {/* Left Sidebar */}
                <div className="w-[300px] flex flex-col gap-4 sticky top-8 h-fit">
                    {/* Device Status Card */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-4">
                            {/* eslint-disable-next-line react-hooks/static-components */}
                            <Icon className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
                        </div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusText}`}>
                                {asset.connection_status === 'online' ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 text-center w-full truncate">
                            {asset.device_name || asset.name}
                        </h2>
                    </div>

                    {/* Navigation Menu */}
                    <AssetLayoutNav tenantId={tenantId} assetId={assetId} />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 max-w-[800px] min-w-[500px] bg-white rounded-xl border border-slate-100 shadow-sm p-8 min-h-[600px]">
                    {props.children}
                </div>
            </div>
        </div >
    )
}
