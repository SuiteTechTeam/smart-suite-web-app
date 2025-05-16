import { defineMiddleware } from 'astro:middleware';
import { supabase } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/sign-in', '/sign-up', '/'];
  
  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => context.url.pathname.startsWith(route));
  
  // Default values
  context.locals.isAuthenticated = false;
  context.locals.userRole = null;
  context.locals.userId = null;
  context.locals.user = null;
  
  // Get access token from cookies
  const accessToken = context.cookies.get('sb-access-token')?.value;
  const refreshToken = context.cookies.get('sb-refresh-token')?.value;
  
  // If tokens exist, validate with Supabase
  if (accessToken && refreshToken) {
    const { data } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
      if (data.session) {
      // User is authenticated
      context.locals.isAuthenticated = true;
      context.locals.user = data.user;
      
      // Fetch user role from your database if needed
      // For example:
      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role_id, id')
          .eq('auth_id', data.user.id)
          .single();
          
        if (userData) {
          context.locals.userRole = userData.role_id;
          context.locals.userId = userData.id;
        }
      }
    }
  }

  if (isPublicRoute) {
    return next();
  }
  
  // If not authenticated and trying to access protected route, redirect to sign-in
  if (!context.locals.isAuthenticated) {
    return context.redirect('/sign-in');
  }

  return next();
});