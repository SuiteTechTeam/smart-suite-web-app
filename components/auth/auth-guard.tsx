"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = () => {
      try {
        // Solo verificar localStorage después de que el componente esté montado
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('auth_user');

        if (!token || !userData) {
          setIsAuthenticated(false);
          router.replace('/sign-in');
          return;
        }

        // Verificar que el token no esté vacío o sea inválido
        if (token.trim() === '' || token === 'undefined' || token === 'null') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setIsAuthenticated(false);
          router.replace('/sign-in');
          return;
        }

        // Verificar que los datos del usuario sean válidos
        const parsedUser = JSON.parse(userData);
        if (!parsedUser.id || !parsedUser.email) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setIsAuthenticated(false);
          router.replace('/sign-in');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setIsAuthenticated(false);
        router.replace('/sign-in');
      }
    };

    checkAuth();
  }, [isMounted, router]);

  // Durante el SSR o mientras se está montando, mostrar el fallback
  if (!isMounted || isAuthenticated === null) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar loading mientras se redirige
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
