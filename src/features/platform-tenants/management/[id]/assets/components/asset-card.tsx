'use client'

import { useAssetStore } from '@/store/useAssetStore'
import {
    Plus, MapPin, ChevronDown, Monitor, Server,
    Smartphone, Laptop, Radio, Cpu, Wifi, Smile
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Asset } from '@/types/assets'
import { statusConfig } from './assets-action-bar'
import { updateAsset } from '../actions'
import { toast } from 'sonner'

// ── Device Icon ───────────────────────────────────────────────────────────────
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

// ── Health score ──────────────────────────────────────────────────────────────
function getHealthScore(asset: Asset, now: number): number {
    if (asset.registry_status !== 'active') return 0
    const lastHeartbeat = asset.last_heartbeat_at ? new Date(asset.last_heartbeat_at).getTime() : null
    if (!lastHeartbeat || (now - lastHeartbeat) > 5 * 60 * 1000) return 0
    if (asset.connection_status === 'online') return 93
    if (asset.connection_status === 'busy') return 60
    return 0
}

// ── Preview gradients ─────────────────────────────────────────────────────────
const PREVIEW_GRADIENTS = [
    { from: '#f97316', via: '#fbbf24', blur1: 'bg-orange-300', blur2: 'bg-amber-200' },
    { from: '#38bdf8', via: '#818cf8', blur1: 'bg-sky-300', blur2: 'bg-violet-200' },
    { from: '#34d399', via: '#059669', blur1: 'bg-emerald-300', blur2: 'bg-teal-200' },
    { from: '#fb7185', via: '#f43f5e', blur1: 'bg-rose-300', blur2: 'bg-fuchsia-200' },
    { from: '#facc15', via: '#f97316', blur1: 'bg-yellow-300', blur2: 'bg-orange-200' },
]

// ── Props ─────────────────────────────────────────────────────────────────────
interface AssetCardProps {
    asset: Asset
    tenantId: string
    index?: number
    setShowCredentials: (asset: Asset) => void
    setShowActivation: (asset: Asset) => void
    onSelect?: (asset: Asset) => void
    /** Route prefix for the asset detail link, e.g. `/tenants/management/${tenantId}`. Defaults to the super-admin path. */
    basePath?: string
}

