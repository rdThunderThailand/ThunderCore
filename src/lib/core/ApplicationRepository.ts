import { Application, CreateApplicationDTO, UpdateApplicationDTO } from '@/models/Application'
import { BaseRepository } from './BaseRepository'

export class ApplicationRepository extends BaseRepository {
    async getByTenantId(tenantId: string, status?: 'active') {
        let query = this.supabase
            .from('applications')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query
        if (error) throw error
        return data as Application[]
    }

    async getByIds(ids: string[], status?: 'active') {
        let query = this.supabase
            .from('applications')
            .select('*')
            .in('id', ids)
            .order('created_at', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query
        if (error) throw error
        return data as Application[]
    }

    async create(data: CreateApplicationDTO): Promise<Application> {
        const { data: application, error } = await this.supabase
            .from('applications')
            .insert({
                name: data.name,
                description: data.description || null,
                tenant_id: data.tenantId,
                status: 'active',
                environment: data.environment,
                url: data.url || null
            })
            .select()
            .single()

        if (error) throw error
        return application as Application
    }

    async update(id: string, data: UpdateApplicationDTO): Promise<Application> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = { updated_at: new Date().toISOString() }
        if (data.name !== undefined) updateData.name = data.name
        if (data.description !== undefined) updateData.description = data.description
        if (data.status !== undefined) updateData.status = data.status
        if (data.environment !== undefined) updateData.environment = data.environment
        if (data.url !== undefined) updateData.url = data.url

        const { data: application, error } = await this.supabase
            .from('applications')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return application as Application
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('applications')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    async getById(id: string): Promise<Application | null> {
        const { data, error } = await this.supabase
            .from('applications')
            .select('*')
            .eq('id', id)
            .single()

        if (error) return null
        return data as Application
    }
}
