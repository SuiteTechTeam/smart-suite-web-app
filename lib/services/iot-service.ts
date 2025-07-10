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

export interface IoTDevice {
  id: number;
  device_name: string;
  device_type: string;
  status: "active" | "inactive" | "maintenance";
  battery_level?: number;
  last_activity?: string;
  firmware_version?: string;
}

export interface RoomDevice {
  id: number;
  room_id: number;
  iot_device_id: number;
  device_location?: string;
  installation_date?: string;
  configuration?: any;
}

export interface NotificationHistory {
  id: number;
  room_id: number;
  device_id: number;
  message: string;
  notification_type: string;
  timestamp: string;
  is_read: boolean;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// IoT Devices
export async function getAllIoTDevices(token: string): Promise<ApiResult<IoTDevice[]>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.IOT.DEVICES.GET_ALL), {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    return await handleApiResponse<IoTDevice[]>(response);
  } catch (error: any) {
    return handleApiError(error, 'Error desconocido al cargar los dispositivos IoT');
  }
}

export async function getIoTDeviceById(id: number, token: string): Promise<ApiResult<IoTDevice>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.IOT.DEVICES.GET_BY_ID.replace("{id}", id.toString());
    const response = await fetch(buildApiUrl(endpoint), {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function createIoTDevice(device: Omit<IoTDevice, 'id'>, token: string): Promise<ApiResult<IoTDevice>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.IOT.DEVICES.CREATE), {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(device)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateIoTDevice(id: number, device: Partial<IoTDevice>, token: string): Promise<ApiResult<IoTDevice>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.IOT.DEVICES.UPDATE.replace("{id}", id.toString());
    const response = await fetch(buildApiUrl(endpoint), {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(device)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Room Devices
export async function getRoomDevicesByRoom(roomId: number, token: string): Promise<ApiResult<RoomDevice[]>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.IOT.ROOM_DEVICES.GET_BY_ROOM.replace("{roomId}", roomId.toString());
    const response = await fetch(buildApiUrl(endpoint), {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getRoomDevicesByIoTDevice(ioTDeviceId: number, token: string): Promise<ApiResult<RoomDevice[]>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.IOT.ROOM_DEVICES.GET_BY_IOT_DEVICE.replace("{ioTDeviceId}", ioTDeviceId.toString());
    const response = await fetch(buildApiUrl(endpoint), {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function createRoomDevice(roomDevice: Omit<RoomDevice, 'id'>, token: string): Promise<ApiResult<RoomDevice>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.IOT.ROOM_DEVICES.CREATE), {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(roomDevice)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Notification History
export async function getNotificationsByRoom(roomId: number, token: string): Promise<ApiResult<NotificationHistory[]>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.IOT.NOTIFICATIONS.GET_BY_ROOM.replace("{roomId}", roomId.toString());
    const response = await fetch(buildApiUrl(endpoint), {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function createNotification(notification: Omit<NotificationHistory, 'id'>, token: string): Promise<ApiResult<NotificationHistory>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.IOT.NOTIFICATIONS.CREATE), {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(notification)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Nuevas interfaces para el parsing mejorado de métricas
export interface SensorData {
  temp?: number;
  hum?: number;
  motion?: boolean;
  smoke?: number;
  servo1?: number;
  servo2?: number;
  stamp?: number;
}

export interface DeviceStatus {
  device_status?: string;
  battery?: string;
  signal?: string;
  last_seen?: string;
}

export interface IoTMetricData {
  id: number;
  registrationDate: string;
  roomDeviceId: number;
  type: 'sensor' | 'device_status';
  data: SensorData | DeviceStatus;
}

// Función para parsear ambos tipos de métricas
function parseMetric(metric: string): { type: 'sensor' | 'device_status'; data: SensorData | DeviceStatus } {
  if (metric.startsWith('device_status')) {
    const parts = metric.split(';');
    const data: DeviceStatus = {};
    parts.forEach(part => {
      const [key, value] = part.split(':');
      if (key && value !== undefined) {
        data[key as keyof DeviceStatus] = value;
      }
    });
    return { type: 'device_status', data };
  } else {
    const parts = metric.split(';');
    const data: SensorData = {};
    parts.forEach(part => {
      const [key, value] = part.split(':');
      if (key && value !== undefined) {
        // Conversión de tipos para datos de sensores
        if (key === 'temp' || key === 'hum' || key === 'smoke' || key === 'servo1' || key === 'servo2' || key === 'stamp') {
          (data as any)[key] = parseFloat(value);
        } else if (key === 'motion') {
          (data as any)[key] = value === 'true';
        }
      }
    });
    return { type: 'sensor', data };
  }
}

// Nueva función para obtener historial de notificaciones con parsing mejorado
export async function fetchNotificationHistoryByRoom(roomId: number, token: string): Promise<ApiResult<IoTMetricData[]>> {
  try {
    const response = await fetch(`https://smart-suite-web-service.azurewebsites.net/api/v1/io-t/notification-history/by-room/${roomId}`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: errorText };
    }
    
    const rawData = await response.json();
    const parsedData: IoTMetricData[] = rawData.map((item: any) => {
      const { type, data } = parseMetric(item.metric);
      return {
        id: item.id,
        registrationDate: item.registrationDate,
        roomDeviceId: item.roomDeviceId,
        type,
        data
      };
    });
    
    return { success: true, data: parsedData };
  } catch (error: any) {
    return handleApiError(error, 'Error al cargar el historial de notificaciones');
  }
}
