'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function PasswordField({ error }: { error?: string }) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" className="text-slate-700 text-sm font-bold">Password</label>
            </div>
            <div className="relative">
                <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    className={`w-full h-10 px-4 bg-white border rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium ${error ? 'border-red-500' : 'border-slate-200'}`}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
        </div>
    )
}
