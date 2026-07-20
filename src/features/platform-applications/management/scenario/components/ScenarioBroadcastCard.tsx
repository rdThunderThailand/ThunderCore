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
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getApplicationScenario, updateApplicationScenario } from '../../../actions'

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

function getScenarioConfig(level: ScenarioLevel): ScenarioConfig {
    return SCENARIOS.find((s) => s.level === level) ?? SCENARIOS[0]
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">ยืนยันการเปลี่ยนแปลง</p>
                        <h3 className="text-lg font-bold text-slate-900">เปลี่ยนระดับสถานการณ์</h3>
                    </div>
                    <button onClick={onCancel} className="rounded-lg p-1.5 transition-colors hover:bg-slate-100">
                        <X className="h-4 w-4 text-slate-500" />
                    </button>
                </div>

                <div className="mb-5 flex items-center gap-3">
                    <div className={`flex-1 rounded-xl border-2 p-3 text-center ${from.border} ${from.bg}`}>
                        <p className="mb-1 text-xs text-slate-500">จาก</p>
                        <p className={`text-sm font-bold ${from.color}`}>{from.labelTh}</p>
                    </div>
                    <div className="font-bold text-slate-400">→</div>
                    <div className={`flex-1 rounded-xl border-2 p-3 text-center ${to.border} ${to.bg}`}>
                        <p className="mb-1 text-xs text-slate-500">เป็น</p>
                        <p className={`text-sm font-bold ${to.color}`}>{to.labelTh}</p>
                    </div>
                </div>

                {(to.level === 'crisis' || to.level === 'lockdown') && (
                    <div className={`mb-4 flex items-start gap-2 rounded-xl p-3 ${to.level === 'lockdown' ? 'bg-slate-900 text-slate-200' : 'bg-red-50 text-red-700'}`}>
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                        <p className="text-xs leading-relaxed">
                            การตั้งค่านี้จะส่งสัญญาณ <strong>{to.labelTh.toUpperCase()}</strong> ไปยัง CityZen ทันที
                            ผู้ใช้งานจะเห็น UI เปลี่ยนแปลงในทุกอุปกรณ์
                        </p>
                    </div>
                )}

                <div className="mb-5">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        ข้อความแจ้งเตือน <span className="font-normal text-slate-400">(ไม่บังคับ)</span>
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => onMessageChange(e.target.value)}
                        placeholder="เช่น: น้ำมันขาดแคลนในเขต กทม. กรุณาตรวจสอบสาขาใกล้บ้าน"
                        rows={3}
                        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all ${
                            to.level === 'lockdown' ? 'bg-slate-900 hover:bg-slate-800' :
                            to.level === 'crisis' ? 'bg-red-600 hover:bg-red-700' :
                            to.level === 'watch' ? 'bg-amber-500 hover:bg-amber-600' :
                            'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ToIcon className="h-4 w-4" />}
                        ยืนยัน
                    </button>
                </div>
            </div>
        </div>
    )
}

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
    const relativeTimeRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getApplicationScenario(appId)
                setCurrentLevel(data.scenario_level)
                setMetadata(data.scenario_metadata)
                setUpdatedAt(data.scenario_updated_at)
            } catch {
                toast.error('ไม่สามารถโหลด scenario ได้')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [appId])

    // Refresh the relative-time label in place without re-rendering the card.
    useEffect(() => {
        const interval = setInterval(() => {
            if (relativeTimeRef.current) relativeTimeRef.current.textContent = formatRelativeTime(updatedAt)
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
            const updateMetadata: ScenarioMetadata = { ...metadata, message: confirmMessage || undefined }
            const result = await updateApplicationScenario(appId, pendingLevel, updateMetadata)
            setCurrentLevel(result.scenario_level)
            setMetadata(updateMetadata)
            setUpdatedAt(result.scenario_updated_at)
            toast.success(`เปลี่ยนเป็น "${getScenarioConfig(pendingLevel).labelTh}" เรียบร้อย`)
        } catch (err) {
            toast.error((err as Error).message)
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
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 pb-4 pt-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-50 p-2.5">
                            <Radio className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Scenario Broadcast</h3>
                            <p className="mt-0.5 text-xs text-slate-400">
                                ส่งระดับสถานการณ์ไปยัง{appName ? ` ${appName}` : ' child app'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Realtime
                    </div>
                </div>

                <div className="space-y-5 p-6">
                    {isLoading ? (
                        <div className="flex h-20 items-center justify-center rounded-xl bg-slate-50">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-all duration-300 ${current.border} ${current.bg} ${current.glow ? `shadow-lg ${current.glow}` : ''}`}>
                            <div className={`rounded-xl p-3 ${currentLevel === 'lockdown' ? 'bg-slate-700' : 'bg-white/60'} ${current.pulse ? 'animate-pulse' : ''}`}>
                                <CurrentIcon className={`h-7 w-7 ${current.color}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-0.5 flex items-center gap-2">
                                    <p className={`text-base font-bold ${current.color}`}>{current.labelTh}</p>
                                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${currentLevel === 'lockdown' ? 'bg-slate-700 text-slate-300' : 'bg-white/70 text-slate-500'}`}>
                                        {current.level.toUpperCase()}
                                    </span>
                                </div>
                                <p className={`text-xs leading-relaxed ${currentLevel === 'lockdown' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {metadata?.message || current.description}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Clock className="h-3 w-3" />
                                    <span ref={relativeTimeRef}>{formatRelativeTime(updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">เลือกระดับใหม่</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {SCENARIOS.map((scenario) => {
                                const Icon = scenario.icon
                                const isActive = scenario.level === currentLevel
                                const isLockdown = scenario.level === 'lockdown'
                                return (
                                    <button
                                        key={scenario.level}
                                        onClick={() => handleLevelClick(scenario.level)}
                                        disabled={isActive || isSaving || isLoading}
                                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                                            isActive
                                                ? `${scenario.border} ${scenario.bg} cursor-default ring-2 ring-offset-1 ${isLockdown ? 'ring-slate-600' : 'ring-blue-400'}`
                                                : `border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm ${isSaving || isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`
                                        }`}
                                    >
                                        {isActive && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />}
                                        <div className={`rounded-lg p-2 ${isActive ? (isLockdown ? 'bg-slate-700' : 'bg-white/60') : 'bg-slate-50'}`}>
                                            <Icon className={`h-5 w-5 ${isActive ? scenario.color : 'text-slate-400'}`} />
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-xs font-bold ${isActive ? scenario.color : 'text-slate-600'}`}>{scenario.labelTh}</p>
                                            <p className="mt-0.5 hidden text-[10px] leading-tight text-slate-400 sm:block">{scenario.label}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <p className="text-xs leading-relaxed text-slate-500">
                            การเปลี่ยนแปลงระดับสถานการณ์จะถูกส่งไปยัง CityZen แบบ Real-time ทันที และบันทึกประวัติไว้ใน scenario logs
                        </p>
                    </div>
                </div>
            </div>

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
        </>
    )
}
