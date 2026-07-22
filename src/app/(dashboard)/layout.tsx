import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/SideBar"
import { DashboardMain } from "@/components/layout/DashboardMain"
import { ToastProvider } from "@/components/toast"
import { I18nProvider } from "@/i18n/context"
import Header from "@/components/layout/Header"
import { isDevBypass } from "@/lib/dev"
import { getCurrentUser, isAxiosError } from "@/lib/thunder-core"
import { mockUser, type UserProfile } from "@/store/useAuthStore"
import React, { Suspense } from "react"

async function resolveCurrentUser(): Promise<UserProfile> {
    if (isDevBypass()) return mockUser

    try {
        const current = await getCurrentUser()
        return {
            name: current.display_name || [current.first_name, current.last_name].filter(Boolean).join(" ") || current.email,
            role: current.role,
            email: current.email,
            avatar_url: current.avatar_url ?? "",
        }
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) redirect("/login")
        throw error
    }
}

async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await resolveCurrentUser()

    return (
        <I18nProvider>
            <ToastProvider>
                <div className="flex h-screen w-full bg-[radial-gradient(ellipse_at_top_left,rgba(219,234,254,0.6),rgb(248,250,252),rgb(255,255,255))] overflow-hidden">
                    <div className="hidden lg:flex shrink-0 relative z-50">
                        <Suspense fallback={<div className="w-64 h-full bg-white/0" />}>
                            <Sidebar />
                        </Suspense>
                    </div>

                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                        <div className="hidden lg:block">
                            <Suspense fallback={null}>
                                <Header user={user} />
                            </Suspense>
                        </div>

                        <DashboardMain>
                            {children}
                        </DashboardMain>
                    </div>
                </div>
            </ToastProvider>
        </I18nProvider>
    )
}

export default DashboardLayout
