"use client"

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, Settings, Info, LogOut, Languages, ChevronLeft } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { cn } from "../../utils/cn";
import { mockUser, useAuthStore, type UserProfile } from '@/store/useAuthStore';
import { superAdminNavigationItems, getCompanyAdminNavigationItems } from "./sidebar-nav";
import { logout } from "@/features/auth/actions";

function getPageTitle(pathname: string, sectionLabel: string): string {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) {
        return sectionLabel;
    }

    const lastSegment = segments[segments.length - 1];

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isId = uuidRegex.test(lastSegment) || !isNaN(Number(lastSegment));

    if (isId) {
        return `${sectionLabel} Detail`;
    }

    return lastSegment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

interface Crumb {
    label: string;
    href: string;
}

const COMPANY_ADMIN_SECTION_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    assets: "Assets",
    applications: "Applications",
    members: "Members",
    settings: "Settings",
};

function getCompanyAdminBreadcrumbs(pathname: string): Crumb[] {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const segments = pathname.split("/").filter(Boolean);
    const [tenantId, section, ...rest] = segments;
    if (!uuidRegex.test(tenantId ?? "") || !section || !(section in COMPANY_ADMIN_SECTION_LABELS)) return [];

    const base = `/${tenantId}`;
    const crumbs: Crumb[] = [{ label: COMPANY_ADMIN_SECTION_LABELS[section], href: `${base}/${section}` }];

    if (section === "members" && rest[0] && rest[1] === "settings") {
        crumbs.push({ label: "Member Settings", href: pathname });
    }

    if (section === "applications" && rest[0]) {
        const appBase = `${base}/applications/${rest[0]}`;
        if (!rest[1]) {
            crumbs.push({ label: "Application Dashboard", href: appBase });
        } else if (rest[1] === "settings") {
            crumbs.push({ label: "Application Settings", href: pathname });
        } else if (rest[1] === "portal") {
            crumbs.push({ label: "Portal", href: `${appBase}/portal` });
            if (rest[2] === "customization") crumbs.push({ label: "Customization", href: pathname });
            else if (rest[2] === "domains") crumbs.push({ label: "Domains", href: pathname });
        } else if (rest[1] === "members") {
            crumbs.push({ label: "Members", href: pathname });
        }
    }

    return crumbs;
}

function getManagementBreadcrumbs(pathname: string, isSuperAdmin: boolean): Crumb[] {
    const segments = pathname.split("/").filter(Boolean);

    const tenantMatch = pathname.match(/^\/tenants\/management\/([^/]+)/);
    if (tenantMatch) {
        const base = `/tenants/management/${tenantMatch[1]}`;
        const rest = segments.slice(3);
        const crumbs: Crumb[] = [];
        if (isSuperAdmin) crumbs.push({ label: "Tenants", href: "/tenants" });

        if (rest.length === 0) {
            crumbs.push({ label: "Tenant Dashboard", href: base });
            return crumbs;
        }

        if (rest[0] === "assets") {
            crumbs.push({ label: "Tenant Assets", href: `${base}/assets` });
            if (rest[1]) {
                crumbs.push({ label: "Asset Detail", href: `${base}/assets/${rest[1]}` });
                if (rest[2] === "settings") crumbs.push({ label: "Asset Settings", href: pathname });
                else if (rest[2] === "devices" && rest[3]) crumbs.push({ label: "Device Detail", href: pathname });
            }
        } else if (rest[0] === "applications") {
            crumbs.push({ label: "Tenant Applications", href: `${base}/applications` });
        } else if (rest[0] === "members") {
            crumbs.push({ label: "Tenant Members", href: `${base}/members` });
            if (rest[1] && rest[2] === "settings") crumbs.push({ label: "Member Settings", href: pathname });
        } else if (rest[0] === "settings") {
            crumbs.push({ label: "Tenant Settings", href: pathname });
        }
        return crumbs;
    }

    const appMatch = pathname.match(/^\/applications\/([^/]+)/);
    if (appMatch) {
        const base = `/applications/${appMatch[1]}`;
        const rest = segments.slice(2);
        const crumbs: Crumb[] = [];
        if (isSuperAdmin) crumbs.push({ label: "Applications", href: "/applications" });

        // if (rest.length === 0) {
        //     crumbs.push({ label: "Application Dashboard", href: base });
        //     return crumbs;
        // }

        if (rest[0] === "settings") {
            crumbs.push({ label: "Application Settings", href: pathname });
        }
        // if (rest[0] === "scenario") {
        //     crumbs.push({ label: "Scenario", href: pathname });
        // } else if (rest[0] === "portal") {
        //     crumbs.push({ label: "Portal", href: `${base}/portal` });
        //     if (rest[1] === "customization") crumbs.push({ label: "Customization", href: pathname });
        //     else if (rest[1] === "domains") crumbs.push({ label: "Domains", href: pathname });
        // } else if (rest[0] === "members") {
        //     crumbs.push({ label: "Members", href: pathname });
        // } else if (rest[0] === "settings") {
        //     crumbs.push({ label: "Settings", href: pathname });
        // }
        return crumbs;
    }

    const userMatch = pathname.match(/^\/users\/([^/]+)/);
    if (userMatch) {
        const base = `/users/${userMatch[1]}`;
        const rest = segments.slice(2);
        const crumbs: Crumb[] = [];
        if (isSuperAdmin) crumbs.push({ label: "Users", href: "/users" });

        if (rest[0] === "settings") {
            crumbs.push({ label: "User Settings", href: pathname });
        }

        return crumbs;
    }

    return [];
}

