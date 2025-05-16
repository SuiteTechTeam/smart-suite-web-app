/**
 * Routes Configuration for Smart Suite Web App
 * Defines public and private routes, as well as role-based access control
 * 
 * This centralized configuration defines:
 * 1. Public routes that don't require authentication
 * 2. Private routes that require authentication
 * 3. Role-based permissions for accessing specific routes
 * 4. Helper functions for checking access permissions
 */

// Role definitions
export enum Roles {
    OWNER = 1,  // Hotel owner with full access to all features
    ADMIN = 2,  // Hotel administrator with access to most features except organization settings
    WORKER = 3, // Hotel staff with limited access to operational features
    GUEST = 4   // Hotel guest with very limited access (typically for mobile app features)
}

// Route access level types
export type RouteAccess = 'public' | 'private';

// Route configuration interface
export interface RouteConfig {
    path: string;
    access: RouteAccess;
    // Array of roles that can access this route (only applicable for private routes)
    // If empty array, all authenticated users can access
    allowedRoles?: number[]; 
    // Description of what this route is for (documentation purposes)
    description?: string;
    // Children routes inherit the parent's access and allowed roles unless overridden
    children?: RouteConfig[]; 
}

/**
 * Public routes that don't require authentication
 */
export const publicRoutes: string[] = [
    '/',
    '/sign-in',
    '/sign-up',
    '/sign-up/role-selection',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
];

/**
 * Complete routes configuration
 * This is the source of truth for all route permissions in the application
 */
export const routesConfig: RouteConfig[] = [
    // Public routes - accessible without authentication
    {
        path: '/',
        access: 'public',
        description: 'Landing page with hotel information and services'
    },
    {
        path: '/sign-in',
        access: 'public',
        description: 'User authentication page'
    },
    {
        path: '/sign-up',
        access: 'public',
        description: 'New user registration',
        children: [
            {
                path: '/sign-up/role-selection',
                access: 'public',
                description: 'Select user role during registration'
            }
        ]
    },
    {
        path: '/about',
        access: 'public',
        description: 'Information about Smart Suite'
    },
    {
        path: '/contact',
        access: 'public',
        description: 'Contact information and form'
    },
    {
        path: '/privacy',
        access: 'public',
        description: 'Privacy policy'
    },
    {
        path: '/terms',
        access: 'public',
        description: 'Terms of service'
    },

    // Dashboard and private routes
    {
        path: '/dashboard',
        access: 'private',
        allowedRoles: [Roles.OWNER, Roles.ADMIN, Roles.WORKER],
        description: 'Main dashboard with overview statistics',
        children: [
            {
                path: '/dashboard/analytics',
                access: 'private',
                allowedRoles: [Roles.OWNER, Roles.ADMIN],
                description: 'Advanced analytics and IoT device statistics'
            },
            {
                path: '/dashboard/rooms',
                access: 'private',
                allowedRoles: [Roles.OWNER, Roles.ADMIN, Roles.WORKER],
                description: 'Room management and booking information'
            },
            {
                path: '/dashboard/providers',
                access: 'private',
                allowedRoles: [Roles.OWNER, Roles.ADMIN],
                description: 'External service provider management'
            },
            {
                path: '/dashboard/inventory',
                access: 'private',
                allowedRoles: [Roles.OWNER, Roles.ADMIN, Roles.WORKER],
                description: 'Hotel inventory tracking and management'
            },
            {
                path: '/dashboard/devices',
                access: 'private',
                allowedRoles: [Roles.OWNER, Roles.ADMIN],
                description: 'IoT device management and monitoring'
            },
            {
                path: '/dashboard/organization',
                access: 'private',
                allowedRoles: [Roles.OWNER],
                description: 'Organization settings and structure - owner only'
            },
            {
                path: '/dashboard/hotel',
                access: 'private',
                allowedRoles: [Roles.OWNER, Roles.ADMIN],
                description: 'Hotel settings and management'
            }
        ]
    },

    // User profile routes
    {
        path: '/profile',
        access: 'private',
        allowedRoles: [], // All authenticated users can access
        description: 'User profile and settings'
    },
    
    // Guest application routes
    {
        path: '/guest',
        access: 'private',
        allowedRoles: [Roles.GUEST],
        description: 'Guest-specific features',
        children: [
            {
                path: '/guest/room-control',
                access: 'private',
                allowedRoles: [Roles.GUEST],
                description: 'Room control for hotel guests'
            },
            {
                path: '/guest/services',
                access: 'private',
                allowedRoles: [Roles.GUEST],
                description: 'Hotel service requests for guests'
            }
        ]
    },
    
    // API documentation - restricted to technical staff
    {
        path: '/api-docs',
        access: 'private',
        allowedRoles: [Roles.OWNER, Roles.ADMIN],
        description: 'API documentation for developers'
    }
];

