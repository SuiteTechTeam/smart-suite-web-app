/**
 * Route authorization utilities for client-side use
 */
import type { Roles } from '../config/routesConfig';
import { canAccessRoute } from '../config/routesConfig';

/**
 * Checks if the user is authenticated by looking for Supabase token in cookies
 */
export function isAuthenticated(): boolean {
  return document.cookie.includes('sb-access-token=');
}

/**
 * Gets the current user's role from client-side storage
 * This is a utility for purely client-side checks when server-side data is unavailable
 */
export function getUserRole(): number | null {
  try {
    if (!isAuthenticated()) {
      return null;
    }
    
    // Try to get the role from sessionStorage
    // This would be populated by your initial page load based on Astro.locals
    const userRole = sessionStorage.getItem('userRole');
    if (userRole) {
      return parseInt(userRole);
    }
    
    // Default fallback role
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Checks if the current user can access a specific route
 * @param route The route to check
 */
export function checkRouteAccess(route: string): boolean {
  const roleId = getUserRole();
  if (!roleId) {
    return false;
  }
  
  return canAccessRoute(route, roleId);
}

/**
 * Store the user role in session storage
 * Call this when the user first loads a page
 */
export function storeUserRole(roleId: number): void {
  sessionStorage.setItem('userRole', roleId.toString());
}

/**
 * Sign out the user by calling the signout API
 */
export async function signOut(): Promise<void> {
  try {
    const response = await fetch('/api/auth/signout', {
      method: 'POST'
    });
    
    if (response.redirected) {
      window.location.href = response.url;
    } else {
      window.location.href = '/sign-in';
    }
  } catch (error) {
    console.error('Sign out error:', error);
    window.location.href = '/sign-in';
  }
}

/**
 * Redirect user according to authentication status and role
 * @param currentPath The current route path
 */
export function handleAuthRedirect(currentPath: string): void {
  // Skip redirect for public routes like login/signup
  if (['/sign-in', '/sign-up', '/sign-up/role-selection', '/'].includes(currentPath)) {
    return;
  }
  
  if (!isAuthenticated()) {
    window.location.href = '/sign-in';
    return;
  }
  
  const roleId = getUserRole();
  if (!roleId || !checkRouteAccess(currentPath)) {
    // Redirect to home or dashboard based on role
    if (roleId === 1) { // Owner
      window.location.href = '/dashboard';
    } else if (roleId === 2) { // Admin
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/'; // Default fallback
    }
  }
}
