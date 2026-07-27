import Sidebar from "@/components/layout/SideBar"
import { DashboardMain } from "@/components/layout/DashboardMain"
import { ToastProvider } from "@/components/toast"
import { I18nProvider } from "@/i18n/context"
import { AmbientHeader } from "@/components/layout/AmbientHeader"
import { resolveCurrentUser } from "@/lib/current-user"
import React, { Suspense } from "react"

async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await resolveCurrentUser()

    return (
        <I18nProvider>
            <ToastProvider>
                <div className="flex h-screen w-full bg-[radial-gradient(ellipse_at_top_left,rgba(219,234,254,0.6),rgb(248,250,252),rgb(255,255,255))] overflow-hidden">
                    <div className="hidden lg:flex shrink-0 relative z-50">
                        <Suspense fallback={<div className="w-64 h-full bg-white/0" />}>
                            <Sidebar user={user} />
                        </Suspense>
                    </div>

                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                        <div className="hidden lg:block">
                            <Suspense fallback={null}>
                                <AmbientHeader user={user} />
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
