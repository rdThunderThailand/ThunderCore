'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function DashboardMain({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const mainRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTop = 0
        }
    }, [pathname])

    return (
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0">
            <div className="w-full flex-1 flex flex-col min-h-0">
                {children}
            </div>
        </main>
    )
}
