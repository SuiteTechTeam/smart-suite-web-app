"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import { AuthenticatedUser, getUserById } from "@/lib/services/auth-service";

export interface AuthUser {
	id: number;
	email: string;
	name?: string;
	surname?: string;
	phone?: string;
	roleId: number;
	state?: string;
}

type AuthContextType = {
	user: AuthUser | null;
	token: string | null;
	loading: boolean;
	login: (user: AuthenticatedUser, roleId: number) => Promise<void>;
	logout: () => void;
	refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
	user: null,
	token: null,
	loading: true,
	login: async () => {},
	logout: () => {},
	refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	// Guardar sesión en localStorage
	const saveSession = (userData: AuthenticatedUser, roleId: number) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('auth_user', JSON.stringify({
				id: userData.id,
				email: userData.email,
				roleId: roleId
			}));
			localStorage.setItem('auth_token', userData.token);
		}
	};

	// Cargar sesión desde localStorage
	const loadSession = useCallback(() => {
		if (typeof window !== 'undefined') {
			const savedUser = localStorage.getItem('auth_user');
			const savedToken = localStorage.getItem('auth_token');
			
			if (savedUser && savedToken) {
				try {
					const userData = JSON.parse(savedUser);
					setUser(userData);
					setToken(savedToken);
					return { user: userData, token: savedToken };
				} catch (error) {
					console.error('Error parsing saved user data:', error);
					clearSession();
				}
			}
		}
		return null;
	}, []);

	// Limpiar sesión
	const clearSession = () => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('auth_user');
			localStorage.removeItem('auth_token');
		}
		setUser(null);
		setToken(null);
	};
	// Función de login
	const login = async (authenticatedUser: AuthenticatedUser, roleId: number = 2) => {
		try {
			setLoading(true);
			
			// Primero guardar los datos básicos
			const basicUser: AuthUser = {
				id: authenticatedUser.id,
				email: authenticatedUser.email,
				roleId: roleId
			};
			
			setUser(basicUser);
			setToken(authenticatedUser.token);
			saveSession(authenticatedUser, roleId);

			// Luego intentar obtener datos completos del usuario
			try {
				const userData = await getUserById(authenticatedUser.id, roleId, authenticatedUser.token);
				
				const fullUser: AuthUser = {
					id: userData.id,
					email: userData.email,
					name: userData.name,
					surname: userData.surname,
					phone: userData.phone,
					roleId: userData.roleId,
					state: userData.state,
				};
				
				setUser(fullUser);
				// Actualizar localStorage con datos completos
				if (typeof window !== 'undefined') {
					localStorage.setItem('auth_user', JSON.stringify(fullUser));
				}
			} catch (userError) {
				console.error('Error fetching user details:', userError);
				// Mantener datos básicos si no se pueden obtener los completos
			}
		} catch (error) {
			console.error('Error during login:', error);
			throw error; // Re-lanzar el error para que lo maneje el componente
		} finally {
			setLoading(false);
		}
	};

	// Función de logout
	const logout = () => {
		clearSession();
	};

	// Función para refrescar datos del usuario
	const refreshUser = useCallback(async () => {
		const session = loadSession();
		if (session && session.user && session.token) {
			try {
				const userDetailsResult = await getUserById(session.user.id, session.user.roleId, session.token);
				
				if (userDetailsResult.success && userDetailsResult.data) {
					const fullUser: AuthUser = {
						id: userDetailsResult.data.id,
						email: userDetailsResult.data.email,
						name: userDetailsResult.data.name,
						surname: userDetailsResult.data.surname,
						phone: userDetailsResult.data.phone,
						roleId: userDetailsResult.data.roleId,
						state: userDetailsResult.data.state,
					};
					
					setUser(fullUser);
					if (typeof window !== 'undefined') {
						localStorage.setItem('auth_user', JSON.stringify(fullUser));
					}
				}
			} catch (error) {
				console.error('Error refreshing user:', error);
				clearSession();
			}
		}
		setLoading(false);
	}, [loadSession]);

	useEffect(() => {
		// Cargar sesión al montar el componente
		const session = loadSession();
		if (session) {
			refreshUser();
		} else {
			setLoading(false);
		}
	}, [loadSession, refreshUser]);

	return (
		<AuthContext.Provider value={{ 
			user, 
			token, 
			loading, 
			login, 
			logout, 
			refreshUser 
		}}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);

export { AuthContext };
