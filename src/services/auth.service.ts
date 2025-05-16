interface LoginCredentials {
  email: string;
  password: string;
  rolesId: number;
}

interface RegisterCredentials {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  rolesId: number;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<void> {
    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);
    formData.append('rolesId', credentials.rolesId.toString());

    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Login failed');
    }

    // If redirected, follow the redirect
    if (response.redirected) {
      window.location.href = response.url;
    }
  },
  logout() {
    // Use the sign-out API endpoint
    return fetch('/api/auth/signout', {
      method: 'POST',
    }).then(response => {
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        window.location.href = '/sign-in';
      }
    }).catch(error => {
      console.error('Logout error:', error);
      window.location.href = '/sign-in';
    });
  },

  register(credentials: RegisterCredentials): Promise<void> {
    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);
    formData.append('rolesId', credentials.rolesId.toString());

    if (credentials.fullName) {
      formData.append('fullName', credentials.fullName);
    }

    if (credentials.phone) {
      formData.append('phone', credentials.phone);
    }

    return fetch('/api/auth/register', {
      method: 'POST',
      body: formData
    }).then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(text || 'Registration failed');
        });
      }

      if (response.redirected) {
        window.location.href = response.url;
      }
    });
  },
  getUser() {
    // The user info is managed by the middleware and Supabase directly
    // This is just a client-side utility to check authentication state
    return document.cookie.includes('sb-access-token=');
  },

  isAuthenticated(): boolean {
    // Check if the Supabase cookie exists
    return document.cookie.includes('sb-access-token=');
  },

  // Function to redirect if user is not authenticated
  checkAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/sign-in';
    }
  }
};