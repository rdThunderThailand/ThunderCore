import { AppWindow, Building, Settings, SquareKanban, UsersRound } from "lucide-react";
import { NavItem } from "./SideBar";

// export const defaultNavigationItems: NavItem[] = [
//     { label: "Dashboard", labelTh: "แดชบอร์ด", href: "#dashboard", icon: LayoutDashboard },
//     { label: "Waste Management", labelTh: "การจัดการขยะ", href: "#waste", icon: Trash2 },
//     { label: "Analytics", labelTh: "วิเคราะห์ข้อมูล", href: "#analytics", icon: BarChart3, badge: 3 },
// ];

export const superAdminNavigationItems: NavItem[] = [
    { label: "Tenants", href: "#tenants", icon: Building },
    { label: "Applications", href: "#applications", icon: AppWindow },
    { label: "Users", href: "#users", icon: UsersRound },
];

export const companyAdminNavigationItems: NavItem[] = [
    { label: "Dashboard", href: "#dashboard", icon: SquareKanban },
    { label: "Applications", href: "#applications", icon: AppWindow },
    { label: "Members", href: "#members", icon: UsersRound },
    { label: "Organization Settings", href: "#organization-setting", icon: Settings },
];