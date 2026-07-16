// Tier = roles.role_type (shared across tenants). Persona (operator_technician, …) lives in roles.code, not here.
export type UserRole = 'super_admin' | 'company_admin' | 'executive_viewer' | 'operator' | 'viewer_auditor';

export type UserPermissions = {
    can_invite: boolean;
    can_create_app: boolean;
    can_view_logs: boolean;
};

export type LoginFormData = {
    email: string;
    password: string;
}

export type RegisterFormData = {
    email: string;
    password: string;
    confirmPassword: string;
    consentTerms: boolean;
    consentMarketing: boolean;
}
