'use client'

import { Modal } from '@/components/ui'
import { useTranslation } from '@/i18n/context'
import { LayoutGrid, Loader2, Plus, X } from 'lucide-react'
import React, { memo } from 'react'

interface CreateApplicationModalProps {
    isOpen: boolean
    onClose: () => void
    // tenantId is null for a system app (no owner), or a tenant id to bind ownership.
    onSubmit: (name: string, tenantId: string | null) => Promise<void>
    isSubmitting: boolean
    tenants?: Array<{ id: string; name: string }>
}

function CreateApplicationModalComponent({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    tenants = []
}: CreateApplicationModalProps) {
    const [name, setName] = React.useState('')
    const [tenantId, setTenantId] = React.useState('')
    const { t } = useTranslation()

    const handleSubmit = async () => {
        if (!name.trim()) return
        await onSubmit(name.trim(), tenantId || null)
        setName('')
        setTenantId('')
    }

    const handleClose = () => {
        setName('')
        setTenantId('')
        onClose()
    }

    const footer = (
        <>
            <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-white border border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all text-sm"
            >
                <div className="flex items-center justify-center gap-2">
                    <div className="rounded-full border border-blue-600 p-0.5">
                        <X className="w-3 h-3" />
                    </div>
                    {t('common.cancel')}
                </div>
            </button>
            <button
                onClick={handleSubmit}
                disabled={isSubmitting || !name.trim()}
                className="flex-1 py-3 px-4 bg-[#0F53FF] text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        <Plus className="w-4 h-4" />
                        {t('app.createApp')}
                    </>
                )}
            </button>
        </>
    )

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={t('app.createApp')}
            titleIcon={<LayoutGrid className="w-5 h-5 text-blue-600" />}
            size="lg"
            footer={footer}
        >
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t('app.appName')}
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm placeholder:text-slate-400 font-medium"
                    placeholder={t('app.enterAppName')}
                    autoFocus
                />

                <label className="block text-sm font-semibold text-slate-700 mb-2 mt-5">
                    Owner Tenant
                </label>
                <select
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                >
                    <option value="">System App (no tenant)</option>
                    {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                    ))}
                </select>
            </div>
        </Modal>
    )
}

export const CreateApplicationModal = memo(CreateApplicationModalComponent)
