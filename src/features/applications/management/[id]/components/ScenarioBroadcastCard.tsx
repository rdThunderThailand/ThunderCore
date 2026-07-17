'use client'

import { ScenarioLevel, ScenarioMetadata } from '@/models/Application'
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Loader2,
    Radio,
    ShieldAlert,
    ShieldOff,
    Siren,
    X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getApplicationScenario, updateApplicationScenario } from '../actions'

// ─── Scenario Config ──────────────────────────────────────────────────────────

interface ScenarioConfig {
    level: ScenarioLevel
    label: string
    labelTh: string
    description: string
    icon: React.ElementType
    color: string
    bg: string
    border: string
    glow: string
    pulse: boolean
}

const SCENARIOS: ScenarioConfig[] = [
    {
        level: 'normal',
        label: 'Normal',
        labelTh: 'ปกติ',
        description: 'ไม่มีเหตุการณ์พิเศษ ระบบทำงานตามปกติ',
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-400',
        glow: 'shadow-emerald-200',
        pulse: false,
    },
    {
        level: 'watch',
        label: 'Watch',
        labelTh: 'เฝ้าระวัง',
        description: 'สถานการณ์น่าติดตาม ควรเตรียมความพร้อม',
        icon: AlertTriangle,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-400',
        glow: 'shadow-amber-200',
        pulse: false,
    },
    {
        level: 'crisis',
        label: 'Crisis',
        labelTh: 'วิกฤต',
        description: 'สถานการณ์วิกฤต ต้องการการตอบสนองทันที',
        icon: Siren,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-500',
        glow: 'shadow-red-200',
        pulse: true,
    },
    {
        level: 'lockdown',
        label: 'Lockdown',
        labelTh: 'ล็อกดาวน์',
        description: 'สถานการณ์ฉุกเฉินสูงสุด มีการจำกัดพื้นที่',
        icon: ShieldOff,
        color: 'text-slate-100',
        bg: 'bg-slate-900',
        border: 'border-slate-700',
        glow: 'shadow-slate-800',
        pulse: true,
    },
]

// ─── Utility ──────────────────────────────────────────────────────────────────

function getScenarioConfig(level: ScenarioLevel): ScenarioConfig {
    return SCENARIOS.find(s => s.level === level) ?? SCENARIOS[0]
}

function formatRelativeTime(isoString: string | null): string {
    if (!isoString) return 'ยังไม่เคยตั้งค่า'
    const diff = Date.now() - new Date(isoString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'เมื่อกี้'
    if (mins < 60) return `${mins} นาทีที่แล้ว`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`
    return `${Math.floor(hrs / 24)} วันที่แล้ว`
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
    from: ScenarioConfig
    to: ScenarioConfig
    message: string
    onMessageChange: (v: string) => void
    onConfirm: () => void
    onCancel: () => void
    isLoading: boolean
}

function ConfirmModal({ from, to, message, onMessageChange, onConfirm, onCancel, isLoading }: ConfirmModalProps) {
    const ToIcon = to.icon
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">ยืนยันการเปลี่ยนแปลง</p>
                        <h3 className="text-lg font-bold text-slate-900">เปลี่ยนระดับสถานการณ์</h3>
                    </div>
                    <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                {/* Before → After */}
                <div className="flex items-center gap-3 mb-5">
                    <div className={`flex-1 rounded-xl p-3 border-2 ${from.border} ${from.bg} text-center`}>
                        <p className="text-xs text-slate-500 mb-1">จาก</p>
                        <p className={`font-bold text-sm ${from.color}`}>{from.labelTh}</p>
                    </div>
                    <div className="text-slate-400 font-bold">→</div>
                    <div className={`flex-1 rounded-xl p-3 border-2 ${to.border} ${to.bg} text-center`}>
                        <p className="text-xs text-slate-500 mb-1">เป็น</p>
                        <p className={`font-bold text-sm ${to.color}`}>{to.labelTh}</p>
                    </div>
                </div>

                {/* Warning for high severity */}
                {(to.level === 'crisis' || to.level === 'lockdown') && (
                    <div className={`flex gap-2 items-start rounded-xl p-3 mb-4 ${to.level === 'lockdown' ? 'bg-slate-900 text-slate-200' : 'bg-red-50 text-red-700'}`}>
                        <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                        <p className="text-xs leading-relaxed">
                            การตั้งค่านี้จะส่งสัญญาณ <strong>{to.labelTh.toUpperCase()}</strong> ไปยัง CityZen ทันที
                            ผู้ใช้งานจะเห็น UI เปลี่ยนแปลงในทุกอุปกรณ์
                        </p>
                    </div>
                )}

                {/* Message input */}
                <div className="mb-5">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        ข้อความแจ้งเตือน <span className="text-slate-400 font-normal">(ไม่บังคับ)</span>
                    </label>
                    <textarea
                        value={message}
                        onChange={e => onMessageChange(e.target.value)}
                        placeholder="เช่น: น้ำมันขาดแคลนในเขต กทม. กรุณาตรวจสอบสาขาใกล้บ้าน"
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all
                            ${to.level === 'lockdown' ? 'bg-slate-900 hover:bg-slate-800' :
                              to.level === 'crisis' ? 'bg-red-600 hover:bg-red-700' :
                              to.level === 'watch' ? 'bg-amber-500 hover:bg-amber-600' :
                              'bg-emerald-600 hover:bg-emerald-700'}`}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ToIcon className="w-4 h-4" />}
                        ยืนยัน
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface ScenarioBroadcastCardProps {
    appId: string
    appName?: string
}

