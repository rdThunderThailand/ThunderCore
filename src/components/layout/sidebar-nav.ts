import { AppWindow, BarChart3, LayoutDashboard, LayoutGrid, MonitorCog, Radar, Settings, SquareKanban, Trash2, UsersRound } from "lucide-react";
import { NavItem } from "./SideBar";

export const defaultNavigationItems: NavItem[] = [
    { label: "Default", href: "#default", icon: LayoutDashboard },
];

export const superAdminNavigationItems: NavItem[] = [
    { label: "Tenants", href: "/tenants", icon: LayoutGrid },
    { label: "Applications", href: "/applications", icon: AppWindow },
    { label: "Users", href: "/users", icon: UsersRound },
];

export const getSuperAdminNavigationItemsAtManagement = (tenantId: string): NavItem[] => [
    { label: "Dashboard", href: `/tenants/management/${tenantId}`, icon: SquareKanban },
    { label: "Assets", href: `/tenants/management/${tenantId}/assets`, icon: MonitorCog },
    { label: "Applications", href: `/tenants/management/${tenantId}/applications`, icon: AppWindow },
    { label: "Members", href: `/tenants/management/${tenantId}/members`, icon: UsersRound },
    { label: "Tenant Settings", href: `/tenants/management/${tenantId}/settings`, icon: Settings },
];

// export const getSuperAdminNavigationItemsAtApplicationsManagement = (applicationId: string): NavItem[] => [
//     { label: "Dashboard", href: `/applications/management/${applicationId}`, icon: SquareKanban },
//     // { label: "Scenario", href: `/applications/management/${applicationId}/scenario`, icon: Radar },
//     { label: "Applications", href: `/applications/management/${applicationId}/portal`, icon: AppWindow },
//     { label: "Members", href: `/applications/management/${applicationId}/members`, icon: UsersRound },
//     { label: "Settings", href: `/applications/management/${applicationId}/settings`, icon: Settings },
// ];


export const getCompanyAdminNavigationItems = (tenantId: string): NavItem[] => [
    { label: "Dashboard", href: `/${tenantId}/dashboard`, icon: SquareKanban },
    { label: "Assets", href: `/${tenantId}/assets`, icon: MonitorCog },
    { label: "Applications", href: `/${tenantId}/applications`, icon: AppWindow },
    { label: "Members", href: `/${tenantId}/members`, icon: UsersRound },
    { label: "Settings", href: `/${tenantId}/settings`, icon: Settings },
];

export const getCompanyAdminNavigationItemsAtApplicationsManagement = (tenantId: string, applicationId: string): NavItem[] => [
    { label: "Dashboard", href: `/${tenantId}/applications/${applicationId}`, icon: SquareKanban },
    { label: "Applications", href: `/${tenantId}/applications/${applicationId}/portal`, icon: AppWindow },
    { label: "Members", href: `/${tenantId}/applications/${applicationId}/members`, icon: UsersRound },
    { label: "Settings", href: `/${tenantId}/applications/${applicationId}/settings`, icon: Settings },
];
