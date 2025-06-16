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

export interface Room {
  id: number;
  room_number: string;
  type: string;
  capacity: number;
  price: number;
  state: "occupied" | "vacant" | "maintenance";
  floor?: number;
  devices?: string[];
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function getAllRooms(token: string): Promise<ApiResult<Room[]>> {
  try {
    console.log('Fetching rooms with token:', token ? 'Token present' : 'No token'); // Debug log
    
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ROOMS.GET_ALL), {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log('Rooms API response status:', response.status); // Debug log
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Rooms API error response:', errorText); // Debug log
      return { 
        success: false, 
        message: errorText || `Error HTTP ${response.status}: ${response.statusText}` 
      };
    }
    
    const data = await response.json();
    console.log('Rooms API success response:', data); // Debug log
    return { success: true, data };
  } catch (error: any) {
    console.error('Rooms API catch error:', error); // Debug log
    return { 
      success: false, 
      message: error.message || 'Error desconocido al cargar las habitaciones' 
    };
  }
}

export async function getRoomById(id: number, token: string): Promise<ApiResult<Room>> {
  try {
    const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ROOMS.GET_BY_ID}?id=${id}`), {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        message: errorText || `Error HTTP ${response.status}: ${response.statusText}` 
      };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Error desconocido al cargar la habitación' 
    };
  }
}

export async function getRoomsByState(state: string, token: string): Promise<ApiResult<Room[]>> {
  try {
    const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ROOMS.GET_BY_STATE}?state=${state}`), {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        message: errorText || `Error HTTP ${response.status}: ${response.statusText}` 
      };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Error desconocido al cargar las habitaciones por estado' 
    };
  }
}

export async function createRoom(room: Omit<Room, 'id'>, token: string): Promise<ApiResult<Room>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ROOMS.CREATE), {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(room)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        message: errorText || `Error HTTP ${response.status}: ${response.statusText}` 
      };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Error desconocido al crear la habitación' 
    };
  }
}

export async function updateRoomState(id: number, state: string, token: string): Promise<ApiResult<Room>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ROOMS.UPDATE_STATE), {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id, state })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        message: errorText || `Error HTTP ${response.status}: ${response.statusText}` 
      };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Error desconocido al actualizar el estado de la habitación' 
    };
  }
}
