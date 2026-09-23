"use client";

import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/utils/cn";
import logo from "../../../../public/logo.png";
import { knowledgebaseNavSections } from "./knowledgebase-nav";

// ---- Types ----

export interface KnowledgebaseNavItem {
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    badge?: number;
    // Purely a visual affordance for collections with sub-content on their own
    // page — not a client-side accordion, so it doesn't need child item data.
    chevron?: boolean;
}

export interface KnowledgebaseNavSection {
    title?: string;
    items: KnowledgebaseNavItem[];
}

export interface KnowledgebaseSidebarProps {
    brandLogo?: ReactNode;
    sections?: KnowledgebaseNavSection[];
    footer?: ReactNode;
}

// ---- Helpers ----

// Exact match for the collection root (every knowledgebase route is a prefix
// of it otherwise), prefix match for everything else so nested routes added
// later under a collection highlight the right item with no Sidebar changes.
function isNavItemActive(pathname: string, href: string): boolean {
    if (href === "/knowledgebase") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
}

// ---- Default footer (quote + copyright) ----

const DefaultSidebarFooter = () => (
    <div className="flex flex-col gap-3">
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3.5">
            <p className="text-xs text-slate-300 leading-relaxed">
                &ldquo;ความรู้คือทรัพย์สินที่เพิ่มมูลค่าเมื่อเราแบ่งปันและนำไปใช้ในระบบ&rdquo;
            </p>
            <p className="mt-2 text-[11px] text-slate-500">— Thunder Principle</p>
        </div>
        <p className="text-center text-[10px] text-slate-600">
            © {new Date().getFullYear()} Thunder Group. All rights reserved.
        </p>
    </div>
);

export const Sidebar = ({
    brandLogo = <Image src={logo} alt="thunder-logo" className="w-full h-full object-contain" />,
    sections = knowledgebaseNavSections,
    footer = <DefaultSidebarFooter />,
}: KnowledgebaseSidebarProps) => {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isOpenMobile, setIsOpenMobile] = useState(false);

    return (
        <>
            {/* Mobile-only hamburger button that toggles the off-canvas sidebar */}
            <button
                onClick={() => setIsOpenMobile(!isOpenMobile)}
                className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-sm text-slate-300 hover:text-white focus:outline-none transition-all duration-200 hover:bg-slate-800"
                aria-label="Toggle Sidebar Menu"
            >
                {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile-only dim backdrop shown while the sidebar is open, tap to close */}
            {isOpenMobile && (
                <div
                    onClick={() => setIsOpenMobile(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                />
            )}

            {/* Sidebar shell: sticky on desktop (collapsible width), off-canvas drawer on mobile */}
            <aside
                className={cn(
                    "relative bg-slate-900 border-r border-slate-800 p-4 font-sans flex flex-col justify-between select-none transition-all duration-300 ease-in-out z-40",
                    "flex md:sticky md:top-0 md:h-screen",
                    isCollapsed ? "md:w-20" : "md:w-64",
                    "max-md:fixed max-md:top-0 max-md:bottom-0 max-md:left-0 max-md:h-screen max-md:w-64",
                    isOpenMobile ? "max-md:translate-x-0" : "max-md:-translate-x-full"
                )}
            >
                <div className="flex flex-col gap-6 min-h-0">
                    {/* Brand logo (links home) + desktop collapse/expand toggle */}
                    <div className="flex items-center justify-center gap-6">
                        <Link
                            href="/knowledgebase"
                            className={cn(
                                "flex items-center gap-2 transition-all duration-300 min-h-[40px] justify-center",
                                isCollapsed ? "" : "ml-2"
                            )}
                        >
                            <div className="shrink-0 flex items-center justify-center h-8 w-8">{brandLogo}</div>
                            {!isCollapsed && (
                                <span className="text-white font-bold tracking-wide text-sm">THUNDER</span>
                            )}
                        </Link>

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={cn(
                                "hidden md:flex z-50 items-center justify-center w-6 h-6 rounded-full bg-slate-800 border border-slate-700 shadow-xs text-slate-400 hover:text-white transition-transform duration-200 hover:scale-110 cursor-pointer",
                                isCollapsed ? "absolute top-6 left-20 -translate-x-1/2" : ""
                            )}
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                        </button>
                    </div>

                    {/* Nav sections (from `sections` prop, defaults to knowledgebaseNavSections) */}
                    <nav className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-none pr-0.5">
                        {sections.length === 0 && !isCollapsed && (
                            <p className="px-3 text-xs text-slate-500">No collections configured yet.</p>
                        )}

                        {sections.map((section, sectionIndex) => (
                            <div key={section.title ?? sectionIndex} className="flex flex-col gap-1">
                                {/* Section title label (hidden when collapsed) */}
                                {section.title && !isCollapsed && (
                                    <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        {section.title}
                                    </p>
                                )}
                                {/* Nav items within the section: icon + label + optional badge/chevron */}
                                {section.items.map((item) => {
                                    const isActive = isNavItemActive(pathname, item.href);
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpenMobile(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-100 relative group cursor-pointer",
                                                isActive
                                                    ? "bg-blue-600/15 text-blue-300 font-semibold"
                                                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
                                                isCollapsed ? "justify-center px-0" : ""
                                            )}
                                            title={isCollapsed ? item.label : undefined}
                                        >
                                            <div className="relative flex items-center justify-center shrink-0">
                                                <Icon className="w-5 h-5" />
                                                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                                                    <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full ring-2 ring-slate-900 bg-red-500" />
                                                )}
                                            </div>
                                            {!isCollapsed && (
                                                <>
                                                    <span className="text-sm truncate select-none min-w-0">{item.label}</span>
                                                    {item.badge !== undefined && item.badge > 0 && (
                                                        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold bg-slate-800 text-slate-300">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {item.chevron && (
                                                        <ChevronRight
                                                            className={cn(
                                                                "w-4 h-4 shrink-0",
                                                                item.badge === undefined && "ml-auto",
                                                                isActive ? "text-blue-300" : "text-slate-500"
                                                            )}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Footer slot (from `footer` prop, defaults to DefaultSidebarFooter), hidden when collapsed */}
                {!isCollapsed && footer && <div className="shrink-0">{footer}</div>}
            </aside>
        </>
    );
};

export default Sidebar;
