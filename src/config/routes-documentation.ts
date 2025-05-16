/**
 * Smart Suite Routes Configuration Documentation
 * 
 * This file explains how the route authorization system works and how to use it.
 */

import { Roles, RouteConfig, canAccessRoute, getRoutesByRole, getRoleName } from './routesConfig';

/**
 * ROUTE AUTHORIZATION SYSTEM
 * =========================
 * 
 * The Smart Suite application uses a robust route authorization system that:
 * 
 * 1. Distinguishes between public and private routes
 * 2. Enforces role-based access control on private routes
 * 3. Uses middleware to check permissions server-side
 * 4. Provides client-side utilities for controlling UI elements based on permissions
 * 
 * HOW IT WORKS:
 * ------------
 * - Public routes are accessible to all users without authentication
 * - Private routes require authentication
 * - Private routes may specify allowed roles
 * - If a private route doesn't specify roles, any authenticated user can access it
 * - Child routes inherit parent route permissions unless overridden
 * 
 * ROLES HIERARCHY:
 * --------------
 * 1. OWNER (1): Full access to all features
 * 2. ADMIN (2): Access to most features except organization settings
 * 3. WORKER (3): Limited access to operational features
 * 4. GUEST (4): Very limited access for hotel guests (mobile app features)
 * 
 * CHECKING ACCESS:
 * --------------
 * Server-side (middleware.ts):
 *   - Validates the auth token
 *   - Extracts user role
 *   - Checks if the user can access the requested route
 *   - Redirects to sign-in if not authenticated
 *   - Redirects to home if authenticated but not authorized
 * 
 * Client-side (authUtils.ts):
 *   - Provides functions to check authentication status
 *   - Provides functions to check route access permissions
 *   - Manages redirects for unauthorized access attempts
 * 
 * IN COMPONENTS (RouteGuard.astro):
 *   - Provides a component that can be used at the top of pages
 *   - Checks if the user has the required roles
 *   - Redirects if not authorized
 * 
 * USAGE EXAMPLES:
 * -------------
 */

// Example 1: Check if a user can access a route server-side
function checkAccessServerSide(routePath: string, userRoleId: number): boolean {
  return canAccessRoute(routePath, userRoleId);
}

// Example 2: Use in a component to conditionally render UI elements
function renderNavigationExample(userRoleId: number): void {
  const showAnalyticsLink = canAccessRoute('/dashboard/analytics', userRoleId);
  const showOrgSettings = canAccessRoute('/dashboard/organization', userRoleId);
  
  // Then use these boolean flags to conditionally render UI elements
}

// Example 3: Using the RouteGuard component in an Astro page
/**
 * ```astro
 * ---
 * import { Roles } from '../config/routesConfig';
 * import RouteGuard from '../components/RouteGuard.astro';
 * ---
 * 
 * <RouteGuard requiredRoles={[Roles.OWNER, Roles.ADMIN]} redirectTo="/dashboard">
 *   <!-- Page content only visible to owners and admins -->
 * </RouteGuard>
 * ```
 */

// Example 4: Getting all routes accessible to a specific role
function printAccessibleRoutesForRole(roleId: number): void {
  const roleName = getRoleName(roleId);
  console.log(`Routes accessible to ${roleName}:`, getRoutesByRole()[roleName]);
}

/**
 * EXTENDING THE SYSTEM:
 * ------------------
 * To add new routes or change permissions:
 * 
 * 1. Update the routesConfig.ts file
 * 2. Add the route to the appropriate section (public or private)
 * 3. Set the allowedRoles array if it's a private route
 * 4. The changes will automatically apply throughout the app
 */

export default {
  Roles,
  checkAccessServerSide,
  renderNavigationExample,
  printAccessibleRoutesForRole
};
