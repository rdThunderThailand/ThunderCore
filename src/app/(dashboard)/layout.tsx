import Navbar from "@/components/layout/NavBar"
import Sidebar from "@/components/layout/SideBar"
import { ToastProvider } from "@/components/toast"
import { I18nProvider } from "@/i18n/context"
import React, { Suspense } from "react"

function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <I18nProvider>
            <ToastProvider>
                <div className="flex h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/60 via-slate-50 to-white overflow-hidden">
                    {/* Sidebar: Flexible width, full height - Hidden on Mobile */}
                    <div className="hidden lg:flex shrink-0 relative z-50">
                        <Suspense fallback={<div className="w-64 h-full bg-white/0" />}>
                            <Sidebar />
                        </Suspense>
                    </div>

                    {/* Main Content Area: Flex column for Navbar + Page Content */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">

                        {/* Desktop Navbar: Sticky at top of content area - Hidden on Mobile */}
                        <div className="hidden lg:block">
                            <Navbar />
                        </div>

                        {/* Scrollable Page Content */}
                        <main className="flex-1 overflow-y-auto overflow-x-hidden">
                            {/* Container wrapper if needed, or let pages handle their own padding */}
                            <div className="w-full">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </ToastProvider>
        </I18nProvider>
    )
}
export default DashboardLayout