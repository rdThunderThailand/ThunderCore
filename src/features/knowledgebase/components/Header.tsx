"use client";

import { useState } from "react";
import { Search, Home, Star, Bell, HelpCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import { mockUser, useAuthStore, type UserProfile } from "@/store/useAuthStore";

// ---- Types ----

export interface KnowledgebaseHeaderProps {
    user?: UserProfile;
    notificationCount?: number;
    // Not wired to a search backend yet — the shell only reports the query upward.
    onSearch?: (query: string) => void;
}

// ---- Static config: right-side utility buttons (Home / Favorites) ----

const UTILITY_ITEMS = [
    { label: "Home", icon: Home },
    { label: "Favorites", icon: Star },
] as const;

export const Header = ({ user, notificationCount = 0, onSearch }: KnowledgebaseHeaderProps) => {
    const storeUser = useAuthStore((s) => s.user);
    const defaultUser = user ?? storeUser ?? mockUser;
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(query);
    };

    return (
        <div className="w-full min-h-[8vh] pl-16 pr-4 py-4 md:px-6 flex items-center justify-between gap-3 md:gap-4 bg-white border-b border-slate-200">
            {/* Search bar (query state is local; submission bubbles up via onSearch) */}
            <form onSubmit={handleSubmit} className="flex-1 min-w-0 max-w-xl">
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-300 focus-within:bg-white transition-colors">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search books, papers, standards, manuals, playbooks..."
                        className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                    <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 text-[10px] text-slate-400 shrink-0">
                        ⌘K
                    </kbd>
                </div>
            </form>

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
                {/* Desktop-only utility buttons: Home, Favorites, Help */}
                <div className="hidden md:flex items-center gap-1 md:gap-2">
                    {UTILITY_ITEMS.map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            type="button"
                            title={label}
                            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                            <Icon className="w-5 h-5" />
                            <span className="hidden lg:block text-[10px] font-medium">{label}</span>
                        </button>
                    ))}

                    <button
                        type="button"
                        title="Help"
                        className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                        <HelpCircle className="w-5 h-5" />
                        <span className="hidden lg:block text-[10px] font-medium">Help</span>
                    </button>
                </div>

                {/* Notification bell with unread-count badge */}
                <button
                    type="button"
                    title="Updates"
                    className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                    <span className="relative">
                        <Bell className="w-5 h-5" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold bg-red-500 text-white">
                                {notificationCount}
                            </span>
                        )}
                    </span>
                    <span className="hidden lg:block text-[10px] font-medium">Updates</span>
                </button>

                {/* Current user avatar + name/role (falls back to store user, then mockUser) */}
                <div className={cn("flex items-center gap-2.5 pl-2 md:pl-3 ml-1 border-l border-slate-200")}>
                    <img
                        src={defaultUser?.avatar_url || "https://i.pinimg.com/originals/75/ae/6e/75ae6eeeeb590c066ec53b277b614ce3.jpg"}
                        alt="user-profile"
                        className="w-9 h-9 rounded-full object-cover shrink-0 bg-gray-200 border border-slate-200"
                    />
                    <div className="hidden sm:block text-left leading-tight">
                        <p className="text-sm font-bold text-slate-800">{defaultUser.name}</p>
                        <p className="text-[11px] text-slate-400">{defaultUser.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
