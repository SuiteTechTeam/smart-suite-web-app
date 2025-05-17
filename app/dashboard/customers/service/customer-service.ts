import { Customer } from '@/lib/models';
import { createClient } from '@/utils/supabase/client';

// Tipo para las respuestas del servicio
type ServiceResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

export const getCustomers = async (): Promise<ServiceResponse> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Error al obtener clientes:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Crea un nuevo cliente
 */
export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<ServiceResponse> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Error al crear cliente:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Actualiza un cliente existente
 */
export const updateCustomer = async (id: number, customer: Partial<Customer>): Promise<ServiceResponse> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Error al actualizar cliente:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Elimina un cliente
 */
export const deleteCustomer = async (id: number): Promise<ServiceResponse> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error al eliminar cliente:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
};