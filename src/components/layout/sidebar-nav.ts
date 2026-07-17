import { AppWindow, BarChart3, LayoutDashboard, LayoutGrid, MonitorCog, Settings, SquareKanban, Trash2, UsersRound } from "lucide-react";
import { NavItem } from "./SideBar";

const TENANT_ID = 'e316bbcf-2eb6-48ae-b5d9-74d631dec359'

export const defaultNavigationItems: NavItem[] = [
    { label: "Dashboard", href: "#dashboard", icon: LayoutDashboard },
    { label: "Waste Management", href: "#waste", icon: Trash2 },
    { label: "Analytics", href: "#analytics", icon: BarChart3, badge: 3 },
];

export const superAdminNavigationItems: NavItem[] = [
    { label: "Tenants", href: "/tenants", icon: LayoutGrid },
    { label: "Applications", href: "/applications", icon: AppWindow },
    { label: "Users", href: "/users", icon: UsersRound },
];

export const superAdminNavigationItemsAtManagement: NavItem[] = [
    { label: "Dashboard", href: `/tenants/management/${TENANT_ID}/dashboard`, icon: SquareKanban },
    { label: "Assets", href: `/tenants/management/${TENANT_ID}/assets`, icon: MonitorCog },
    { label: "Applications", href: `/tenants/management/${TENANT_ID}/applications`, icon: AppWindow },
    { label: "Members", href: `/tenants/management/${TENANT_ID}/members`, icon: UsersRound },
    { label: "Tenant Settings", href: `/tenants/management/${TENANT_ID}/settings`, icon: Settings },
];

export const companyAdminNavigationItems: NavItem[] = [
    { label: "Dashboard", href: "#dashboard", icon: SquareKanban },
    { label: "Applications", href: "#applications", icon: AppWindow },
    { label: "Members", href: "#members", icon: UsersRound },
    { label: "Settings", href: "#tenant-setting", icon: Settings },
];

export const companyAdminNavigationItemsAtManagement: NavItem[] = [
    { label: "Dashboard", href: "#dashboard", icon: SquareKanban },
    { label: "Applications", href: "#applications", icon: AppWindow },
    { label: "Members", href: "#members", icon: UsersRound },
    { label: "Settings", href: "#tenant-setting", icon: Settings },
];