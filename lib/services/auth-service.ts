const BASE_URL = "http://localhost:5000/api/v1";

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

export async function signIn(email: string, password: string, roleId: number): Promise<AuthResult> {
  try {
    const response = await fetch(`${BASE_URL}/Authentication/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, roleId })
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

export async function signUp(user: { name: string; surname: string; phone: string; email: string; password: string; roleId: number }): Promise<AuthResult> {
  // roleId: 1=Owner, 2=Admin, 3=Guest
  let endpoint = "";
  if (user.roleId === 1) endpoint = "sign-up-owner";
  else if (user.roleId === 2) endpoint = "sign-up-admin";
  else if (user.roleId === 3) endpoint = "sign-up-guest";
  else return { success: false, message: "Rol inválido" };
  try {
    const response = await fetch(`${BASE_URL}/Authentication/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
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
  if (roleId === 1) endpoint = `owners/${id}`;
  else if (roleId === 2) endpoint = `admins/${id}`;
  else if (roleId === 3) endpoint = `guests/${id}`;
  else return { success: false, message: "Rol inválido" };
  try {
    const response = await fetch(`${BASE_URL}/User/${endpoint}`, {
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
