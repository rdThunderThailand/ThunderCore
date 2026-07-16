import { Asset, CreateAssetInput, DeviceCredentials, DEVICE_TYPES, TenantQuota } from '@/types/assets'
import { AlertTriangle, CheckCircle, Loader2, MapPin, Plus, Shield, Tag, X } from 'lucide-react'
import { useState } from 'react'
import { createAsset } from '../actions'
import { CredentialDisplay } from './credential-display'
import { FormField, ModalOverlay, SectionLabel } from './shared'

export function RegisterModal({ tenantId, quota, onClose, onSuccess }: {
    tenantId: string; quota: TenantQuota; onClose: () => void; onSuccess: () => void
}) {
    const [formData, setFormData] = useState<CreateAssetInput>({
        device_name: '', device_type: 'Sensor', serial_number: '', mac_address: '', model: '', site: '', zone: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<{ asset: Asset; credentials: DeviceCredentials } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await createAsset(tenantId, formData)
            setResult(res)
            onSuccess()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            alert(error.message || 'Failed to register device')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Show credentials after successful registration
    if (result) {
        return (
            <ModalOverlay onClose={onClose}>
                <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Device Registered!</h2>
                        <p className="text-sm font-bold text-slate-400 mt-2">Save these credentials for device provisioning.</p>
                    </div>
                    <CredentialDisplay credentials={result.credentials} />
                    <button
                        onClick={onClose}
                        className="w-full mt-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all"
                    >
                        Done
                    </button>
                </div>
            </ModalOverlay>
        )
    }

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Register Device</h2>
                        {quota.remaining <= 10 && (
                            <p className={`text-xs font-bold mt-1 ${quota.remaining <= 3 ? 'text-red-500' : 'text-amber-500'}`}>
                                <AlertTriangle className="w-3 h-3 inline mr-1" />
                                {quota.remaining} quota slots remaining
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Section: Identifiers */}
                    <SectionLabel icon={<Shield className="w-4 h-4" />} label="Device Identifiers" />
                    <FormField label="Device Name" required>
                        <input required type="text" placeholder="e.g. Temperature Sensor A1"
                            value={formData.device_name} onChange={e => setFormData({ ...formData, device_name: e.target.value })}
                            className="form-input" />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Serial Number">
                            <input type="text" placeholder="e.g. SN-ABC-12345"
                                value={formData.serial_number || ''} onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                                className="form-input" />
                        </FormField>
                        <FormField label="MAC Address">
                            <input type="text" placeholder="e.g. AA:BB:CC:DD:EE:FF"
                                value={formData.mac_address || ''} onChange={e => setFormData({ ...formData, mac_address: e.target.value })}
                                className="form-input" />
                        </FormField>
                    </div>
                    <FormField label="Model">
                        <input type="text" placeholder="e.g. ESP32-S3, Raspberry Pi 4"
                            value={formData.model || ''} onChange={e => setFormData({ ...formData, model: e.target.value })}
                            className="form-input" />
                    </FormField>

                    {/* Section: Metadata */}
                    <SectionLabel icon={<Tag className="w-4 h-4" />} label="Device Metadata" />
                    <FormField label="Device Type" required>
                        <select required value={formData.device_type} onChange={e => setFormData({ ...formData, device_type: e.target.value })}
                            className="form-input appearance-none">
                            {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </FormField>

                    {/* Section: Location */}
                    <SectionLabel icon={<MapPin className="w-4 h-4" />} label="Location Mapping" />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Site">
                            <input type="text" placeholder="e.g. Building A"
                                value={formData.site || ''} onChange={e => setFormData({ ...formData, site: e.target.value })}
                                className="form-input" />
                        </FormField>
                        <FormField label="Zone">
                            <input type="text" placeholder="e.g. Floor 3, Room 301"
                                value={formData.zone || ''} onChange={e => setFormData({ ...formData, zone: e.target.value })}
                                className="form-input" />
                        </FormField>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || quota.remaining <= 0}
                        className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 disabled:opacity-50 mt-4"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Register Device
                    </button>
                </form>
            </div>
        </ModalOverlay>
    )
}
