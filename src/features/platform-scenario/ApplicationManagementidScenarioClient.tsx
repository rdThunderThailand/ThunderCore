'use client'

import { useParams } from 'next/navigation'
import { ScenarioBroadcastCard } from '@/features/platform-scenario/components/ScenarioBroadcastCard'
import { getApplicationById } from './actions'
import { useEffect, useState } from 'react'
import { ApplicationDetails } from '@/models/Application'
import { Loader2 } from 'lucide-react'

export function ApplicationManagementidScenarioClient() {
    const params = useParams()
    const appId = params.id as string

    const [app, setApp] = useState<ApplicationDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getApplicationById(appId).then(data => {
            setApp(data)
            setIsLoading(false)
        }).catch(() => setIsLoading(false))
    }, [appId])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-6 min-h-screen">
            {/* Header */}
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    {app?.name ?? 'Application'}
                </p>
                {/* <h1 className="text-2xl font-bold text-slate-900">Scenario Control</h1> */}
                <p className="text-sm text-slate-500 mt-1">
                    ตั้งค่าระดับความเข้มข้นของสถานการณ์ที่ส่งไปยัง CityZen แบบ Real-time
                </p>
            </div>

            {/* Card */}
            <div className="max-w-2xl">
                <ScenarioBroadcastCard appId={appId} appName={app?.name} />
            </div>
        </div>
    )
}