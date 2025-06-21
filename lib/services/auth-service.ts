import { API_CONFIG, buildApiUrl } from "@/lib/config/api";

export interface AuthenticatedUser {
  id: number;
  email: string;
  token: string;
}

export interface AuthResult {
  success: boolean;
  data?: AuthenticatedUser;
  message?: string;
}

export async function signIn(email: string, password: string, roleId: number | string): Promise<AuthResult> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGN_IN), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, roleId: Number(roleId) })
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
    const data = await response.json();
    return {
      success: true,
      data: {
        id: data.id ?? data.userId ?? data.User?.id ?? data.user?.id,
        email: data.email ?? data.User?.email ?? data.user?.email,
        token: data.token ?? data.Token ?? data.token
      }
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function signUp(user: { name: string; surname: string; phone: string; email: string; password: string; roleId: number }): Promise<AuthResult> {  // roleId: 1=Owner, 2=Admin, 3=Guest
  let endpoint = "";
  if (user.roleId === 1) endpoint = API_CONFIG.ENDPOINTS.AUTH.SIGN_UP_OWNER;
  else if (user.roleId === 2) endpoint = API_CONFIG.ENDPOINTS.AUTH.SIGN_UP_ADMIN;
  else if (user.roleId === 3) endpoint = API_CONFIG.ENDPOINTS.AUTH.SIGN_UP_GUEST;
  else return { success: false, message: "Rol inválido" };
  //raro, pero funciona, separa el rol del usuario para que no se envíe en el body
  const { roleId, ...userToSend } = user;

  try {
    const response = await fetch(buildApiUrl(endpoint), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userToSend),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getUserById(id: number, roleId: number, token: string): Promise<any> {
  let endpoint = "";
  if (roleId === 1) endpoint = `${API_CONFIG.ENDPOINTS.USER.OWNERS}/${id}`;
  else if (roleId === 2) endpoint = `${API_CONFIG.ENDPOINTS.USER.ADMINS}/${id}`;
  else if (roleId === 3) endpoint = `${API_CONFIG.ENDPOINTS.USER.GUESTS}/${id}`;
  else return { success: false, message: "Rol inválido" };
  try {
    const response = await fetch(buildApiUrl(endpoint), {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
