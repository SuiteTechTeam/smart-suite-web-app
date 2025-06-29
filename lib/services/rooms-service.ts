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

// Tipos de estados posibles para las habitaciones
export type RoomState = "occupied" | "available" | "maintenance";

export interface Room {
  id: number;
  room_number: string;
  type: string;
  capacity: number;
  price: number;
  state: RoomState;
  floor?: number;
  devices?: string[];
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function getAllRooms(token: string, hotelId: number = 1): Promise<ApiResult<Room[]>> {
  try {
    if (!token) {
      return {
        success: false,
        message: "No se proporcionó token de autenticación"
      };
    }
    
    // Construir URL con el parámetro hotelId
    const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.ROOMS.GET_ALL)}?hotelId=${hotelId}`;
    
    console.log(`Fetching rooms for hotelId: ${hotelId}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Rooms API error response:', errorText); 
      return { 
        success: false, 
        message: "No se pudieron cargar las habitaciones" 
      };
    }
      const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      console.error('API returned invalid data format', data);
      return {
        success: false,
        message: "Formato de datos inválido recibido del servidor"
      };
    }
    
    // Validar los datos de cada habitación y normalizar los estados
    const validRooms = data.map(room => {
      // Asegurarse de que el estado es uno de los valores permitidos
      if (room && typeof room === 'object') {
        if (room.state && typeof room.state === 'string') {
          const lowerCaseState = room.state.toLowerCase();
          if (['occupied', 'available', 'maintenance'].includes(lowerCaseState)) {
            room.state = lowerCaseState; // Normalize to lowercase
          } else {
            console.warn(`Estado no válido en habitación ${room.id || 'desconocida'}: "${room.state}", asignando "available" por defecto`);
            room.state = 'available';
          }
        } else {
          console.warn(`Estado no definido o inválido en habitación ${room.id || 'desconocida'}, asignando "available" por defecto`);
          room.state = 'available';
        }
      }
      return room;
    });
    
    return { success: true, data: validRooms };
  } catch (error: any) {
    console.error('Error al cargar habitaciones:', error); 
    return { 
      success: false, 
      message: "No se pudieron cargar las habitaciones" 
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

export interface CreateRoomData {
  typeRoomId: number;
  hotelId: number;
  state: string;
}

export async function createRoom(room: CreateRoomData, token: string): Promise<ApiResult<Room>> {
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

export async function updateRoom(id: number, room: Partial<Room>, token: string): Promise<ApiResult<Room>> {
  try {
    // Primero intentamos con el endpoint de actualización de estado si solo cambia el estado
    if (Object.keys(room).length === 1 && room.state) {
      return await updateRoomState(id, room.state, token);
    }

    // Para actualizaciones completas, usamos el endpoint de actualización general
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ROOMS.UPDATE), {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id, ...room })
    });
    
    if (!response.ok) {
      // Si el endpoint no existe, intentamos solo actualizar el estado
      if (response.status === 404 || response.status === 405) {
        return { 
          success: false, 
          message: "La función de actualización completa no está disponible en la API. Solo se puede actualizar el estado." 
        };
      }
      
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
      message: error.message || 'Error desconocido al actualizar la habitación' 
    };
  }
}
