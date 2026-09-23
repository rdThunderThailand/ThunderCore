import { BulkImportResult } from '@/types/assets'
import { Download, Loader2, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { bulkImportAssets } from '../actions'
import { ModalOverlay } from './shared'

export function BulkImportModal({ tenantId, onClose, onSuccess }: {
    tenantId: string; onClose: () => void; onSuccess: () => void
}) {
    const [csvContent, setCsvContent] = useState('')
    const [isImporting, setIsImporting] = useState(false)
    const [result, setResult] = useState<BulkImportResult | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => setCsvContent(ev.target?.result as string)
        reader.readAsText(file)
    }

    const handleImport = async () => {
        if (!csvContent.trim()) return
        setIsImporting(true)
        try {
            const res = await bulkImportAssets(tenantId, csvContent)
            setResult(res)
            onSuccess()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            alert(error.message || 'Import failed')
        } finally {
            setIsImporting(false)
        }
    }

    const downloadTemplate = () => {
        const template = 'device_name,device_type,serial_number,mac_address,model,site,zone\nTemperature Sensor A1,Sensor,SN-001,,ESP32-S3,Building A,Floor 1\nGateway Main,Gateway,SN-002,AA:BB:CC:DD:EE:FF,Raspberry Pi 4,Building A,Lobby\n'
        const blob = new Blob([template], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'asset_import_template.csv'
        a.click()
    }

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Import Devices</h2>
                        <p className="text-sm font-bold text-slate-400 mt-1">Upload a CSV file to register multiple devices at once.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {result ? (
                    // Results view
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                <p className="text-2xl font-black text-slate-900">{result.total}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-2xl text-center">
                                <p className="text-2xl font-black text-emerald-600">{result.success}</p>
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Success</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-2xl text-center">
                                <p className="text-2xl font-black text-red-600">{result.failed}</p>
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Failed</p>
                            </div>
                        </div>

                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {result.rows.filter((r: any) => r.status === 'error').length > 0 && (
                            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                                <p className="text-sm font-black text-red-700 mb-3">Failed Rows:</p>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {result.rows.filter((r: any) => r.status === 'error').map((r: any) => (
                                    <p key={r.row} className="text-xs font-bold text-red-600 mb-1">
                                        Row {r.row}: {r.device_name || '(empty)'} — {r.message}
                                    </p>
                                ))}
                            </div>
                        )}

                        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all">
                            Done
                        </button>
                    </div>
                ) : (
                    // Upload view
                    <div className="space-y-6">
                        <button onClick={downloadTemplate}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-violet-50 text-violet-600 font-black rounded-2xl hover:bg-violet-100 transition-all border-2 border-violet-100">
                            <Download className="w-5 h-5" /> Download CSV Template
                        </button>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-all"
                        >
                            <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="font-bold text-slate-400 text-sm">Click to upload CSV file</p>
                            <p className="text-xs font-bold text-slate-300 mt-1">or paste CSV content below</p>
                            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                        </div>

                        <textarea
                            value={csvContent}
                            onChange={e => setCsvContent(e.target.value)}
                            placeholder="device_name,device_type,serial_number,mac_address,model,site,zone&#10;Sensor A1,Sensor,SN-001,,ESP32-S3,Building A,Floor 1"
                            rows={6}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-violet-500 focus:bg-white rounded-2xl outline-none transition-all font-mono text-sm resize-none"
                        />

                        {csvContent && (
                            <p className="text-xs font-bold text-slate-400">
                                {csvContent.trim().split('\n').length - 1} data rows detected
                            </p>
                        )}

                        <button
                            onClick={handleImport}
                            disabled={isImporting || !csvContent.trim()}
                            className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 disabled:opacity-50"
                        >
                            {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            Import Devices
                        </button>
                    </div>
                )}
            </div>
        </ModalOverlay>
    )
}
