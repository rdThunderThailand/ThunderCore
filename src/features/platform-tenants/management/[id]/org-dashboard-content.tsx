'use client'

import { useTranslation } from '@/i18n/context'
import { TenantDashboard } from '@/types/tenants'
import { Calendar } from 'lucide-react'
import { PlayerStatusChart } from './components/player-status-chart'
import { LicensesChart } from './components/licenses-chart'
import { UserListWidget } from './components/user-list-widget'
import { RecentActivitiesWidget } from './components/recent-activities-widget'
import { StorageProgressBar } from './components/storage-progress'
import Map, { NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface OrgDashboardContentProps {
    tenant: TenantDashboard
    createdDate: string
}

export function OrgDashboardContent({ tenant, createdDate }: OrgDashboardContentProps) {
    const { t } = useTranslation()
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    return (
        <div className="min-h-screen pb-24 lg:pb-0">
            <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8 animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                            <span className="text-xl lg:text-2xl font-black text-violet-600">{tenant.name.charAt(0)}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight">{tenant.name}</h1>
                            <p className="text-slate-500 font-bold flex items-center gap-2 text-xs lg:text-sm">
                                <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
                                {t('orgDash.memberSince')} {createdDate}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Grid Layout matching Mockup */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Top Row: Location Map (8 cols) & Player Status (4 cols) */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-black text-slate-900 mb-1">Location Report</h2>
                        <p className="text-xs font-bold text-slate-500 mb-4">Location for manage your players</p>
                        <div className="w-full h-[300px] bg-slate-100 rounded-xl overflow-hidden relative">
                            {mapboxToken ? (
                                <Map
                                    mapboxAccessToken={mapboxToken}
                                    initialViewState={{
                                        longitude: 100.5018,
                                        latitude: 13.7563,
                                        zoom: 4.5
                                    }}
                                    mapStyle="mapbox://styles/mapbox/streets-v12"
                                    attributionControl={false}
                                >
                                    <NavigationControl position="bottom-right" />
                                </Map>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 border border-slate-200">
                                    <span className="text-sm font-semibold mb-1">Map Preview Unavailable</span>
                                    <span className="text-xs">Missing Mapbox token</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black text-slate-900">Player Status</h2>
                            <button className="text-xs font-bold text-violet-600 hover:text-violet-700 underline">View All</button>
                        </div>
                        <PlayerStatusChart status={tenant.playerStatus} />
                    </div>

                    {/* Middle Row: Licenses (4 cols), Users (4 cols), Activities (4 cols) */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black text-slate-900">Licenses</h2>
                            <button className="text-xs font-bold text-violet-600 hover:text-violet-700 underline">Manage</button>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-4 -mt-4">Manage your Licenses</p>
                        <LicensesChart quota={tenant.quota} />
                    </div>

                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black text-slate-900">User</h2>
                            <button className="text-xs font-bold text-violet-600 hover:text-violet-700 underline">View All</button>
                        </div>
                        <UserListWidget members={tenant.members} />
                    </div>

                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black text-slate-900">Recent Activities</h2>
                            <button className="text-xs font-bold text-violet-600 hover:text-violet-700 underline">View All</button>
                        </div>
                        <RecentActivitiesWidget logs={tenant.recentLogs} />
                    </div>

                    {/* Bottom Row: Storage (12 cols) */}
                    <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-black text-slate-900 mb-6">Storage</h2>
                        <StorageProgressBar
                            usedStorage={tenant.quota?.used_storage_mb || 0}
                            maxStorage={tenant.quota?.max_storage_mb || 50 * 1024}
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}

