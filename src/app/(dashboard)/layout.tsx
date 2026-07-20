import Header from "@/components/layout/Header"
import Navbar from "@/components/layout/NavBar"
import Sidebar from "@/components/layout/SideBar"
import { ToastProvider } from "@/components/toast"
import { I18nProvider } from "@/i18n/context"
import React, { Suspense } from "react"

function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <I18nProvider>
            <ToastProvider>
                {/* <div className="flex h-screen bg-red-500 overflow-hidden"> */}
                <div className="flex h-screen w-full bg-[radial-gradient(ellipse_at_top_left,rgba(219,234,254,0.6),rgb(248,250,252),rgb(255,255,255))] overflow-hidden">                   {/* Sidebar: Flexible width, full height - Hidden on Mobile */}
                    <div className="hidden lg:flex shrink-0 relative z-50">
                        <Suspense fallback={<div className="w-64 h-full bg-white/0" />}>
                            <Sidebar />
                        </Suspense>
                    </div>

                    {/* Main Content Area: Flex column for Navbar + Page Content */}
                    {/* ponytail: no z-index here — a stacking context would trap fixed modals below the z-50 sidebar, leaving its column uncovered by the backdrop. */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                        {/* Desktop Navbar: Sticky at top of content area - Hidden on Mobile */}
                        <div className="hidden lg:block">
                            <Header />
                        </div>

                        {/* Scrollable Page Content */}
                        <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0">
                            {/* Container wrapper if needed, or let pages handle their own padding */}
                            <div className="w-full flex-1 flex flex-col min-h-0">
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