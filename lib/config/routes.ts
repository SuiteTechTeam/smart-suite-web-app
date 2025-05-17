import { RollerCoaster } from "lucide-react";
import path from "path";

export const routesConfig = {
  public: {
    signIn: {
      path: '/sign-in'
    },
    signUp: {
      path: '/sign-up'
    },
    forgotPassword: {
      path: '/forgot-password'
    },
    authCallback: {
      path: '/auth/callback'
    },

    contact: {
      path: '/contact'
    }
  },
  private: {
    home: {
      path: "/",
      roles: ["admin", "worker"]
    },
    dashboard: {
      path: '/dashboard',
      roles: ['admin', 'worker']
    },
    dashboardiot: {
      path: '/dashboard-iot',
      roles: ['admin', 'worker']
    },
    profile: {
      path: '/profile',
      roles: ['worker', 'admin']
    },
    resetPassword: {
      path: '/reset-password',
      roles: ['worker', 'admin']
    }
  }
} as const;

export type PrivateRouteKey = keyof typeof routesConfig.private;
export type PublicRouteKey = keyof typeof routesConfig.public;

export type UserRole = 'worker' | 'admin';

export type RouteConfig = {
  path: string;
  roles?: UserRole[];
};