/**
 * Helper functions for route checking and access control
 */

/**
 * Find a route configuration by path
 * @param configs Array of route configs to search through
 * @param path The path to find
 * @returns The matching route config or undefined
 */
export function findRouteConfig(configs: RouteConfig[], path: string): RouteConfig | undefined {
    for (const config of configs) {
        // Direct match
        if (path === config.path || path.startsWith(`${config.path}/`)) {
            // Check for more specific child route
            if (config.children) {
                const childConfig = findRouteConfig(config.children, path);
                if (childConfig) return childConfig;
            }
            return config;
        }
    }
    return undefined;
}

/**
 * Check if a route is public
 * @param route The route path to check
 * @returns boolean indicating if route is public
 */
export function isPublicRoute(route: string): boolean {
    return publicRoutes.some(publicRoute => route === publicRoute || route.startsWith(`${publicRoute}/`));
}

/**
 * Get a specific role by ID
 * @param roleId The role ID to look up
 * @returns The role name or "Unknown" if not found
 */
export function getRoleName(roleId: number): string {
    switch(roleId) {
        case Roles.OWNER: return 'Owner';
        case Roles.ADMIN: return 'Administrator';
        case Roles.WORKER: return 'Staff';
        case Roles.GUEST: return 'Guest';
        default: return 'Unknown';
    }
}

/**
 * Check if a user with the specified role is allowed to access a route
 * @param route The route path to check
 * @param roleId The role ID of the user
 * @returns boolean indicating if the user can access the route
 */
export function canAccessRoute(route: string, roleId: number): boolean {
    // Public routes are accessible to everyone
    if (isPublicRoute(route)) {
        return true;
    }
    
    const routeConfig = findRouteConfig(routesConfig, route);
    
    // Route not found in config
    if (!routeConfig) {
        return false;
    }
    
    // If it's a public route
    if (routeConfig.access === 'public') {
        return true;
    }
    
    // If private route with no specific roles, any authenticated user can access
    if (!routeConfig.allowedRoles || routeConfig.allowedRoles.length === 0) {
        return true;
    }
    
    // Check if user's role is allowed
    return routeConfig.allowedRoles.includes(roleId);
}

/**
 * Get all routes accessible to a user with the specified role
 * @param roleId The role ID of the user
 * @returns Array of route paths accessible to the user
 */
export function getAccessibleRoutes(roleId: number): string[] {
    const accessibleRoutes: string[] = [...publicRoutes];
    
    // Function to recursively collect accessible routes
    const collectRoutes = (configs: RouteConfig[]) => {
        for (const config of configs) {
            // Check if this route is accessible to the role
            if (config.access === 'public' || 
                !config.allowedRoles || 
                config.allowedRoles.length === 0 || 
                config.allowedRoles.includes(roleId)) {
                
                accessibleRoutes.push(config.path);
            }
            
            // Check children routes
            if (config.children) {
                collectRoutes(config.children);
            }
        }
    };
    
    collectRoutes(routesConfig);
    return [...new Set(accessibleRoutes)]; // Remove duplicates
}

/**
 * Get a summary of routes by role for documentation/debugging
 * @returns Object with roles as keys and arrays of accessible routes as values
 */
export function getRoutesByRole(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    
    // Add all roles
    result['Owner'] = getAccessibleRoutes(Roles.OWNER);
    result['Administrator'] = getAccessibleRoutes(Roles.ADMIN);
    result['Staff'] = getAccessibleRoutes(Roles.WORKER);
    result['Guest'] = getAccessibleRoutes(Roles.GUEST);
    
    return result;
}
