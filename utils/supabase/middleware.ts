import { routesConfig } from "@/lib/config/routes";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";

type Role = {
	role: string;
};

type UserRole = {
	role: Role;
};

export const updateSession = async (request: NextRequest) => {
	// This `try/catch` block is only here for the interactive tutorial.
	// Feel free to remove once you have Supabase connected.
	try {
		// Create an unmodified response
		let response = NextResponse.next({
			request: {
				headers: request.headers,
			},
		});

		/* Handling if the request has no a valid Supabase URL or Anon Key */
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

		if (!supabaseUrl || !supabaseKey) {
			throw new Error("Missing Supabase URL or Anon Key");
		}

		const supabase = createServerClient(supabaseUrl, supabaseKey, {
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					for (const { name, value } of cookiesToSet) {
						request.cookies.set(name, value);
					}
					response = NextResponse.next({
						request,
					});
					for (const { name, value, options } of cookiesToSet) {
						response.cookies.set(name, value, options);
					}
				},
			},
		});

		// This will refresh session if expired - required for Server Components
		// https://supabase.com/docs/guides/auth/server-side/nextjs
		const user = await supabase.auth.getUser();

		// Add an index signature to routesConfig.private type if not already present
		// For example, in your routesConfig definition file, update the type as follows:
		// export interface PrivateRoutesConfig {
		//   [key: string]: { path: string; roles?: string[] };
		// }
		// Then use that type for routesConfig.private
		
		// Obtener todas las rutas privadas
		const privateRoutes = Object.values(routesConfig.private).map(route => ({
			...route,
			roles: route.roles ? [...route.roles] : undefined
		})).map(route => route.path);

		// Verificar rutas privadas
		if (privateRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
			if (user.error) {
				return NextResponse.redirect(new URL('/sign-in', request.url));
			}


			console.log('User:', user.data.user);
			// Verificación de roles desde la base de datos
			const { data: userRoles, error: rolesError } = await supabase
				.from('users_roles')
				.select(`
					role:roles!users_roles_roles_id_fkey (
						role
					)
				`)
				.eq('user_id', user.data.user?.id) as { data: UserRole[] | null; error: PostgrestError | null };

			if (rolesError) {
				console.error('Error fetching user roles:', rolesError);
				return NextResponse.redirect(new URL('/sign-in', request.url));
			}
			console.log("Roles", userRoles);
			// Extraer los roles del usuario
			const userRoleDescriptions = userRoles?.map(ur => ur.role.role) || [];
			
			// Encontrar la configuración de la ruta actual
			const routeConfig = Object.values(routesConfig.private).find(route => 
				request.nextUrl.pathname.startsWith(route.path)
			);

			// Verificar si el usuario tiene los roles necesarios para acceder a la ruta
			if (routeConfig?.roles && !routeConfig.roles.some(role => userRoleDescriptions.includes(role))) {
				console.log('Usuario no tiene los roles necesarios:', {
					requiredRoles: routeConfig.roles,
					userRoles: userRoleDescriptions
				});
				return NextResponse.redirect(new URL('/sign-in', request.url));	
			}

			// Si no tiene ningún rol, no puede acceder a rutas privadas
			if (userRoleDescriptions.length === 0) {
				return NextResponse.redirect(new URL('/sign-in', request.url));
			}
		}

		return response;
	} catch (e) {
		return NextResponse.next({
			request: {
				headers: request.headers,
			},
		});
	}
};
