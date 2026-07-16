'use client'

import { usePathname } from "next/navigation"
import { Building2, ChevronDown, Search, Bell, MessageSquare, HelpCircle } from "lucide-react"

function Navbar() {
    const pathname = usePathname()

    if (pathname.endsWith('/assets')) {
        return null;
    }

    return (
        <nav className="max-lg:hidden lg:block sticky top-0 z-40 w-full h-[72px] bg-white border-b border-slate-200 shadow-sm">
            <div className="w-full px-8 h-full flex items-center justify-between gap-6">

                {/* Left: Organization / Location Selector */}
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-[14px] font-bold text-slate-800">เทศบาลเมืองแสนสุข</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>

                {/* Center: Search Bar */}
                <div className="flex-1 max-w-[600px]">
                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="ค้นหา asset, สถานที่, เลขที่ใบงาน, ผู้แจ้ง..."
                            className="w-full h-11 pl-11 pr-4 bg-slate-100 hover:bg-slate-200/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border border-transparent rounded-full text-[13px] font-medium text-slate-700 placeholder:text-slate-400 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-5">

                    {/* Icons */}
                    <div className="flex items-center gap-2">
                        <button className="relative w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-[1.5px] border-white">
                                12
                            </span>
                        </button>
                        <button className="relative w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <MessageSquare className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-[1.5px] border-white">
                                6
                            </span>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <HelpCircle className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="w-[1px] h-8 bg-slate-200"></div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-200">
                        <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-200 shrink-0">
                            <img src="https://ui-avatars.com/api/?name=สมชาย+ช่างเทคนิค&background=0D8ABC&color=fff" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-slate-800 leading-tight">สมชาย ช่างเทคนิค</span>
                            <span className="text-[11px] font-medium text-slate-500">เจ้าหน้าที่ช่าง</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                    </div>

                </div>
            </div>
        </nav>
    )
}

export default Navbar