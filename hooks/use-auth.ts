"use client";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('auth_user');

        if (!token || !userData) {
          setIsAuthenticated(false);
          return;
        }

        // Verificar que el token no esté vacío o sea inválido
        if (token.trim() === '' || token === 'undefined' || token === 'null') {
          // Limpiar storage corrupto
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          setIsAuthenticated(false);
          return;
        }

        // Verificar que los datos del usuario sean válidos
        const parsedUser = JSON.parse(userData);
        if (!parsedUser.id || !parsedUser.email) {
          // Limpiar storage corrupto
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          setIsAuthenticated(false);
          return;
        }

        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Limpiar storage en caso de error
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Escuchar cambios en el localStorage (para manejar logout en otras pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'auth_user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Limpiar cookies
    const cookieOptions = [
      'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;',
      'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=' + window.location.hostname + ';',
      'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;',
      'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=' + window.location.hostname + ';'
    ];
    
    cookieOptions.forEach(cookieString => {
      document.cookie = cookieString;
    });

    setIsAuthenticated(false);
    setUser(null);
    
    // Redirigir al login
    window.location.replace('/sign-in');
  };

  const redirectToLogin = () => {
    logout();
  };

  return {
    isAuthenticated,
    user,
    logout,
    redirectToLogin,
    isLoading: isAuthenticated === null
  };
}

export function useAuthGuard(redirectTo = "/sign-in") {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}
