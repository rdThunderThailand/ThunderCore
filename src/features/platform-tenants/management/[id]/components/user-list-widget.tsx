'use client'

import { format } from 'date-fns'

interface UserListWidgetProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    members: any[]
}

export function UserListWidget({ members }: UserListWidgetProps) {


    if (!members || members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500 text-sm">
                No users found.
            </div>
        )
    }
    console.log('UserListWidget members:', members)
    return (
        <div className="flex flex-col h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {members.map((member) => {
                const isOnline = member.role !== 'owner' // Just a simulated check for demonstration matching mockup

                return (
                    <div key={member.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            {member.profile?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={member.profile.avatar_url}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-slate-200 uppercase">
                                    {member.profile?.first_name
                                        ? member.profile.first_name.charAt(0)
                                        : member.role.charAt(0)}
                                </div>
                            )}


                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[110px]">
                                        {member.profile?.first_name
                                            ? `${member.profile.first_name} ${member.profile.last_name || ''}`
                                            : 'Unknown User'}
                                    </p>
                                    {member.role && (
                                        <span className="px-1.5 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-wider">
                                            {member.role}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400">
                                    {member.created_at ? format(new Date(member.created_at), 'dd MMMM yyyy') : 'Unknown Date'}
                                </p>
                            </div>

                        </div>
                        <span className={`text-xs font-bold ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
