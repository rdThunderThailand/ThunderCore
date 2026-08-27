'use client'

import { useTranslation } from '@/i18n/context'
import { TenantDashboard } from '@/types/tenants'
import { Boxes, Calendar, ExternalLink, HardDrive, Users, Wifi } from 'lucide-react'
import { PlayerStatusChart } from './components/player-status-chart'
import { LicensesChart } from './components/licenses-chart'
import { UserListWidget } from './components/user-list-widget'
import { RecentActivitiesWidget } from './components/recent-activities-widget'
import { StorageProgressBar } from './components/storage-progress'
import { StatCard } from './components/stat-card'
import Map, { NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface OrgDashboardContentProps {
    tenant: TenantDashboard
    createdDate: string
}

export function OrgDashboardContent({ tenant, createdDate }: OrgDashboardContentProps) {
    const { t } = useTranslation()
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    const usedStorageGb = ((tenant.quota?.used_storage_mb ?? 0) / 1024).toFixed(1)
    const maxStorageGb = ((tenant.quota?.max_storage_mb ?? 0) / 1024).toFixed(1)

    return (
        <div className="min-h-screen pb-24 lg:pb-0 bg-slate-50/50">
            <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6 animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-slate-200/80">
                        <span className="text-xl lg:text-2xl font-black text-blue-600">{tenant.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{tenant.name}</h1>
                        <p className="text-slate-500 font-medium flex items-center gap-1.5 text-xs lg:text-sm">
                            <Calendar className="w-3.5 h-3.5" />
                            {t('orgDash.memberSince')} {createdDate}
                        </p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Assets"
                        value={`${tenant.quota?.used_assets ?? 0}`}
                        subtext={`of ${tenant.quota?.max_assets ?? 0} licensed`}
                        icon={<Boxes className="h-5 w-5" />}
                        iconBg="bg-blue-500"
                    />
                    <StatCard
                        label="Storage Used"
                        value={`${usedStorageGb} GB`}
                        subtext={`of ${maxStorageGb} GB`}
                        icon={<HardDrive className="h-5 w-5" />}
                        iconBg="bg-amber-500"
                    />
                    <StatCard
                        label="Members"
                        value={`${tenant.members?.length ?? 0}`}
                        subtext="tenant members"
                        icon={<Users className="h-5 w-5" />}
                        iconBg="bg-emerald-500"
                    />
                    <StatCard
                        label="Devices Online"
                        value={`${tenant.playerStatus?.online ?? 0}`}
                        subtext={`of ${tenant.playerStatus?.total ?? 0} total`}
                        icon={<Wifi className="h-5 w-5" />}
                        iconBg="bg-rose-500"
                    />
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Top Row: Location Map (8 cols) & Player Status (4 cols) */}
                    <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
                        <h2 className="text-base font-bold text-slate-900 mb-1">Location Report</h2>
                        <p className="text-xs font-medium text-slate-500 mb-4">Location for manage your players</p>
                        <div className="w-full h-[300px] bg-slate-100 rounded-lg overflow-hidden relative">
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

                    <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-bold text-slate-900">Player Status</h2>
                            <button className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                                View All
                                <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <PlayerStatusChart status={tenant.playerStatus} />
                    </div>

                    {/* Middle Row: Licenses (4 cols), Users (4 cols), Activities (4 cols) */}
                    <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
                        <div className="flex justify-between items-center mb-1">
                            <h2 className="text-base font-bold text-slate-900">Licenses</h2>
                            <button className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                                Manage
                                <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <p className="text-xs font-medium text-slate-500 mb-4">Manage your licenses</p>
                        <LicensesChart quota={tenant.quota} />
                    </div>

                    <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-bold text-slate-900">User</h2>
                            <button className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                                View All
                                <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <UserListWidget members={tenant.members} />
                    </div>

                    <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-bold text-slate-900">Recent Activities</h2>
                            <button className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                                View All
                                <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <RecentActivitiesWidget logs={tenant.recentLogs} />
                    </div>

                    {/* Bottom Row: Storage (12 cols) */}
                    <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
                        <h2 className="text-base font-bold text-slate-900 mb-4">Storage</h2>
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
