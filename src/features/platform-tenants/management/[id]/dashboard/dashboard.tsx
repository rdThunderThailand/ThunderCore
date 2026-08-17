import CardGreetingDemo from '@/features/platform-tenants/management/[id]/components/greetingCard'
import { DashboardMap } from '@/features/platform-tenants/management/[id]/components/DashboardMap'
import {
    getCurrentUser,
    getMyMemberships,
    isAxiosError,
    type CurrentUser,
    type Membership,
} from '@/lib/thunder-core'
import {
    CheckCircle2,
    ChevronDown,
    ExternalLink,
    Inbox,
    MessageSquare,
    MousePointer2,
    RotateCw,
    Timer,
} from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function CompanyAdminDashboard() {
    let user: CurrentUser
    let memberships: Membership[]

    try {
        ;[user, memberships] = await Promise.all([getCurrentUser(), getMyMemberships()])
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) redirect('/login')
        throw error
    }

    const recipientName = user.first_name + ' ' + user.last_name

    return (
        <div className="min-h-screen p-6 lg:p-8 space-y-6">
            {/* Greeting Header */}
            <CardGreetingDemo recipient={recipientName} avatarSrc={user.avatar_url ?? undefined} />

            {/* Top 4 Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Chat */}
                <div className="flex items-start justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Total Chat
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900">12,402</h3>
                        <p className="mt-1 text-xs text-slate-400 font-medium">+12.5% from last month</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs">
                        <MessageSquare className="h-5 w-5 fill-current" />
                    </div>
                </div>

                {/* Remaining */}
                <div className="flex items-start justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Remaining
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900">2,598</h3>
                        <p className="mt-1 text-xs text-slate-400 font-medium">-2% since yesterday</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                        <RotateCw className="h-5 w-5" />
                    </div>
                </div>

                {/* Recently (24H) */}
                <div className="flex items-start justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Recently (24H)
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900">156</h3>
                        <p className="mt-1 text-xs text-slate-400 font-medium">+12 since last hour</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-xs">
                        <Timer className="h-5 w-5" />
                    </div>
                </div>

                {/* Completed */}
                <div className="flex items-start justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Completed
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900">4,892</h3>
                        <p className="mt-1 text-xs text-slate-400 font-medium">+8.4% from last week</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Middle Row: Todays Chats Map & Chat Progress Chart */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Todays Chats Map Card */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                    <h2 className="text-base font-bold text-slate-900 mb-1">Todays Chats</h2>
                    <div className="mt-4 h-[300px] w-full">
                        <DashboardMap />
                    </div>
                </div>

                {/* Chat Progress Chart Card */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                    <h2 className="text-base font-bold text-slate-900">Chat Progress</h2>

                    <div className="mt-4 flex h-64 flex-col justify-between rounded-lg border border-slate-100 p-4 bg-white relative">
                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 text-xs font-semibold text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-xs bg-blue-600"></span>
                                <span>STUDY</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-xs bg-sky-400"></span>
                                <span>ONLINE TEST</span>
                            </div>
                        </div>

                        {/* Chart Area with Gridlines */}
                        <div className="relative mt-4 flex-1 flex flex-col justify-between text-xs text-slate-400">
                            {['80 HR', '60 HR', '40 HR', '20 HR', '0 HR'].map((label) => (
                                <div key={label} className="relative flex items-center w-full">
                                    <span className="w-12 text-right pr-3 font-medium">{label}</span>
                                    <div className="flex-1 border-b border-dashed border-slate-200"></div>
                                </div>
                            ))}

                            {/* Stacked Bars overlay */}
                            <div className="absolute left-14 right-4 bottom-5 top-2 flex items-end justify-around">
                                {/* JAN */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-8 flex flex-col rounded-md overflow-hidden shadow-xs">
                                        <div className="h-10 bg-sky-400"></div>
                                        <div className="h-16 bg-blue-600"></div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-500 mt-2">JAN</span>
                                </div>

                                {/* FEB */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-8 flex flex-col rounded-md overflow-hidden shadow-xs">
                                        <div className="h-6 bg-sky-400"></div>
                                        <div className="h-10 bg-blue-600"></div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-500 mt-2">FEB</span>
                                </div>

                                {/* MAR with Tooltip */}
                                <div className="relative flex flex-col items-center gap-1">
                                    {/* Tooltip Popup */}
                                    <div className="absolute -top-12 z-20 flex flex-col rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-xl">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                                            <span>35 HR</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                                            <span>52 HR</span>
                                        </div>
                                    </div>
                                    <MousePointer2 className="absolute -top-3 right-0 z-30 h-4 w-4 text-slate-900 fill-slate-900 drop-shadow-sm" />

                                    <div className="w-8 flex flex-col rounded-md overflow-hidden shadow-xs">
                                        <div className="h-8 bg-sky-400"></div>
                                        <div className="h-24 bg-blue-600"></div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-500 mt-2">MAR</span>
                                </div>

                                {/* APR */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-8 flex flex-col rounded-md overflow-hidden shadow-xs">
                                        <div className="h-6 bg-sky-400"></div>
                                        <div className="h-18 bg-blue-600"></div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-500 mt-2">APR</span>
                                </div>

                                {/* MAY */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-8 flex flex-col rounded-md overflow-hidden shadow-xs">
                                        <div className="h-4 bg-sky-400"></div>
                                        <div className="h-8 bg-blue-600"></div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-500 mt-2">MAY</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: User Table & Recent Chats Table */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* User Card */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-900">User</h2>
                        <a
                            href="#"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                            View All
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

                {/* Recent Chats Card */}
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
        </div>
    )
}
