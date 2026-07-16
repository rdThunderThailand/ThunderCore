"use client"

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, Settings, Info, LogOut, Languages, ChevronLeft } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { cn } from "../../utils/cn";
import { mockUser, type UserProfile } from '@/store/useAuthStore';
import { superAdminNavigationItems } from "./sidebar-nav";

// Helper function to derive cleaner page titles from pathnames
function getPageTitle(pathname: string, sectionLabel: string): string {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) {
        return sectionLabel;
    }

    if (pathname.includes("/tenants/management/")) {
        const mgmtIndex = segments.indexOf("management");
        if (mgmtIndex !== -1 && segments.length > mgmtIndex + 1) {

            const subActionIndex = mgmtIndex + 2;
            if (segments.length <= subActionIndex) {
                return "Tenant Overview";
            }

            const action = segments[subActionIndex];
            if (action === "settings") {
                return "Tenant Settings";
            }
            if (action === "assets") {
                return "Tenant Assets";
            }
            if (action === "members") {
                // Check if it goes deeper, e.g., /members/[memberId]/settings
                if (segments.length > subActionIndex + 2 && segments[subActionIndex + 2] === "settings") {
                    return "Member Settings";
                }
                return "Tenant Members";
            }
            if (action === "applications") {
                return "Tenant Applications";
            }
        }
    }


    if (pathname.includes("/applications/management/")) {
        const mgmtIndex = segments.indexOf("management");
        if (mgmtIndex !== -1 && segments.length > mgmtIndex + 1) {
            const subActionIndex = mgmtIndex + 2;
            if (segments.length <= subActionIndex) {
                return "Application Overview";
            }
            const action = segments[subActionIndex];
            if (action === "settings") {
                return "Application Settings";
            }
        }
    }

    const lastSegment = segments[segments.length - 1];

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isId = uuidRegex.test(lastSegment) || !isNaN(Number(lastSegment));

    if (isId) {
        return `${sectionLabel} Detail`;
    }

    return lastSegment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export interface HeaderProps {
    navigationText?: string;
    user?: UserProfile;
}

export const Header = ({
    navigationText,
    user,
}: HeaderProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const { locale, setLocale, t } = useTranslation();
    const defaultUser = user ?? mockUser;

    const toggleLanguage = () => setLocale(locale === 'en' ? 'th' : 'en');

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const allNavItems = superAdminNavigationItems;

    const topLevelItem = allNavItems.find((item) =>
        pathname === item.href || pathname.startsWith(item.href + "/")
    );

    const isTopLevel = topLevelItem ? pathname === topLevelItem.href : false;

    const sectionLabel = topLevelItem?.label ?? "";
    const SectionIcon = topLevelItem?.icon ?? null;

    const derivedPageTitle = navigationText || getPageTitle(pathname, sectionLabel);

    return (
        <div className="w-full min-h-[8vh] px-6 pt-5 pb-2 flex items-center justify-between gap-3 z-3">
            <div className="flex flex-col justify-center min-w-0">
                {/* Upper: breadcrumb path (section / sub-path) with back link */}
                {sectionLabel && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
                        {isTopLevel ? (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                {SectionIcon && <SectionIcon className="w-3.5 h-3.5 shrink-0" />}
                                <span>{sectionLabel}</span>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href={topLevelItem?.href || "/"}
                                    className="hover:underline flex items-center gap-1 font-semibold text-blue-600"
                                >
                                    <ChevronLeft className="w-4 h-4 text-blue-600" />
                                    Back to {sectionLabel}
                                </Link>
                                <span className="text-slate-300">/</span>
                                <span className="text-slate-500 font-medium">{derivedPageTitle}</span>
                            </>
                        )}
                    </div>
                )}
                {/* Lower: current page name */}
                <h3 className="text-[22px] font-bold text-indigo-950 leading-tight truncate tracking-wide flex items-center gap-2">
                    {derivedPageTitle}
                </h3>
            </div>

            <div className="flex items-center gap-3 md:gap-6 shrink-0">
                <Bell className="w-6 h-6" />

                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    title={t('header.switchLanguage')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 cursor-pointer border border-slate-200"
                >
                    <Languages className="h-4 w-4" />
                    {locale === 'en' ? 'EN' : 'TH'}
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen((prev) => !prev)}
                        className="flex gap-3 items-center cursor-pointer"
                    >
                        <img
                            src={defaultUser.avatar_url}
                            alt="userprofile"
                            className="w-11 h-11 rounded-full object-cover shrink-0 bg-gray-200"
                        />
                        <div className="text-left leading-tight">
                            <p className="text-sm font-bold">{defaultUser.name}</p>
                            <p className="text-[11px] text-slate-400">{defaultUser.role}</p>
                        </div>
                        <ChevronDown className={cn(
                            "w-4 h-4 text-slate-400 transition-transform duration-200",
                            isProfileOpen ? "rotate-180" : ""
                        )} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                            {/* Company Info */}
                            {/* <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-100">
                                <img
                                    src={defaultUser.companyLogo}
                                    alt="companyImg"
                                    className="w-9 h-9 rounded-full object-cover shrink-0 bg-gray-200"
                                />
                                <p className="text-sm font-semibold text-slate-800 truncate">{defaultUser.companyName}</p>
                            </div> */}

                            {/* Other Tabs */}
                            <button
                                onClick={() => console.log("Settings clicked")}
                                className="flex items-center gap-3 px-3 py-2 w-full text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 cursor-pointer"
                            >
                                <Settings className="w-4 h-4" />
                                <span>ตั้งค่า</span>
                            </button>

                            <button
                                onClick={() => console.log("Information clicked")}
                                className="flex items-center gap-3 px-3 py-2 w-full text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 cursor-pointer"
                            >
                                <Info className="w-4 h-4" />
                                <span>ข้อมูล</span>
                            </button>

                            <button
                                onClick={() => console.log("Logout clicked")}
                                className="flex items-center gap-3 px-3 py-2 w-full text-sm text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>ออกจากระบบ</span>
                            </button>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};

export default Header;
