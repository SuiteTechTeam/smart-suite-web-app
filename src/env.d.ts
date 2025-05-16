/// <reference types="astro/client" />

interface ImportMetaEnv {
  API_URL: string;
  readonly SUPABASE_URL: string
  readonly SUPABASE_ANON_KEY: string
}

interface ImportMeta {
 env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    token?: string;
    isAuthenticated: boolean;
    userRole: number | null;
    userId: number | null;
    user: any | null;
  }
}
