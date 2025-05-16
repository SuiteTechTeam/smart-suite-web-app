export interface Inventory {
  id: number;
  name: string;
  type: string;
  unit_price: number;
  stock: number;
}

export interface Room {
  id: number;
  customer_id: number;
  room_number: string;
  type: string;
  capacity: number;
  price: number;
  state: string;
}

export interface Customer {
  id: number;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  state: string;
}

export interface Booking {
  id: number;
  customer_id: number;
  room_id: number;
  start_date: string; 
  end_date: string;   
  total_price: number;
  state: string;
}

export interface BookingInventory {
  booking_id: number;
  inventory_id: number;
  quantity: number;
}

export interface UserRole {
  role: {
    role: string;
  };
}

export interface User {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  users_roles: {
    roles: {
      role: string;
    };
  }[];
}
//no esta, no funcionara dx
export interface Profile {
  username: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  address: string | null;
  district: number | null;
}

export interface SupabaseResponse<T> {
  data: T[] | null;
  error: Error | null;
}

// Interfaces para las acciones de servidor
export interface ServerActionResult {
  success: boolean;
  message: string;
  data?: any;
} 