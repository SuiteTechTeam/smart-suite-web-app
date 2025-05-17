"use server";

import { createClient } from "@/utils/supabase/server";
import { ServerActionResult } from "@/types/interfaces";
import { revalidatePath } from "next/cache";

export interface Room {
  id: number;
  name: string;
  floor: number;
  status: "occupied" | "vacant" | "maintenance";
  type: string;
  capacity: number;
  price: number;
  devices: string[];
  last_cleaned?: string;
  notes?: string;
}

export const getRooms = async (): Promise<ServerActionResult> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Convertir los campos a la estructura esperada por el frontend
    const mappedData = data.map(room => ({
      ...room,
      lastCleaned: room.last_cleaned,
    }));

    return {
      success: true,
      message: "Habitaciones obtenidas correctamente",
      data: mappedData
    };
  } catch (error: any) {
    console.error("Error al obtener las habitaciones:", error.message);
    return {
      success: false,
      message: error.message || "Error al obtener las habitaciones"
    };
  }
};

export const createRoom = async (room: Omit<Room, 'id'>): Promise<ServerActionResult> => {
  try {
    const supabase = await createClient();
    
    // Convertir los campos a la estructura de la base de datos
    const roomData = {
      name: room.name,
      floor: room.floor,
      status: room.status,
      type: room.type,
      capacity: room.capacity,
      price: room.price,
      devices: room.devices,
      last_cleaned: room.lastCleaned,
      notes: room.notes
    };
    
    const { data, error } = await supabase
      .from('rooms')
      .insert([roomData])
      .select();
    
    if (error) {
      throw error;
    }
    
    revalidatePath('/dashboard/rooms');
    
    return {
      success: true,
      message: "Habitación añadida correctamente",
      data: data[0]
    };
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
    const supabase = await createClient();
    
    // Convertir los campos a la estructura de la base de datos
    const roomData: any = {};
    
    if (room.name !== undefined) roomData.name = room.name;
    if (room.floor !== undefined) roomData.floor = room.floor;
    if (room.status !== undefined) roomData.status = room.status;
    if (room.type !== undefined) roomData.type = room.type;
    if (room.capacity !== undefined) roomData.capacity = room.capacity;
    if (room.price !== undefined) roomData.price = room.price;
    if (room.devices !== undefined) roomData.devices = room.devices;
    if (room.lastCleaned !== undefined) roomData.last_cleaned = room.lastCleaned;
    if (room.notes !== undefined) roomData.notes = room.notes;
    
    const { data, error } = await supabase
      .from('rooms')
      .update(roomData)
      .eq('id', id)
      .select();
    
    if (error) {
      throw error;
    }
    
    revalidatePath('/dashboard/rooms');
    
    return {
      success: true,
      message: "Habitación actualizada correctamente",
      data: data[0]
    };
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
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    revalidatePath('/dashboard/rooms');
    
    return {
      success: true,
      message: "Habitación eliminada correctamente"
    };
  } catch (error: any) {
    console.error("Error al eliminar habitación:", error.message);
    return {
      success: false,
      message: error.message || "Error al eliminar la habitación"
    };
  }
};
