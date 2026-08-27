import { StatCard } from '@/features/platform-tenants/management/[id]/components/stat-card'
import { getCurrentUser, getMyMemberships, isAxiosError } from '@/lib/thunder-core'
import {
    CheckCircle2,
    ChevronDown,
    ExternalLink,
    Inbox,
    MessageSquare,
    RotateCw,
    Timer,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { ChatProgressChart } from './components/chat-progress-chart'
import { ChatsGauge } from './components/chats-gauge'

export default async function CompanyAdminDashboard() {
    // The page below is all placeholder chat-stat content (no real backend for it yet) — these
    // calls exist purely as the auth gate: an expired/missing session bounces to /login instead
    // of rendering fake data as if the user were signed in.
    try {
        await Promise.all([getCurrentUser(), getMyMemberships()])
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) redirect('/login')
        throw error
    }

    return (
        <div className="min-h-screen p-6 lg:p-8 space-y-6">
            {/* Top 4 Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Chat"
                    value="12,402"
                    subtext="+12.5% from last month"
                    icon={<MessageSquare className="h-5 w-5" />}
                    iconBg="bg-blue-500"
                />
                <StatCard
                    label="Remaining"
                    value="2,598"
                    subtext="-2% since yesterday"
                    icon={<RotateCw className="h-5 w-5" />}
                    iconBg="bg-amber-500"
                />
                <StatCard
                    label="Recently (24H)"
                    value="156"
                    subtext="+12 since last hour"
                    icon={<Timer className="h-5 w-5" />}
                    iconBg="bg-rose-500"
                />
                <StatCard
                    label="Completed"
                    value="4,892"
                    subtext="+8.4% from last week"
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    iconBg="bg-emerald-500"
                />
            </div>

            {/* Middle Row: Chat Progress, Todays Chats gauge, User */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                {/* Chat Progress Chart Card */}
                <div className="lg:col-span-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                    <h2 className="text-base font-bold text-slate-900">Chat Progress</h2>

                    <div className="mt-4 rounded-lg border border-slate-100 p-4 bg-white">
                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 text-xs font-semibold text-slate-500 mb-2">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-xs bg-blue-600"></span>
                                <span>STUDY</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-xs bg-sky-400"></span>
                                <span>ONLINE TEST</span>
                            </div>
                        </div>

                        <ChatProgressChart />
                    </div>
                </div>

                {/* Todays Chats Gauge Card */}
                <div className="lg:col-span-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-base font-bold text-slate-900">Todays Chats</h2>
                        <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                            Monthly
                            <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                        Remaining
                    </div>
                    <div className="flex justify-center py-4">
                        <ChatsGauge remaining={1000} total={2598} />
                    </div>
                </div>

                {/* User Card */}
                <div className="lg:col-span-3 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-slate-900">User</h2>
                        <a
                            href="#"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                            View All
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>

                    <div className="rounded-lg border border-slate-100 overflow-hidden">
                        {/* Table Header */}
                        <div className="flex items-center justify-between bg-slate-50/80 px-4 py-2.5 text-xs font-semibold text-slate-700 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex items-center gap-1 cursor-pointer select-none">
                                    <span>Title</span>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {/* Empty State Body */}
                        <div className="flex flex-col items-center justify-center bg-white py-10">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-300">
                                <Inbox className="h-8 w-8 stroke-[1.5]" />
                            </div>
                            <span className="mt-2 text-xs font-medium text-slate-400">No Data</span>
                        </div>

                        {/* Footer Bar */}
                        <div className="h-8 border-t border-slate-100 bg-slate-50/50"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Chats Table */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900">Recent Chats</h2>
                    <a
                        href="#"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                        View Chats
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                </div>

                <div className="mt-4 rounded-lg border border-slate-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="flex items-center justify-between bg-slate-50/80 px-4 py-2.5 text-xs font-semibold text-slate-700 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex items-center gap-1 cursor-pointer select-none">
                                <span>Title</span>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 cursor-pointer select-none">
                            <span>Created At</span>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                    </div>

                    {/* Empty State Body */}
                    <div className="flex flex-col items-center justify-center bg-white py-12">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-300">
                            <Inbox className="h-8 w-8 stroke-[1.5]" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-slate-400">No Data</span>
                    </div>

                    {/* Footer Bar */}
                    <div className="h-8 border-t border-slate-100 bg-slate-50/50"></div>
                </div>
            </div>
        </div>
    )
}
