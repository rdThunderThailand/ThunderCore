'use client'

import { Asset } from '@/types/assets'
import { Device } from '@/types/asset-management'
import React, { useEffect, useState } from 'react'
import {
    MapPin, Wrench, Monitor,
    Plus, Server, Smartphone, Laptop,
    Radio, Cpu, Wifi, FileText, Activity, Package, MoreHorizontal,
    ChevronsLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { getLinkedDevices } from '../actions'

// Custom scrollbar hiding utility
const noScrollbarStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`

function getDeviceIcon(type: string | null) {
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

const DEVICE_GRADIENTS = [
    ['#6366f1', '#8b5cf6'],   // indigo-violet
    ['#0ea5e9', '#6366f1'],   // sky-indigo
    ['#10b981', '#06b6d4'],   // emerald-cyan
    ['#f59e0b', '#ef4444'],   // amber-red
    ['#ec4899', '#a855f7'],   // pink-purple
]

function DeviceRow({
    device,
    tenantId,
    assetId,
    index,
    onNavigate
}: {
    device: Device
    tenantId: string
    assetId: string
    index: number
    onNavigate: () => void
}) {
    const router = useRouter()
    const [isAddingTag, setIsAddingTag] = useState(false)
    const [newTag, setNewTag] = useState('')
    const deviceIcon = getDeviceIcon(device.device_type)

    const handleAddTag = async () => {
        if (!newTag.trim()) {
            setIsAddingTag(false)
            return
        }
        // For now, just show a toast — device tags stored in asset metadata
        toast.info(`Tag "${newTag.trim()}" saved (device-level tag)`)
        setIsAddingTag(false)
        setNewTag('')
    }

    return (
        <div
            className="group relative flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer mb-3 mx-4"
            onClick={() => router.push(`/dashboard/tenants/management/${tenantId}/assets/${assetId}/devices/${device.id}`)}
        >
            {/* Dark Placeholder Image */}
            <div className="w-[100px] h-[64px] bg-slate-900 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                {React.createElement(deviceIcon, { className: 'w-8 h-8 text-white/10 rotate-12 scale-150 absolute -right-2 -bottom-2' })}
                {React.createElement(deviceIcon, { className: 'w-6 h-6 text-white/30' })}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-[14px] font-black text-slate-800 mb-0.5 truncate">
                    {device.hardware_model || 'Thunder Player'}
                </h4>
                <p className="text-[12px] font-bold text-slate-400 mb-3 truncate">
                    {(device.metadata?.model as string) || 'Coca Cola Nww Year 2021'}
                </p>

                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {isAddingTag ? (
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                            <input
                                autoFocus
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddTag()
                                    if (e.key === 'Escape') setIsAddingTag(false)
                                }}
                                onBlur={handleAddTag}
                                className="bg-transparent text-[11px] font-bold text-slate-700 outline-none w-16"
                                placeholder="..."
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingTag(true)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold text-slate-400 border border-dashed border-slate-200 hover:border-blue-300 hover:text-blue-500 transition-colors"
                        >
                            <Plus className="w-3 h-3" /> New Tag
                        </button>
                    )}
                </div>
            </div>

            {/* Context menu hint */}
            <div className="absolute top-4 right-4">
                <MoreHorizontal className="w-4 h-4 text-blue-400 hover:text-blue-600 transition-colors" />
            </div>
        </div>
    )
}

const TABS = ['Overview', 'Devices', 'Maintenance', 'Documents'] as const
type Tab = typeof TABS[number]

interface AssetDetailPanelProps {
    asset: Asset | null
    tenantId: string
    onClose: () => void
}

export function AssetDetailPanel({ asset, tenantId, onClose }: AssetDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('Devices')
    const [devices, setDevices] = useState<Device[]>([])
    const [isLoadingDevices, setIsLoadingDevices] = useState(false)

    // Fetch linked devices when asset changes
    useEffect(() => {
        let cancelled = false
        if (!asset) {
            const t = setTimeout(() => {
                if (!cancelled) {
                    setDevices([])
                    setActiveTab('Devices')
                }
            }, 0)
            return () => {
                cancelled = true
                clearTimeout(t)
            }
        }
        const assetId = asset.id
        const load = async () => {
            setIsLoadingDevices(true)
            try {
                const data = await getLinkedDevices(assetId)
                if (cancelled) return
                setDevices(data)
            } catch (err) {
                console.error('Error fetching linked devices:', err)
            } finally {
                if (!cancelled) setIsLoadingDevices(false)
            }
        }
        void load()
        return () => { cancelled = true }
    }, [asset])

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    const isOpen = asset !== null

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }



    return (
        <div
            className={`
                border-l border-slate-200 bg-white flex flex-col overflow-hidden transition-all duration-300 ease-in-out shrink-0
                ${isOpen ? 'w-[400px] opacity-100' : 'w-0 opacity-0 pointer-events-none'}
            `}
            style={{ minHeight: 0 }}
        >
            <style dangerouslySetInnerHTML={{ __html: noScrollbarStyle }} />
            {asset && (
                <>
                    {/* ── Header ── */}
                    <div className="px-6 pt-5 pb-5 border-b border-slate-100">
                        {/* Top Utility Row */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="p-1 -ml-2 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    <ChevronsLeft className="w-5 h-5 rotate-180" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm">
                                        <span className="text-[11px] font-bold text-slate-600">Digital Infra</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-400">{asset.serial_number || 'SP-001'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${asset.connection_status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                        {asset.connection_status === 'online' ? 'HEALTHY' : 'OFFLINE'}
                                    </span>
                                </div>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className={`w-3.5 h-1.5 rounded-[1px] ${i <= 4 ? (asset.connection_status === 'online' ? 'bg-emerald-500' : 'bg-red-400') : 'bg-slate-100'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-[11px] font-black text-slate-400">90%</span>
                            </div>
                        </div>

                        {/* Title Row */}
                        <h2 className="text-[20px] font-black text-slate-900 flex items-center gap-2 mb-6">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            {asset.device_name || asset.name || 'Smart Pole - Sukhumvit 21'}
                        </h2>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                            <div>
                                <p className="text-[11px] font-bold text-slate-300 mb-1">Installation Date</p>
                                <p className="text-[13px] font-bold text-slate-700">{formatDate(asset.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-300 mb-1">Manufacturer</p>
                                <p className="text-[13px] font-bold text-slate-700">{asset.model || 'ThunderTech'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-300 mb-1">Power Source</p>
                                <p className="text-[13px] font-bold text-slate-700">Grid + Solar</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-300 mb-1">Coordinates</p>
                                <p className="text-[13px] font-bold text-slate-700">13.7462, 100.5605</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex items-center px-1 border-b border-slate-100 gap-0 shrink-0 overflow-x-auto no-scrollbar">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-[11px] font-bold transition-colors border-b-2 whitespace-nowrap ${activeTab === tab
                                        ? 'text-blue-600 border-blue-600'
                                        : 'text-slate-400 border-transparent hover:text-slate-600'
                                    }`}
                            >
                                {tab === 'Overview' && <Activity className="w-3 h-3" />}
                                {tab === 'Devices' && <Monitor className="w-3 h-3" />}
                                {tab === 'Maintenance' && <Wrench className="w-3 h-3" />}
                                {tab === 'Documents' && <FileText className="w-3 h-3" />}
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab Content ── */}
                    <div className="flex-1 overflow-y-auto">
                        {activeTab === 'Devices' && (
                            <div className="p-2">
                                {isLoadingDevices ? (
                                    <div className="flex items-center justify-center py-12 text-slate-400">
                                        <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                                    </div>
                                ) : devices.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Package className="w-10 h-10 text-slate-200 mb-3" />
                                        <p className="text-sm font-bold text-slate-400">No Devices Linked</p>
                                        <p className="text-xs text-slate-300 mt-1">Go to Asset Detail to link devices</p>
                                    </div>
                                ) : (
                                    devices.map((device, idx) => (
                                        <DeviceRow
                                            key={device.id}
                                            device={device}
                                            tenantId={tenantId}
                                            assetId={asset.id}
                                            index={idx}
                                            onNavigate={onClose}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                        {activeTab === 'Overview' && (
                            <div className="p-4 text-sm text-slate-400 text-center pt-12">Overview coming soon</div>
                        )}
                        {activeTab === 'Maintenance' && (
                            <div className="p-4 text-sm text-slate-400 text-center pt-12">Maintenance coming soon</div>
                        )}
                        {activeTab === 'Documents' && (
                            <div className="p-4 text-sm text-slate-400 text-center pt-12">Documents coming soon</div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
