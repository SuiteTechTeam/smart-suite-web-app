// Este archivo ahora redirige al servicio centralizado de rooms
// El servicio real está en lib/services/rooms-service.ts

import { 
  getAllRooms, 
  createRoom as apiCreateRoom, 
  updateRoomState, 
  getRoomById, 
  Room as ApiRoom,
  CreateRoomData
} from "@/lib/services/rooms-service";
import { ServerActionResult } from "@/types/interfaces";

export interface Room {
  id: number;
  name: string;
  floor: number;
  status: "occupied" | "available" | "maintenance";
  type: string;
  capacity: number;
  price: number;
  devices: string[];
  last_cleaned?: string;
  notes?: string;
}

// Función para convertir de ApiRoom a Room (para compatibilidad)
const convertApiRoomToRoom = (apiRoom: ApiRoom): Room => ({
  id: apiRoom.id,
  name: apiRoom.room_number || `Habitación ${apiRoom.id}`,
  floor: apiRoom.floor || 1,
  status: apiRoom.state as "occupied" | "available" | "maintenance",
  type: apiRoom.type || "Individual",
  capacity: apiRoom.capacity || 1,
  price: apiRoom.price || 0,
  devices: apiRoom.devices || [],
  last_cleaned: new Date().toISOString().split("T")[0],
  notes: "",
});

// Función para convertir de Room a CreateRoomData (para crear habitaciones)
const convertRoomToCreateRoomData = (room: Omit<Room, 'id'>, typeRoomId: number, hotelId: number): CreateRoomData => ({
  typeRoomId,
  hotelId,
  state: room.status,
});

export const getRooms = async (hotelId: number = 1): Promise<ServerActionResult> => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return {
        success: false,
        message: "No hay token de autenticación"
      };
    }

    const result = await getAllRooms(token, hotelId);
    if (result.success && result.data) {
      const rooms = result.data.map(convertApiRoomToRoom);
      return {
        success: true,
        message: "Habitaciones obtenidas correctamente",
        data: rooms
      };
    } else {
      return {
        success: false,
        message: result.message || "No se pudieron cargar las habitaciones"
      };
    }
  } catch (error: any) {
    console.error("Error al obtener las habitaciones:", error.message);
    return {
      success: false,
      message: "No se pudieron cargar las habitaciones"
    };
  }
};

export const createRoom = async (room: Omit<Room, 'id'>, typeRoomId: number, hotelId: number): Promise<ServerActionResult> => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return {
        success: false,
        message: "No hay token de autenticación"
      };
    }

    const createRoomData = convertRoomToCreateRoomData(room, typeRoomId, hotelId);
    const result = await apiCreateRoom(createRoomData, token);
    
    if (result.success && result.data) {
      const newRoom = convertApiRoomToRoom(result.data);
      return {
        success: true,
        message: "Habitación añadida correctamente",
        data: newRoom
      };
    } else {
      return {
        success: false,
        message: result.message || "Error al crear la habitación"
      };
    }
  } catch (error: any) {
    console.error("Error al crear habitación:", error.message);
    return {
      success: false,
      message: error.message || "Error al crear la habitación"
    };
  }
};

export const updateRoom = async (id: number, room: Partial<Room>): Promise<ServerActionResult> => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return {
        success: false,
        message: "No hay token de autenticación"
      };
    }

    // Por ahora solo podemos actualizar el estado usando updateRoomState
    if (room.status) {
      const result = await updateRoomState(id, room.status, token);
      if (result.success && result.data) {
        const updatedRoom = convertApiRoomToRoom(result.data);
        return {
          success: true,
          message: "Estado de habitación actualizado correctamente",
          data: updatedRoom
        };
      } else {
        return {
          success: false,
          message: result.message || "Error al actualizar la habitación"
        };
      }
    } else {
      return {
        success: false,
        message: "Solo se puede actualizar el estado de la habitación por ahora"
      };
    }
  } catch (error: any) {
    console.error("Error al actualizar habitación:", error.message);
    return {
      success: false,
      message: error.message || "Error al actualizar la habitación"
    };
  }
};

export const deleteRoom = async (id: number): Promise<ServerActionResult> => {
  try {
    // La función de eliminar no está implementada en la API aún
    return {
      success: false,
      message: "La función de eliminar habitaciones no está disponible temporalmente"
    };
  } catch (error: any) {
    console.error("Error al eliminar habitación:", error.message);
    return {
      success: false,
      message: error.message || "Error al eliminar la habitación"
    };
  }
};
