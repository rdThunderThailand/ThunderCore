'use client'

import { useAssetStore } from '@/store/useAssetStore'
import { MoreHorizontal, Key, Folder, ChevronRight, Monitor, Trash2, Info, Plus, Server, Smartphone, Laptop, Radio, Cpu, Wifi } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Asset } from '@/types/assets'
import { statusConfig } from './assets-action-bar'
import { deleteAsset, moveAssetToFolder } from '../actions'

// ── Device Icon ──────────────────────────────────────────────────────────────
function getDeviceIcon(type: string) {
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

// ── Health Score calculation (simulated from connection_status) ───────────────
function getHealthScore(asset: Asset, now: number): number {
    if (asset.registry_status !== 'active') return 0
    const lastHeartbeat = asset.last_heartbeat_at ? new Date(asset.last_heartbeat_at).getTime() : null
    const isStale = !lastHeartbeat || (now - lastHeartbeat) > 5 * 60 * 1000
    if (isStale) return 0
    if (asset.connection_status === 'online') return 90
    if (asset.connection_status === 'busy') return 60
    return 0
}

// ── Health bar color ─────────────────────────────────────────────────────────
function getBarColor(score: number): string {
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-amber-400'
    return 'bg-red-400'
}

// ── Tag color pill (parse "Name:::colorHex" format) ──────────────────────────
function TagPill({ tag }: { tag: string }) {
    const parts = tag.split(':::')
    const name = parts[0]
    const colorHex = parts[1]

    const fallbackColors: Record<string, { bg: string; text: string }> = {
        rose:   { bg: '#fff1f2', text: '#e11d48' },
        blue:   { bg: '#eff6ff', text: '#2563eb' },
        green:  { bg: '#f0fdf4', text: '#16a34a' },
        amber:  { bg: '#fffbeb', text: '#d97706' },
        purple: { bg: '#faf5ff', text: '#9333ea' },
        slate:  { bg: '#f1f5f9', text: '#475569' },
    }

    let bg = '#f1f5f9'
    let text = '#475569'

    if (colorHex && fallbackColors[colorHex]) {
        bg = fallbackColors[colorHex].bg
        text = fallbackColors[colorHex].text
    } else if (colorHex && colorHex.startsWith('#')) {
        bg = colorHex + '22'
        text = colorHex
    }

    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: bg, color: text }}
        >
            {name}
        </span>
    )
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface AssetListRowProps {
    asset: Asset
    tenantId: string
    setShowCredentials: (asset: Asset) => void
    setShowActivation: (asset: Asset) => void
}

