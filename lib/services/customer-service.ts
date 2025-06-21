import { API_CONFIG, buildApiUrl } from "@/lib/config/api";
import type { ApiResult } from "./rooms-service"; // Reusing ApiResult for consistency

// As there's a guestId, we can anticipate a Guest object.
export interface Guest {
    id: number;
    name: string;
    surname: string;
    email: string;
}

export interface PaymentCustomer {
    id: number;
    guestId: number;
    finalAmount: number;
    // Optional enriched data
    guest?: Guest;
    paymentDate?: string;
}

// Consistent API response handling
async function handleApiResponse<T>(response: Response): Promise<ApiResult<T>> {
    if (!response.ok) {
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            return { success: false, message: errorJson.message || errorJson.title || errorText };
        } catch {
            return { success: false, message: errorText || `Error HTTP ${response.status}` };
        }
    }
    // Handle cases with no content
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return { success: true, data: undefined };
    }
    try {
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, message: "Error al procesar la respuesta del servidor." };
    }
}

// Consistent error handling for caught exceptions
function handleApiError(error: any, defaultMessage: string): ApiResult<any> {
    return {
        success: false,
        message: error.message || defaultMessage,
    };
}

export async function getGuestById(guestId: number, token: string): Promise<ApiResult<Guest>> {
    try {
        // Use the correct endpoint for getting guest data
        const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.USER.GUESTS}/${guestId}`);
        const response = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        return handleApiResponse(response);
    } catch (error: any) {
        return handleApiError(error, "Error al obtener los datos del huésped.");
    }
}

export async function getAllPayments(token: string): Promise<ApiResult<PaymentCustomer[]>> {
    try {
        const url = buildApiUrl(API_CONFIG.ENDPOINTS.PAYMENT_CUSTOMER.GET_ALL);
        const response = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        
        const result = await handleApiResponse<PaymentCustomer[]>(response);
        
        if (result.success && result.data) {
            // Enrich payments with guest data
            const enrichedPayments = [];
            
            for (const payment of result.data) {
                try {
                    // Get guest data for this payment
                    const guestResult = await getGuestById(payment.guestId, token);
                    
                    if (guestResult.success && guestResult.data) {
                        // Add guest data to payment
                        enrichedPayments.push({
                            ...payment,
                            guest: guestResult.data
                        });
                    } else {
                        // Keep original payment if guest data couldn't be fetched
                        enrichedPayments.push(payment);
                    }
                } catch (error) {
                    // Keep original payment if there was an error
                    enrichedPayments.push(payment);
                }
            }
            
            return { success: true, data: enrichedPayments };
        }
        
        return result;
    } catch (error: any) {
        return handleApiError(error, "Error al obtener los pagos.");
    }
}

export async function getPaymentById(paymentCustomerId: number, token: string): Promise<ApiResult<PaymentCustomer>> {
    try {
        const url = buildApiUrl(API_CONFIG.ENDPOINTS.PAYMENT_CUSTOMER.GET_BY_ID.replace("{paymentCustomerId}", String(paymentCustomerId)));
        const response = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        return handleApiResponse(response);
    } catch (error: any) {
        return handleApiError(error, "Error al obtener el pago.");
    }
}

export async function getPaymentsByCustomer(customerId: number, token: string): Promise<ApiResult<PaymentCustomer[]>> {
    try {
        const url = buildApiUrl(API_CONFIG.ENDPOINTS.PAYMENT_CUSTOMER.GET_BY_CUSTOMER.replace("{customerId}", String(customerId)));
        const response = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        return handleApiResponse(response);
    } catch (error: any) {
        return handleApiError(error, "Error al obtener los pagos del cliente.");
    }
}

export async function createPayment(paymentData: { guestId: number; finalAmount: number }, token: string): Promise<ApiResult<PaymentCustomer>> {
    try {
        const url = buildApiUrl(API_CONFIG.ENDPOINTS.PAYMENT_CUSTOMER.CREATE);
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(paymentData),
        });
        return handleApiResponse(response);
    } catch (error: any) {
        return handleApiError(error, "Error al crear el pago.");
    }
}

export async function updatePayment(paymentCustomerId: number, paymentData: Partial<PaymentCustomer>, token: string): Promise<ApiResult<PaymentCustomer>> {
    try {
        const url = buildApiUrl(API_CONFIG.ENDPOINTS.PAYMENT_CUSTOMER.UPDATE.replace("{paymentCustomerId}", String(paymentCustomerId)));
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(paymentData),
        });
        return handleApiResponse(response);
    } catch (error: any) {
        return handleApiError(error, "Error al actualizar el pago.");
    }
}
