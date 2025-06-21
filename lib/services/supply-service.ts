import { API_CONFIG, buildApiUrl } from "@/lib/config/api";

// Lista de estados válidos para los suministros
const VALID_SUPPLY_STATES = ["active", "inactive", "discontinued", "pending", "out_of_stock"];

// Helper function para normalizar y validar los datos
function normalizeData<T>(data: any): T {
  if (!data) return data;
  
  // Si es un suministro, validar los campos
  if (data.hasOwnProperty('state') && typeof data.state === 'string') {
    const lowerCaseState = data.state.toLowerCase();
    // Normalizar el estado si no es válido
    if (VALID_SUPPLY_STATES.includes(lowerCaseState)) {
      data.state = lowerCaseState; // Normalizar a minúsculas si es válido
    } else {
      console.warn(`Estado de suministro inválido: "${data.state}", cambiando a "active"`);
      data.state = "active";
    }
  }
  
  // Asegurarse de que price y stock sean números
  if (data.hasOwnProperty('price') && (data.price === null || isNaN(Number(data.price)))) {
    console.warn(`Precio inválido para ${data.name || 'suministro'}: ${data.price}, cambiando a 0`);
    data.price = 0;
  }
  
  if (data.hasOwnProperty('stock') && (data.stock === null || isNaN(Number(data.stock)))) {
    console.warn(`Stock inválido para ${data.name || 'suministro'}: ${data.stock}, cambiando a 0`);
    data.stock = 0;
  }
  
  return data as T;
}

// Helper function para manejar respuestas de la API de manera consistente
async function handleApiResponse<T>(response: Response): Promise<ApiResult<T>> {
  if (!response.ok) {
    const errorText = await response.text();
    return { 
      success: false, 
      message: errorText || `Error HTTP ${response.status}: ${response.statusText}` 
    };
  }
  
  try {
    const data = await response.json();
    
    // Si esperamos un array, validamos que sea un array
    if (Array.isArray(data)) {
      // Validar y normalizar cada elemento del array
      const normalizedData = data.map(item => normalizeData(item));
      return { success: true, data: normalizedData as T };
    }
    
    // Si es un solo objeto, normalizarlo
    if (data && typeof data === 'object') {
      return { success: true, data: normalizeData(data) as T };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Error parsing API response:", error);
    return { 
      success: false, 
      message: "Error al procesar la respuesta del servidor" 
    };
  }
}

// Helper function para manejar errores de catch de manera consistente
function handleApiError(error: any, defaultMessage: string): ApiResult<any> {
  return { 
    success: false, 
    message: error.message || defaultMessage 
  };
}

export interface Supply {
  id: number;
  providerId: number;
  hotelId: number;
  name: string;
  price: number;
  stock: number;
  state: string;
}

export interface SupplyRequest {
  id: number;
  paymentOwnerId: number;
  supplyId: number;
  count: number;
  amount: number;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Supply Management
export async function getAllSupplies(token: string, hotelId: number = 1): Promise<ApiResult<Supply[]>> {
  try {
    if (!token) {
      return {
        success: false,
        message: "No se proporcionó token de autenticación"
      };
    }

    // Construir URL con el parámetro hotelId
    const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.SUPPLY.GET_ALL)}?hotelId=${hotelId}`;
    console.log(`Fetching supplies for hotelId: ${hotelId}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supplies API error response:', errorText);
      return { 
        success: false, 
        message: "No se pudieron cargar los suministros" 
      };
    }
    
    try {
      const data = await response.json();
      
      // Validar que sea un array
      if (!data || !Array.isArray(data)) {
        console.error('API returned invalid data format for supplies', data);
        return {
          success: false,
          message: "Formato de datos inválido recibido del servidor"
        };
      }
      
      // Normalizar cada suministro
      const normalizedSupplies = data.map(supply => normalizeData<Supply>(supply));
      return { success: true, data: normalizedSupplies };
      
    } catch (error) {
      console.error('Error parsing supplies data:', error);
      return {
        success: false,
        message: "Error al procesar los datos de suministros"
      };
    }
  } catch (error: any) {
    console.error('Error loading supplies:', error);
    return handleApiError(error, 'Error desconocido al cargar los suministros');
  }
}

export async function getSupplyById(id: number, token: string): Promise<ApiResult<Supply>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.SUPPLY.GET_BY_ID.replace("{id}", id.toString());
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

export async function getSuppliesByProvider(providerId: number, token: string): Promise<ApiResult<Supply[]>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.SUPPLY.GET_BY_PROVIDER.replace("{providerId}", providerId.toString());
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

export async function createSupply(supply: Omit<Supply, 'id'>, token: string): Promise<ApiResult<Supply>> {
  try {
    console.log('Creating supply with data:', supply); // Debug log
    console.log('API endpoint:', buildApiUrl(API_CONFIG.ENDPOINTS.SUPPLY.CREATE)); // Debug log
    
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUPPLY.CREATE), {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(supply)
    });
    
    console.log('Create supply response status:', response.status); // Debug log
    console.log('Create supply response headers:', Object.fromEntries(response.headers.entries())); // Debug log
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create supply error response:', errorText); // Debug log
      
      // Intentar parsear el error como JSON para obtener más detalles
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Create supply error JSON:', errorJson); // Debug log
        return { success: false, message: errorJson.message || errorJson.error || errorText };
      } catch {
        return { success: false, message: errorText || `Error HTTP ${response.status}: ${response.statusText}` };
      }
    }
    
    const data = await response.json();
    console.log('Create supply success response:', data); // Debug log
    return { success: true, data };
  } catch (error: any) {
    console.error('Create supply catch error:', error); // Debug log
    return { success: false, message: error.message || 'Error desconocido al crear el suministro' };
  }
}

export async function updateSupply(id: number, supply: Partial<Supply>, token: string): Promise<ApiResult<Supply>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.SUPPLY.UPDATE.replace("{id}", id.toString());
    const response = await fetch(buildApiUrl(endpoint), {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(supply)
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

// Supply Request Management
export async function createSupplyRequest(request: Omit<SupplyRequest, 'id'>, token: string): Promise<ApiResult<SupplyRequest>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUPPLY_REQUEST.CREATE), {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
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

export async function getSupplyRequestsByHotel(hotelId: number, token: string): Promise<ApiResult<SupplyRequest[]>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.SUPPLY_REQUEST.GET_BY_HOTEL.replace("{hotelId}", hotelId.toString());
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

export async function getSupplyRequestById(id: number, token: string): Promise<ApiResult<SupplyRequest>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.SUPPLY_REQUEST.GET_BY_ID.replace("{id}", id.toString());
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

export async function getSupplyRequestsByPaymentOwner(paymentOwnerId: number, token: string): Promise<ApiResult<SupplyRequest[]>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.SUPPLY_REQUEST.GET_BY_PAYMENT_OWNER.replace("{paymentOwnerId}", paymentOwnerId.toString());
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

export async function getSupplyRequestsBySupply(supplyId: number, token: string): Promise<ApiResult<SupplyRequest[]>> {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.SUPPLY_REQUEST.GET_BY_SUPPLY.replace("{supplyId}", supplyId.toString());
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