// ── Component ────────────────────────────────────────────────────────────────
export function AssetListRow({
    asset,
    tenantId,
    setShowCredentials,
    setShowActivation,
}: AssetListRowProps) {
    const {
        activeTab,
        folders,
        contextMenu, setContextMenu,
        fetchData,
    } = useAssetStore()
    const router = useRouter()

    const deviceIcon = getDeviceIcon(asset.device_type || asset.type)

    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        if (asset.registry_status !== 'active') return
        const interval = setInterval(() => setNow(Date.now()), 5000)
        return () => clearInterval(interval)
    }, [asset.registry_status])

    // Status
    let status = statusConfig[asset.registry_status] || statusConfig.pending
    if (asset.registry_status === 'active') {
        const lastHeartbeat = asset.last_heartbeat_at ? new Date(asset.last_heartbeat_at).getTime() : null
        const isStale = !lastHeartbeat || (now - lastHeartbeat) > 5 * 60 * 1000
        const connStatus = isStale ? 'offline' : (asset.connection_status || 'online')
        if (connStatus === 'online') {
            status = { label: 'Healthy', color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50' }
        } else if (connStatus === 'busy') {
            status = { label: 'Busy', color: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50' }
        } else {
            status = { label: 'Offline', color: 'text-red-500', dot: 'bg-red-500', bg: 'bg-red-50' }
        }
    }

    const healthScore = getHealthScore(asset, now)
    const barColor = getBarColor(healthScore)
    const isMenuOpen = contextMenu?.type === 'asset' && contextMenu.folderId === asset.id
    const deviceName = asset.device_name || asset.name || 'Unnamed Device'
    const category = asset.type || asset.device_type || 'Device'
    const serial = asset.serial_number || asset.id.slice(0, 8).toUpperCase()
    const tags: string[] = asset.tags ?? []

    return (
        <div
            onClick={() => {
                if (activeTab === 'player') {
                    router.push(`/dashboard/tenants/management/${tenantId}/assets/${asset.id}`)
                }
            }}
            className={`group flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all cursor-pointer ${isMenuOpen ? 'z-50 relative' : ''}`}
        >
            {/* ── Device Icon Block ── */}
            <div className="shrink-0 w-16 h-14 bg-blue-600 rounded-xl flex flex-col gap-1 items-center justify-center shadow-sm shadow-blue-200">
                {React.createElement(deviceIcon, { className: 'w-5 h-5 text-white' })}
                <div className="w-7 h-1 bg-white/30 rounded-full" />
                <div className="w-4 h-1 bg-white/30 rounded-full" />
            </div>

            {/* ── Asset Info ── */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-bold text-slate-800 truncate">{deviceName}</span>
                    <Info className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium mb-1">{category}</p>
                <p className="text-[10px] font-mono text-slate-400 mb-1.5">{serial}</p>

                {/* Tags row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {tags.slice(0, 3).map(tag => (
                        <TagPill key={tag} tag={tag} />
                    ))}
                    {activeTab === 'player' && (
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-400 border border-dashed border-slate-300 hover:border-blue-400 hover:text-blue-400 transition-colors"
                        >
                            <Plus className="w-2.5 h-2.5" /> New Tag
                        </button>
                    )}
                </div>
            </div>

            {/* ── Status ── */}
            <div className="flex items-center gap-1.5 shrink-0 w-28">
                <div className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                <span className={`text-xs font-black uppercase tracking-wide ${status.color}`}>
                    {status.label}
                </span>
            </div>

            {/* ── Health Bar ── */}
            <div className="flex items-center gap-3 shrink-0 w-48">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${healthScore}%` }}
                    />
                </div>
                <span className="text-xs font-bold text-slate-500 w-8 text-right tabular-nums">
                    {healthScore > 0 ? `${healthScore}%` : '—'}
                </span>
            </div>

            {/* ── 3-dot Menu ── */}
            <div className="relative shrink-0 ml-1" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => {
                        if (isMenuOpen) {
                            setContextMenu(null)
                        } else {
                            setContextMenu({ type: 'asset', x: 0, y: 0, folderId: asset.id })
                        }
                    }}
                    className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <button
                            onClick={() => { setShowCredentials(asset); setContextMenu(null) }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                        >
                            <Key className="w-3.5 h-3.5" /> View Credentials
                        </button>

                        {/* Move to Folder */}
                        <div className="relative group/move">
                            <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Folder className="w-3.5 h-3.5" /> Move
                                </div>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute left-[95%] top-0 hidden group-hover/move:block w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1 z-50">
                                <button
                                    onClick={async () => {
                                        await moveAssetToFolder(tenantId, asset.id, null)
                                        fetchData(tenantId)
                                        setContextMenu(null)
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                                >
                                    <Monitor className="w-3.5 h-3.5" /> All Devices (Root)
                                </button>
                                {folders.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={async () => {
                                            await moveAssetToFolder(tenantId, asset.id, f.id)
                                            fetchData(tenantId)
                                            setContextMenu(null)
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 truncate"
                                    >
                                        <Folder className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{f.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeTab === 'unregister' && (
                            <button
                                onClick={() => { setShowActivation(asset); setContextMenu(null) }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                            >
                                <Monitor className="w-3.5 h-3.5" /> Register
                            </button>
                        )}

                        <button
                            onClick={async () => {
                                if (confirm('Delete this asset?')) {
                                    await deleteAsset(tenantId, asset.id)
                                    fetchData(tenantId)
                                }
                                setContextMenu(null)
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
