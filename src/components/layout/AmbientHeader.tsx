'use client'

import { usePathname } from 'next/navigation'
import Header, { type HeaderProps } from './Header'

// The assets list page (both super-admin and company-admin) renders its own <Header />
// inline — see TenantsManagementidAssetsClient.tsx — so the ambient one from
// (dashboard)/layout.tsx must not also render there, or it'd be duplicated.
const ASSETS_SUPERADMIN = /^\/tenants\/management\/[^/]+\/assets$/
const ASSETS_COMPANYADMIN = /^\/[^/]+\/assets$/

export function AmbientHeader(props: HeaderProps) {
    const pathname = usePathname()
    // console.log(pathname)
    if (ASSETS_SUPERADMIN.test(pathname) || ASSETS_COMPANYADMIN.test(pathname)) return null
    return <Header {...props} />
}
