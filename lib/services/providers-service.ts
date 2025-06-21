import { API_CONFIG, buildApiUrl } from "@/lib/config/api";
import { Provider } from "@/types/interfaces";

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Helper function para manejar respuestas de la API
async function handleApiResponse<T>(response: Response): Promise<ApiResult<T>> {
  if (!response.ok) {
    const errorText = await response.text();
    return { 
      success: false, 
      message: errorText || `Error HTTP ${response.status}: ${response.statusText}` 
    };
  }
  
  const data = await response.json();
  return { success: true, data };
}

// Helper function para manejar errores de catch
function handleApiError(error: any, defaultMessage: string): ApiResult<any> {
  return { 
    success: false, 
    message: error.message || defaultMessage 
  };
}

// Provider Management
export async function getAllProviders(token: string): Promise<ApiResult<Provider[]>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROVIDERS.GET_ALL), {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    return await handleApiResponse<Provider[]>(response);
  } catch (error: any) {
    return handleApiError(error, 'Error desconocido al cargar los proveedores');
  }
}

export async function getProviderById(id: number, token: string): Promise<ApiResult<Provider>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.PROVIDERS.GET_BY_ID.replace("{providerId}", id.toString());
    const response = await fetch(buildApiUrl(endpoint), {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    return await handleApiResponse<Provider>(response);
  } catch (error: any) {
    return handleApiError(error, 'Error desconocido al cargar el proveedor');
  }
}

export async function createProvider(provider: Omit<Provider, 'id'>, token: string): Promise<ApiResult<Provider>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROVIDERS.CREATE), {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(provider)
    });
    
    return await handleApiResponse<Provider>(response);
  } catch (error: any) {
    return handleApiError(error, 'Error desconocido al crear el proveedor');
  }
}

export async function updateProvider(id: number, provider: Partial<Provider>, token: string): Promise<ApiResult<Provider>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.PROVIDERS.UPDATE.replace("{providerId}", id.toString());
    const response = await fetch(buildApiUrl(endpoint), {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(provider)
    });
    
    return await handleApiResponse<Provider>(response);
  } catch (error: any) {
    return handleApiError(error, 'Error desconocido al actualizar el proveedor');
  }
}

export async function deleteProvider(id: number, token: string): Promise<ApiResult<void>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.PROVIDERS.DELETE.replace("{providerId}", id.toString());
    const response = await fetch(buildApiUrl(endpoint), {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    return await handleApiResponse<void>(response);
  } catch (error: any) {
    return handleApiError(error, 'Error desconocido al eliminar el proveedor');
  }
}
