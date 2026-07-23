import { LucideIcon } from 'lucide-react';

export type StatItem = {
    name: string;
    value: string;
    icon: LucideIcon;
    change: string;
    changeType: 'positive' | 'negative';
};

export type OrgData = {
    name: string;
    value: number;
    color: string;
};

export type ApplicationData = {
    name: string;
    org: string;
    users: string;
    status: 'Healthy' | 'Warning' | 'Error';
};

export interface Profile {
    id: string
    email: string
    first_name: string
    last_name: string
    // ponytail: not a per-tenant UserRole — GET /users is global; role is resolved across every
    // membership the user holds, so role_code/role_type are null when they hold no role anywhere.
    role_code: string | null
    role_type: string | null
    can_invite: boolean
    can_create_app: boolean
    can_view_logs: boolean
    created_at: string
    is_active: boolean
}

export interface StatsGridProps {
    stats: StatItem[];
}

export interface OrgDashboardData {
    tenant: {
        id: string
        name: string
        type: string
        status: string
    } | null
    stats: {
        memberCount: number
        appCount: number
        recentActivity: number
    }
    members: Array<{
        id: string
        user_id: string
        role: string
        first_name: string
        last_name: string
        email: string
        joined_at: string
    }>
    applications: Array<{
        id: string
        name: string
        status: string
        url?: string
    }>
}