function getUserSettingsBreadcrumbs(pathname: string, userId: string | null, isSuperAdmin: boolean): Crumb[] {
    if (pathname !== "/settings" || !userId) return [];

    const crumbs: Crumb[] = [];
    if (isSuperAdmin) crumbs.push({ label: "Users", href: "/users" });
    crumbs.push({ label: "User Settings", href: `/settings?user=${userId}` });
    return crumbs;
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
    const searchParams = useSearchParams();
    const router = useRouter();
    const { locale, setLocale, t } = useTranslation();
    const storeUser = useAuthStore((s) => s.user);
    const setStoreUser = useAuthStore((s) => s.setUser);
    const defaultUser = user ?? storeUser ?? mockUser;

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

    useEffect(() => {
        if (user) setStoreUser(user);
    }, [user, setStoreUser]);

    const isSuperAdmin = defaultUser.role === "super_admin";

    const companyTenantId = pathname.match(/^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i)?.[1] ?? "";
    const allNavItems = isSuperAdmin
        ? superAdminNavigationItems
        : companyTenantId
            ? getCompanyAdminNavigationItems(companyTenantId)
            : superAdminNavigationItems;

    const topLevelItem = allNavItems.find((item) =>
        pathname === item.href || pathname.startsWith(item.href + "/")
    );

    const isTopLevel = topLevelItem ? pathname === topLevelItem.href : false;

    const sectionLabel = topLevelItem?.label ?? "";
    const SectionIcon = topLevelItem?.icon ?? null;

    const isManagementPath = /^\/(tenants|applications)\/management\//.test(pathname);
    const managementTrail = getManagementBreadcrumbs(pathname, isSuperAdmin);
    const companyAdminTrail = getCompanyAdminBreadcrumbs(pathname);
    const companyAdminSegments = pathname.split("/").filter(Boolean);
    const isCompanyAdminApplicationDetail = companyAdminTrail.length > 0 && companyAdminSegments[1] === "applications" && !!companyAdminSegments[2];
    const userSettingsTrail = getUserSettingsBreadcrumbs(pathname, searchParams.get("user"), isSuperAdmin);
    const breadcrumbTrail = managementTrail.length > 0
        ? managementTrail
        : companyAdminTrail.length > 0
            ? companyAdminTrail
            : userSettingsTrail;
    const hasBreadcrumbTrail = breadcrumbTrail.length > 0;

    const derivedPageTitle =
        navigationText ||
        (hasBreadcrumbTrail ? breadcrumbTrail[breadcrumbTrail.length - 1].label : getPageTitle(pathname, sectionLabel));

    return (
        <div className="w-full min-h-[8vh] px-6 pt-5 pb-2 flex items-center justify-between gap-3 z-3">
            <div className="flex flex-col justify-center min-w-0">
                {/* Upper: breadcrumb path (section / sub-path) with back link */}
                {((sectionLabel && !isManagementPath) || hasBreadcrumbTrail) && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mb-1 flex-wrap">
                        {hasBreadcrumbTrail ? (
                            breadcrumbTrail.map((crumb, index) => {
                                const isLast = index === breadcrumbTrail.length - 1;
                                return (
                                    <span key={crumb.href} className="flex items-center gap-2">
                                        {index > 0 && <span className="text-slate-300">/</span>}
                                        {index === 0 && !isSuperAdmin && !isCompanyAdminApplicationDetail && SectionIcon && (
                                            <SectionIcon className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                                        )}
                                        {isLast ? (
                                            <span className="text-slate-500 font-medium">{crumb.label}</span>
                                        ) : (
                                            <Link
                                                href={crumb.href}
                                                className="hover:underline flex items-center gap-1 font-semibold text-blue-600"
                                            >
                                                {index === 0 && <ChevronLeft className="w-4 h-4 text-blue-600" />}
                                                {crumb.label}
                                            </Link>
                                        )}
                                    </span>
                                );
                            })
                        ) : isTopLevel ? (
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
                            src={defaultUser?.avatar_url || "https://i.pinimg.com/originals/75/ae/6e/75ae6eeeeb590c066ec53b277b614ce3.jpg"}
                            alt="userprofile"
                            className="w-11 h-11 rounded-full object-cover shrink-0 bg-gray-200 border border-slate-200"
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
                                onClick={logout}
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