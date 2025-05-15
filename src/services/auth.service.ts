interface LoginCredentials {
  email: string;
  password: string;
  rolesId: number;
}

interface AuthResponse {
  id: number;
  username: string;
  token: string;
}

const API_URL = import.meta.env.API_URL;

if (!API_URL) {
  throw new Error('API_URL environment variable is not defined');
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/v1/authentication/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        rolesId: credentials.rolesId
      }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    // Guardar el token en una cookie
    document.cookie = `auth-token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
    
    // Guardar la información del usuario en localStorage para uso posterior
    localStorage.setItem('user', JSON.stringify({
      id: data.id,
      username: data.username
    }));

   
    return data;
  },

  logout() {
    // Eliminar la cookie y los datos del usuario
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getToken(): string | null {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Función para verificar si el usuario está autenticado y redirigir si es necesario
  checkAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login';
    }
  }
}; 