// ── Component ────────────────────────────────────────────────────────────────
export function AssetCard({
    asset,
    tenantId,
    index = 0,
    setShowCredentials,
    setShowActivation,
    onSelect,
    basePath,
}: AssetCardProps) {
    const { activeTab, fetchData } = useAssetStore()
    const router = useRouter()
    const Icon = getDeviceIcon(asset.device_type || asset.type)

    const [now, setNow] = useState(Date.now())
    const [isAddingTag, setIsAddingTag] = useState(false)
    const [newTagValue, setNewTagValue] = useState('')
    const [isExpanded, setIsExpanded] = useState(true)

    useEffect(() => {
        if (asset.registry_status !== 'active') return
        const interval = setInterval(() => setNow(Date.now()), 5000)
        return () => clearInterval(interval)
    }, [asset.registry_status])

    const handleAddTag = async () => {
        if (!newTagValue.trim()) { setIsAddingTag(false); return }
        const newTags = [...(asset.tags || []), newTagValue.trim()]
        try {
            await updateAsset(tenantId, asset.id, { tags: newTags })
            toast.success('Tag added')
            fetchData(tenantId, true)
        } catch {
            toast.error('Failed to add tag')
        } finally {
            setIsAddingTag(false)
            setNewTagValue('')
        }
    }

    // — Status —
    let status = statusConfig[asset.registry_status] || statusConfig.pending
    if (asset.registry_status === 'active') {
        const lastHeartbeat = asset.last_heartbeat_at ? new Date(asset.last_heartbeat_at).getTime() : null
        const isStale = !lastHeartbeat || (now - lastHeartbeat) > 5 * 60 * 1000
        const cs = isStale ? 'offline' : (asset.connection_status || 'online')
        if (cs === 'online') status = { label: 'Active', color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50' }
        else if (cs === 'busy') status = { label: 'Busy', color: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50' }
        else status = { label: 'Offline', color: 'text-red-500', dot: 'bg-red-500', bg: 'bg-red-50' }
    }

    const healthScore = getHealthScore(asset, now)
    const isHealthy = healthScore > 0
    const deviceName = asset.device_name || asset.name || 'Unnamed Device'
    const location = asset.site || asset.zone || null
    const serial = asset.serial_number || asset.id.slice(0, 8).toUpperCase()
    const tags: string[] = asset.tags ?? []
    const grad = PREVIEW_GRADIENTS[index % PREVIEW_GRADIENTS.length]

    return (
        <div
            onClick={() => {
                if (onSelect) onSelect(asset)
                else if (activeTab === 'player') router.push(`${basePath ?? `/dashboard/tenants/management/${tenantId}`}/assets/${asset.id}`)
            }}
            className={`group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden select-none w-[260px] h-fit shrink-0 ${activeTab === 'player' ? 'cursor-pointer' : ''}`}
        >
            {/* ── TOP INFO + HEALTH BLOCK ── */}
            <div className="flex items-start justify-between px-4 pt-4 pb-2">
                {/* Left: status, name, location */}
                <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                    <h3 className="text-[13px] font-bold text-slate-900 leading-tight truncate mb-0.5" title={deviceName}>
                        {deviceName}
                    </h3>
                    <div className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] font-semibold text-slate-400 truncate tracking-tight">
                            {location ?? serial}
                        </span>
                    </div>
                </div>

                {/* Right: Device illustration + green health badge */}
                <div className="relative shrink-0 w-[90px] h-[68px]">
                    {/* Green gradient health badge */}
                    <div className="absolute top-0 right-0 w-full h-full rounded-xl overflow-hidden bg-linear-to-br from-emerald-400 to-green-500 flex flex-col items-end justify-start p-1.5 shadow-md shadow-emerald-200">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-white leading-none">{isHealthy ? `${healthScore}%` : "100%"}</span>
                            <Smile className="w-4 h-4 text-white/90" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/85 mt-0.5">HEALTHY</span>
                    </div>

                    {/* Device illustration overlaid on the left */}
                    <div className="absolute -left-4 bottom-0 top-0 flex items-end justify-center pointer-events-none">
                        <div className="w-[40px] h-[60px] bg-slate-900 rounded-lg shadow-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-b from-slate-700 to-slate-950" />
                            {/* Screen area */}
                            <div className="absolute top-1.5 left-1.5 right-1.5 bottom-5 bg-white/10 rounded-sm flex items-center justify-center">
                                <div className="w-3 h-2 bg-white/30 rounded-sm" />
                            </div>
                            {/* Stand */}
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
                                <div className="w-0.5 h-1.5 bg-slate-600 rounded-full" />
                                <div className="w-4 h-0.5 bg-slate-600 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* ── PREVIEW IMAGE SECTION (collapsible) ── */}
            < div
                className="overflow-hidden transition-all duration-300 ease-in-out px-3"
                style={{
                    maxHeight: isExpanded ? '150px' : '0px',
                    opacity: isExpanded ? 1 : 0,
                    marginBottom: isExpanded ? '8px' : '0px'
                }
                }
            >
                <div
                    className="w-full h-[110px] rounded-xl overflow-hidden relative flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${grad.from}22 0%, ${grad.via}22 100%)`
                    }}
                >
                    <div className={`absolute -bottom-4 -left-4 w-28 h-28 ${grad.blur1} opacity-30 blur-2xl rounded-full`} />
                    <div className={`absolute top-2 right-2 w-20 h-20 ${grad.blur2} opacity-30 blur-2xl rounded-full`} />
                    <Icon
                        className="relative z-10 w-12 h-12 opacity-30 transition-transform group-hover:scale-110 duration-500"
                        style={{ color: grad.from }}
                    />
                </div>
            </div >

            {/* ── FOOTER: TAGS ── */}
            < div
                className="flex items-center gap-2 px-4 pb-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {/* Existing tags */}
                    {tags.slice(0, 1).map(tag => (
                        <span
                            key={tag}
                            className="px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[11px] font-semibold text-blue-600 shrink-0"
                        >
                            {tag.split(':::')[0]}
                        </span>
                    ))}

                    {/* Add tag */}
                    {isAddingTag ? (
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 shrink-0">
                            <input
                                autoFocus
                                type="text"
                                value={newTagValue}
                                onChange={(e) => setNewTagValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddTag()
                                    if (e.key === 'Escape') setIsAddingTag(false)
                                }}
                                onBlur={handleAddTag}
                                className="bg-transparent text-[11px] font-semibold text-slate-700 outline-none w-16"
                                placeholder="Tag name"
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingTag(true)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 border border-dashed border-slate-200 hover:border-blue-400 hover:text-blue-500 transition-all shrink-0"
                        >
                            <Plus className="w-3 h-3" /> New Tag
                        </button>
                    )}
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}
                    className="p-1 text-slate-300 hover:text-blue-500 transition-colors shrink-0"
                >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`} />
                </button>
            </div >
        </div >
    )
}
