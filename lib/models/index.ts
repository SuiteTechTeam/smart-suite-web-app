// Definición de interfaces para las tablas de la base de datos

// Tabla inventory
export interface Inventory {
  id: number;
  name: string;
  type: string;
  unit_price: number;
  stock: number;
}

// Tabla rooms
export interface Room {
  id: number;
  customer_id: number;
  room_number: string;
  type: string;
  capacity: number;
  price: number;
  state: string;
}

// Tabla customers
export interface Customer {
  id: number;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  state: string;
}

// Tabla bookings
export interface Booking {
  id: number;
  customer_id: number;
  room_id: number;
  start_date: string; // Formato ISO para fechas
  end_date: string; // Formato ISO para fechas
  total_price: number;
  state: string;
}

// Tabla booking_inventory (tabla de relación)
export interface BookingInventory {
  booking_id: number;
  inventory_id: number;
  quantity: number;
}