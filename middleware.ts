import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/', '/auth'];
  
  // Verificar si la ruta es pública
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Si es una ruta pública, permitir acceso
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Verificar si es una ruta del dashboard (privada)
  if (pathname.startsWith('/dashboard')) {
    // Obtener el token y el usuario de las cookies
    const authToken = request.cookies.get('auth_token')?.value;
    const authUser = request.cookies.get('auth_user')?.value;
    
    // Si no hay token o usuario, redirigir al login
    if (!authToken || !authUser) {
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      // Limpiar cualquier cookie residual
      response.cookies.delete('auth_token');
      response.cookies.delete('auth_user');
      return response;
    }
    
    // Verificar que el token no esté vacío o sea inválido
    if (authToken.trim() === '' || authToken === 'undefined' || authToken === 'null') {
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('auth_token');
      response.cookies.delete('auth_user');
      return response;
    }
    
    // Verificar que la información del usuario sea válida
    try {
      const userData = JSON.parse(authUser);
      if (!userData.id || !userData.email) {
        const response = NextResponse.redirect(new URL('/sign-in', request.url));
        response.cookies.delete('auth_token');
        response.cookies.delete('auth_user');
        return response;
      }
    } catch (error) {
      // Si no se puede parsear el usuario, redirigir al login
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('auth_token');
      response.cookies.delete('auth_user');
      return response;
    }
    
    // Si hay token válido, permitir acceso
    return NextResponse.next();
  }
  
  // Para otras rutas, permitir acceso
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};