import { Sidebar } from "@/features/knowledgebase/components/Sidebar"
import { Header } from "@/features/knowledgebase/components/Header"
import { resolveCurrentUser } from "@/lib/current-user"
import React from "react"

async function KnowledgebaseLayout({ children }: { children: React.ReactNode }) {
    const user = await resolveCurrentUser()

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default KnowledgebaseLayout
