import { API_CONFIG, buildApiUrl } from "@/lib/config/api";

// Helper function para manejar respuestas de la API de manera consistente
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

// Helper function para manejar errores de catch de manera consistente
function handleApiError(error: any, defaultMessage: string): ApiResult<any> {
  return { 
    success: false, 
    message: error.message || defaultMessage 
  };
}

export interface Hotel {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  ownerId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Obtener hoteles por propietario
export async function getHotelsByOwner(ownerId: number, token: string): Promise<ApiResult<Hotel[]>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.HOTELS.GET_BY_OWNER.replace("{ownerId}", ownerId.toString());
    const response = await fetch(buildApiUrl(endpoint), {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    return await handleApiResponse<Hotel[]>(response);
  } catch (error: any) {
    return handleApiError(error, 'Error desconocido al cargar los hoteles');
  }
}

// Crear un nuevo hotel
export async function createHotel(hotel: Omit<Hotel, 'id'>, token: string): Promise<ApiResult<Hotel>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.HOTELS.CREATE), {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(hotel)
    });
    
    return await handleApiResponse<Hotel>(response);
  } catch (error: any) {
    return handleApiError(error, 'Error desconocido al crear el hotel');
  }
}
