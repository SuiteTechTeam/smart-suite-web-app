import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/sign-in'];
  
  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => context.url.pathname.startsWith(route));
  
  if (isPublicRoute) {
    return next();
  }

  return next();
}); 