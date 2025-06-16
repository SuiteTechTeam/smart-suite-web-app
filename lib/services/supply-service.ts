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
export async function getAllSupplies(token: string): Promise<ApiResult<Supply[]>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUPPLY.GET_ALL), {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    return await handleApiResponse<Supply[]>(response);
  } catch (error: any) {
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