export function ScenarioBroadcastCard({ appId, appName }: ScenarioBroadcastCardProps) {
    const [currentLevel, setCurrentLevel] = useState<ScenarioLevel>('normal')
    const [metadata, setMetadata] = useState<ScenarioMetadata>({})
    const [updatedAt, setUpdatedAt] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [pendingLevel, setPendingLevel] = useState<ScenarioLevel | null>(null)
    const [confirmMessage, setConfirmMessage] = useState('')
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const relativeTimeRef = useRef<HTMLSpanElement>(null)

    const showToast = useCallback((type: 'success' | 'error', text: string) => {
        setToast({ type, text })
        setTimeout(() => setToast(null), 4000)
    }, [])

    // ── Load initial state ──
    useEffect(() => {
        async function load() {
            try {
                const data = await getApplicationScenario(appId)
                setCurrentLevel(data.scenario_level)
                setMetadata(data.scenario_metadata)
                setUpdatedAt(data.scenario_updated_at)
            } catch {
                showToast('error', 'ไม่สามารถโหลด scenario ได้')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [appId, showToast])

    // ── Auto-refresh relative time label ──
    useEffect(() => {
        const interval = setInterval(() => {
            if (relativeTimeRef.current) {
                relativeTimeRef.current.textContent = formatRelativeTime(updatedAt)
            }
        }, 60000)
        return () => clearInterval(interval)
    }, [updatedAt])


    const handleLevelClick = (level: ScenarioLevel) => {
        if (level === currentLevel || isSaving) return
        setPendingLevel(level)
        setConfirmMessage('')
    }

    const handleConfirm = async () => {
        if (!pendingLevel) return
        setIsSaving(true)
        try {
            const updateMetadata: ScenarioMetadata = {
                ...metadata,
                message: confirmMessage || undefined,
            }
            const result = await updateApplicationScenario(appId, pendingLevel, updateMetadata)
            setCurrentLevel(result.scenario_level)
            setMetadata(updateMetadata)
            setUpdatedAt(result.scenario_updated_at)
            showToast('success', `เปลี่ยนเป็น "${getScenarioConfig(pendingLevel).labelTh}" เรียบร้อย`)
        } catch (err) {
            showToast('error', (err as Error).message)
        } finally {
            setIsSaving(false)
            setPendingLevel(null)
            setConfirmMessage('')
        }
    }

    const current = getScenarioConfig(currentLevel)
    const CurrentIcon = current.icon

    return (
        <>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-violet-50 p-2.5 rounded-xl">
                            <Radio className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 text-sm">Scenario Broadcast</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                ส่งระดับสถานการณ์ไปยัง{appName ? ` ${appName}` : ' child app'}
                            </p>
                        </div>
                    </div>
                    {/* Live indicator */}
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Realtime
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Current State Banner */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-20 rounded-xl bg-slate-50">
                            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                        </div>
                    ) : (
                        <div className={`rounded-xl border-2 ${current.border} ${current.bg} p-4 flex items-center gap-4 transition-all duration-300 ${current.glow ? `shadow-lg ${current.glow}` : ''}`}>
                            <div className={`p-3 rounded-xl ${currentLevel === 'lockdown' ? 'bg-slate-700' : 'bg-white/60'} ${current.pulse ? 'animate-pulse' : ''}`}>
                                <CurrentIcon className={`w-7 h-7 ${current.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className={`font-bold text-base ${current.color}`}>{current.labelTh}</p>
                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${currentLevel === 'lockdown' ? 'bg-slate-700 text-slate-300' : 'bg-white/70 text-slate-500'}`}>
                                        {current.level.toUpperCase()}
                                    </span>
                                </div>
                                <p className={`text-xs leading-relaxed ${currentLevel === 'lockdown' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {metadata?.message || current.description}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    <span ref={relativeTimeRef}>{formatRelativeTime(updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Level Selector Grid */}
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">เลือกระดับใหม่</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {SCENARIOS.map(scenario => {
                                const Icon = scenario.icon
                                const isActive = scenario.level === currentLevel
                                const isLockdown = scenario.level === 'lockdown'
                                return (
                                    <button
                                        key={scenario.level}
                                        id={`scenario-btn-${scenario.level}`}
                                        onClick={() => handleLevelClick(scenario.level)}
                                        disabled={isActive || isSaving || isLoading}
                                        className={`
                                            relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                                            ${isActive
                                                ? `${scenario.border} ${scenario.bg} cursor-default ring-2 ring-offset-1 ${
                                                    isLockdown ? 'ring-slate-600' : 'ring-blue-400'
                                                  }`
                                                : `border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm cursor-pointer ${
                                                    isSaving || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                                  }`
                                            }
                                        `}
                                    >
                                        {isActive && (
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
                                        )}
                                        <div className={`p-2 rounded-lg ${isActive ? (isLockdown ? 'bg-slate-700' : 'bg-white/60') : 'bg-slate-50'}`}>
                                            <Icon className={`w-5 h-5 ${isActive ? scenario.color : 'text-slate-400'}`} />
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-xs font-bold ${isActive ? scenario.color : 'text-slate-600'}`}>
                                                {scenario.labelTh}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block leading-tight">
                                                {scenario.label}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Info Footer */}
                    <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl">
                        <ShieldAlert className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-500 leading-relaxed">
                            การเปลี่ยนแปลงระดับสถานการณ์จะถูกส่งไปยัง CityZen ผ่าน <strong>Supabase Realtime</strong> ทันที
                            และบันทึกประวัติไว้ใน scenario logs
                        </p>
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {pendingLevel && (
                <ConfirmModal
                    from={getScenarioConfig(currentLevel)}
                    to={getScenarioConfig(pendingLevel)}
                    message={confirmMessage}
                    onMessageChange={setConfirmMessage}
                    onConfirm={handleConfirm}
                    onCancel={() => setPendingLevel(null)}
                    isLoading={isSaving}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-5">
                    <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${
                        toast.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                        {toast.type === 'success'
                            ? <CheckCircle2 className="w-5 h-5 shrink-0" />
                            : <X className="w-5 h-5 shrink-0" />
                        }
                        <p className="text-sm font-medium">{toast.text}</p>
                    </div>
                </div>
            )}
        </>
    )
}
