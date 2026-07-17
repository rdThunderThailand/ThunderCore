'use server'

import { revalidatePath } from 'next/cache'
import * as assets from '@/lib/assets'
import { UpdateDeviceInput } from '@/lib/assets'

// Server Action boundary for the device configuration surface — delegates to the src/lib seam.

export async function getDeviceById(tenantId: string, deviceId: string) {
    return assets.getDeviceById(tenantId, deviceId)
}

export async function updateDevice(tenantId: string, deviceId: string, data: UpdateDeviceInput) {
    const result = await assets.updateDevice(tenantId, deviceId, data)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)
    return result
}
