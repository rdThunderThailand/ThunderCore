'use client'

interface StorageProgressBarProps {
    usedStorage: number // in MB
    maxStorage: number // in MB
}

export function StorageProgressBar({ usedStorage, maxStorage }: StorageProgressBarProps) {
    const usedGB = (usedStorage / 1024).toFixed(1)
    const maxGB = (maxStorage / 1024).toFixed(1)
    const percentage = Math.min(100, Math.max(0, (usedStorage / maxStorage) * 100))

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-black text-slate-800">{usedGB} GB</span>
                <span className="text-xs font-bold text-slate-500">{maxGB} GB</span>
            </div>
            <div className="w-full h-3 bg-[#EAEAF0] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#7C3AED] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
