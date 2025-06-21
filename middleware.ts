import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/', '/auth'];
  
  if (pathname === '/') {
    const authToken = request.cookies.get('auth_token')?.value;
    const authUser = request.cookies.get('auth_user')?.value;
    
    if (authToken && authUser) {
      try {
        const userData = JSON.parse(authUser);
        if (
          authToken.trim() !== '' &&
          authToken !== 'undefined' &&
          authToken !== 'null' &&
          userData.id &&
          userData.email
        ) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
      }
    }
    return NextResponse.redirect(new URL('/sign-up', request.url));
  }
  
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  if (pathname.startsWith('/dashboard')) {
    const authToken = request.cookies.get('auth_token')?.value;
    const authUser = request.cookies.get('auth_user')?.value;
    
    if (!authToken || !authUser) {
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('auth_token');
      response.cookies.delete('auth_user');
      return response;
    }
    
    if (authToken.trim() === '' || authToken === 'undefined' || authToken === 'null') {
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('auth_token');
      response.cookies.delete('auth_user');
      return response;
    }
    
    try {
      const userData = JSON.parse(authUser);
      if (!userData.id || !userData.email) {
        const response = NextResponse.redirect(new URL('/sign-in', request.url));
        response.cookies.delete('auth_token');
        response.cookies.delete('auth_user');
        return response;
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('auth_token');
      response.cookies.delete('auth_user');
      return response;
    }
    
    return NextResponse.next();
  }
  
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