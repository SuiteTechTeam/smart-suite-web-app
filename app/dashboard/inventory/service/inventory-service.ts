import { Inventory, ServerActionResult } from "@/types/interfaces";
import { createClient } from "@/utils/supabase/client";


export const getInventoryItems = async (): Promise<ServerActionResult> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) throw error;
      
      return {
        success: true,
        message: "Inventario obtenido correctamente",
        data
      };
    } catch (error: any) {
      console.error("Error al obtener el inventario:", error.message);
      return {
        success: false,
        message: error.message || "Error al obtener el inventario"
      };
    }
  };
  
  export const createInventoryItem = async (item: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>): Promise<ServerActionResult> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('inventory')
        .insert([item])
        .select();
      
      if (error) throw error;
      
      return {
        success: true,
        message: "Elemento añadido correctamente",
        data: data[0]
      };
    } catch (error: any) {
      console.error("Error al crear elemento:", error.message);
      return {
        success: false,
        message: error.message || "Error al crear el elemento"
      };
    }
  };
  
  export const updateInventoryItem = async (id: number, item: Partial<Inventory>): Promise<ServerActionResult> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('inventory')
        .update(item)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      return {
        success: true,
        message: "Elemento actualizado correctamente",
        data: data[0]
      };
    } catch (error: any) {
      console.error("Error al actualizar elemento:", error.message);
      return {
        success: false,
        message: error.message || "Error al actualizar el elemento"
      };
    }
  };
  
  export const deleteInventoryItem = async (id: number): Promise<ServerActionResult> => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return {
        success: true,
        message: "Elemento eliminado correctamente"
      };
    } catch (error: any) {
      console.error("Error al eliminar elemento:", error.message);
      return {
        success: false,
        message: error.message || "Error al eliminar el elemento"
      };
    }
  };