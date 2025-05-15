/// <reference types="astro/client" />

interface ImportMetaEnv {
  API_URL: string;
}

interface ImportMeta {
 env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    token?: string;
    isAuthenticated: boolean;
    user?: {
      id: string;
      username: string;
      role: string;
    };
  }
}
