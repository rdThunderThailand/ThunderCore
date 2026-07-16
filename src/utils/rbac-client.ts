import { UserRole } from '@/types';

/**
 * Checks if a specific application (based on its href) is authorized for a given role.
 * Used for filtering the Application Switcher dropdown and Sidebar menus.
 */
export function isAppAuthorizedForRole(href: string, role: UserRole | string | undefined | null): boolean {
    if (!role) return false;
    if (role === 'super_admin') return true;

    // Executive can see Command Center, Asset Intelligence, and Smart Asset Management
    if (role === 'executive_viewer') {
        return [
            '/dashboard/command-center', 
            '/dashboard/assets/executive', 
            '/dashboard/assets'
        ].includes(href) || href.startsWith('/dashboard/assets/executive');
    }

    // Company Admin can see everything EXCEPT Command Center and Asset Intelligence
    if (role === 'company_admin') {
        return ![
            '/dashboard/command-center', 
            '/dashboard/assets/executive'
        ].includes(href);
    }

    // Operator can see Smart Asset Management (Assets)
    if (role === 'operator') {
        return ['/dashboard/assets'].includes(href);
    }

    return false;
}

/**
 * Utility to filter a list of menu items based on the user's role.
 * Useful for Tenant menus where certain administrative menus should be hidden.
 */
export function filterMenuItems(menuItems: any[], role: UserRole | string | undefined | null): any[] {
    if (!role) return [];
    if (role === 'super_admin' || role === 'company_admin') {
        return menuItems; // Admins see everything in the menu list
    }

    // For Operator, hide Settings and Members in the Tenant context
    if (role === 'operator') {
        return menuItems.filter(item => {
            const name = item.name.toLowerCase();
            const href = item.href;
            
            // Hide specific administrative menus
            if (
                name.includes('settings') || 
                name.includes('ตั้งค่า') || 
                name.includes('members') || 
                name.includes('สมาชิก') || 
                name.includes('ผู้ใช้งาน') ||
                name.includes('workflow') ||
                name.includes('integration') ||
                name.includes('audit log') ||
                name.includes('master data')
            ) {
                return false;
            }
            return true;
        });
    }

    return menuItems;
}
