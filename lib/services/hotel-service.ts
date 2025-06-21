import { API_CONFIG, buildApiUrl } from "@/lib/config/api";
import type { ApiResult } from "./rooms-service"; // Reutilizamos el tipo ApiResult

export interface Hotel {
	id: number;
	ownerId: number;
	name: string;
	description: string;
	email: string;
	address: string;
	phone: string;
}

export async function createHotel(
	hotelData: Omit<Hotel, "id">,
	token: string,
): Promise<ApiResult<Hotel>> {
	try {
		const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.HOTELS.CREATE), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(hotelData),
		});
		if (!response.ok) {
			const errorText = await response.text();
			try {
				// Intenta parsear como JSON para obtener un mensaje de error estructurado
				const errorJson = JSON.parse(errorText);
				return { success: false, message: errorJson.message || errorText };
			} catch (e) {
				// Si no es JSON, devuelve el texto plano
				return { success: false, message: errorText };
			}
		}
		const data = await response.json();
		return { success: true, data };
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "Error al crear el hotel.",
		};
	}
}

export async function getHotelsByOwner(
	ownerId: number,
	token: string,
): Promise<ApiResult<Hotel[]>> {
	try {
		const url = buildApiUrl(
			API_CONFIG.ENDPOINTS.HOTELS.GET_BY_OWNER.replace("{ownerId}", String(ownerId)),
		);
		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		if (!response.ok) {
			// Si es 404, es probable que no tenga hoteles, lo cual no es un error fatal.
			if (response.status === 404) {
				return { success: true, data: [] };
			}
			const errorText = await response.text();
			return { success: false, message: errorText || `Error ${response.status}` };
		}
		const data = await response.json();
		return { success: true, data };
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "Error al obtener los hoteles.",
		};
	}
} 