"use client";

import { useState } from 'react';
import type { ComponentType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../utils/cn';
import {
    Settings,
    Info,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
} from 'lucide-react';
import logo from "../../../public/logo.png";
import logoFull from "../../../public/logo-full.png";

import { mockUser, type UserProfile } from '@/store/useAuthStore';
import Image from 'next/image';
import {
    superAdminNavigationItems,
    getSuperAdminNavigationItemsAtManagement,
    getCompanyAdminNavigationItems,
    defaultNavigationItems,
    getSuperAdminNavigationItemsAtApplicationsManagement,
    getCompanyAdminNavigationItemsAtApplicationsManagement
} from './sidebar-nav';

export interface NavItem {
    label: string;
    labelTh?: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    badge?: number; // Supports counters like notifications
}


export interface SidebarStyleOverrides {
    container?: string;       // Custom tailwind classes for the entire sidebar wrap (e.g. bg, border)
    headerTitle?: string;     // Styles for the main brand title text
    headerSubtitle?: string;  // Styles for the brand subtitle text
    navItemActive?: string;   // Active link state styles (e.g. bg-emerald-50 text-emerald-600)
    navItemIdle?: string;     // Default inactive link state styles
    badgeActive?: string;     // Color scheme for the active item badge counter
}

export interface SidebarProps {
    brandLogo?: React.ReactNode;
    brandFullLogo?: React.ReactNode;

    navigationItems?: NavItem[];
    user?: UserProfile;
    onLogout?: () => void;

    customStyles?: SidebarStyleOverrides;
}

export const SideBar = ({
    brandLogo = <Image src={logo} alt="brand-logo" className="w-full h-full object-contain" />,
    brandFullLogo = <Image src={logoFull} alt="brand-logo" className="w-full h-full object-contain" />,
    navigationItems,
    user = mockUser,
    onLogout,
    customStyles = {}
}: SidebarProps) => {
    const pathname = usePathname();
    const managementId = pathname.match(/\/(?:tenants|applications)\/management\/([^/]+)/)?.[1] ?? '';
    const resolvedNavigationItems = navigationItems ?? (() => {
        if (user?.role === "super_admin") {
            if (pathname.includes("/tenants/management/")) {
                return getSuperAdminNavigationItemsAtManagement(managementId);
            }
            if (pathname.includes("/applications/")) {
                return getSuperAdminNavigationItemsAtApplicationsManagement(managementId);
            }
            return superAdminNavigationItems;
        }
        if (user?.role === "company_admin") {
            if (pathname.includes("/tenants/management/")) {
                return getCompanyAdminNavigationItems(managementId);
            }
            if (pathname.includes("/applications/")) {
                return getCompanyAdminNavigationItemsAtApplicationsManagement(managementId);
            }
        }
        return defaultNavigationItems;
    })();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isOpenMobile, setIsOpenMobile] = useState(false);

    return (
        <>
            {/* Mobile Hamburger Toggle Button */}
            <button
                onClick={() => setIsOpenMobile(!isOpenMobile)}
                className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 focus:outline-none transition-all duration-200 hover:bg-slate-50"
                aria-label="Toggle Sidebar Menu"
            >
                {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Drawer Backdrop Overlay */}
            {isOpenMobile && (
                <div
                    onClick={() => setIsOpenMobile(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                />
            )}

            {/* Sidebar Wrapper */}
            <aside
                className={cn(
                    // Base styles
                    "relative bg-white border-r border-slate-200/80 p-4 font-sans flex flex-col justify-between select-none transition-all duration-300 ease-in-out z-40",

                    // Desktop styles (sticky, collapse controls width)
                    "hidden md:flex md:sticky md:top-0 md:h-screen",
                    isCollapsed ? "md:w-20" : "md:w-60",

                    // Mobile styles (drawer absolute slide-in)
                    "max-md:fixed max-md:top-0 max-md:bottom-0 max-md:left-0 max-md:h-screen max-md:w-64",
                    isOpenMobile ? "max-md:translate-x-0" : "max-md:-translate-x-full",

                    customStyles.container
                )}
            >

                <div className="flex flex-col gap-6">

                    {/* Brand Header Section */}
                    <div className="flex items-center justify-center gap-6">
                        <Link href="/redirect" className={cn(
                            "flex items-center gap-2 transition-all duration-300 min-h-[40px] justify-center",
                            isCollapsed ? "" : "ml-2"
                        )}>

                            {isCollapsed ?
                                <div className={`shrink-0 flex items-center justify-center h-10`}>
                                    <div className="h-7">
                                        {brandLogo}
                                    </div>
                                </div>
                                :
                                <div className={`shrink-0 flex items-center justify-center h-10`}>
                                    {brandFullLogo}
                                </div>
                            }
                        </Link>

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={cn(
                                "hidden md:flex z-50 items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs text-slate-400 hover:text-slate-700 transition-transform duration-200 hover:scale-110 cursor-pointer",
                                isCollapsed ? "absolute top-6 left-20 -translate-x-1/2" : ""
                            )}
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                        </button>
                    </div>

                    {/* Navigation Links Area */}
                    <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-none pr-0.5">
                        {resolvedNavigationItems?.map((item) => {
                            const isActive = item.href === pathname;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsOpenMobile(false)} // Auto close drawer on click (mobile)
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-100 relative group cursor-pointer",
                                        isActive
                                            ? (customStyles.navItemActive ?? "bg-[#E5F2FF] text-[#0055B2] font-semibold shadow-xs")
                                            : (customStyles.navItemIdle ?? "text-slate-600 hover:bg-slate-50 hover:text-slate-900"),
                                        isCollapsed ? "justify-center px-0" : ""
                                    )}
                                    title={isCollapsed ? `${item.label} / ${item.labelTh}` : undefined}
                                >
                                    {/* Left Active Glow Indicator */}
                                    {/* {isActive && !isCollapsed && (
                                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-r-md" />
                                    )} */}

                                    <div className="relative flex items-center justify-center shrink-0">
                                        <Icon className="w-5 h-5" />

                                        {/* Tiny Collapsed Notification Badge */}
                                        {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                                            <span className={cn(
                                                "absolute -top-1 -right-1 flex h-2 w-2 rounded-full ring-2 ring-white",
                                                isActive ? (customStyles.badgeActive ?? "bg-[#0055B2]") : "bg-red-500"
                                            )} />
                                        )}
                                    </div>

                                    {/* Label and Badge (Expanded Mode) */}
                                    {!isCollapsed && (
                                        <>
                                            <div className="flex flex-col min-w-0 leading-tight">
                                                <span className="text-sm truncate select-none">{item.label}</span>
                                            </div>
                                            {item.badge !== undefined && item.badge > 0 && (
                                                <span className={cn(
                                                    "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ring-1 ring-white/10 transition-colors duration-200",
                                                    isActive ? (customStyles.badgeActive ?? "bg-[#0055B2] text-white") : "bg-slate-100 text-slate-600"
                                                )}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer Section: Settings, Information, Logout (fixed, single-language) */}
                {/* <div className={cn(
                    "flex flex-col gap-1.5 min-w-0 transition-all duration-300",
                    isCollapsed ? "items-center" : ""
                )}>

                    <div className="mb-12">
                        <button
                            onClick={() => console.log("Settings clicked")}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 shrink-0 cursor-pointer",
                                isCollapsed ? "w-9 h-9 justify-center" : ""
                            )}
                            title="ตั้งค่า"
                            aria-label="Settings"
                        >
                            <Settings className="w-5 h-5" />
                            {!isCollapsed && <p>ตั้งค่า</p>}
                        </button>

                        <button
                            onClick={() => console.log("Information clicked")}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 shrink-0 cursor-pointer",
                                isCollapsed ? "w-9 h-9 justify-center" : ""
                            )}
                            title="ข้อมูล"
                            aria-label="Information"
                        >
                            <Info className="w-5 h-5" />
                            {!isCollapsed && <p>ข้อมูล</p>}
                        </button>

                        <button
                            onClick={onLogout}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 shrink-0 cursor-pointer",
                                isCollapsed ? "w-9 h-9 justify-center" : ""
                            )}
                            title="ออกจากระบบ"
                            aria-label="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                            {!isCollapsed && <p>ออกจากระบบ</p>}
                        </button>
                    </div>
                </div> */}
            </aside>
        </>
    );
};


export default SideBar;