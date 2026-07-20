'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getApplicationById } from '../../actions'
import { ScenarioBroadcastCard } from './components/ScenarioBroadcastCard'

export function ApplicationManagementidScenarioClient({ appId }: { appId: string }) {
    const router = useRouter()
    const [appName, setAppName] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getApplicationById(appId)
                if (!data) {
                    router.push('/applications')
                    return
                }
                setAppName(data.name)
            } catch {
                toast.error('Failed to load application')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [appId, router])

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 p-8">
            <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">{appName || 'Application'}</p>
                <h1 className="text-lg font-semibold text-slate-900">Scenario Control</h1>
                <p className="mt-1 text-sm text-slate-500">
                    ตั้งค่าระดับความเข้มข้นของสถานการณ์ที่ส่งไปยัง CityZen แบบ Real-time
                </p>
            </div>
            <div className="max-w-2xl">
                <ScenarioBroadcastCard appId={appId} appName={appName} />
            </div>
        </div>
    )
}
