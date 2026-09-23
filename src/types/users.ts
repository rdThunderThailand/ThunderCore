import { Profile } from './dashboard'

export interface UsersClientProps {
    initialProfiles: Profile[]
    totalCount: number
    currentUserId: string | null
}

export interface UsersTableProps {
    profiles: Profile[]
    currentUserId: string | null
    sortConfig: { key: keyof Profile, direction: 'asc' | 'desc' } | null
    onSort: (key: keyof Profile) => void
    onProfileUpdate: (id: string, updates: Partial<Profile>) => void
}

export interface UserRowProps {
    profile: Profile
    isSelf: boolean
    onProfileUpdate: (id: string, updates: Partial<Profile>) => void
    onDelete: (id: string) => void
}

export interface SearchInputProps {
    value: string
    onChange: (value: string) => void
}

// export interface UserProfile {
//     id: string
//     email: string
//     first_name: string
//     last_name: string
//     avatar_url?: string
// }
