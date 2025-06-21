import { API_CONFIG, buildApiUrl } from "@/lib/config/api";
import type { ApiResult } from "./rooms-service";

export interface TypeRoom {
	id: number;
	description: string;
	price: number;
	hotelId: number;
}

export async function createTypeRoom(
	typeRoomData: Omit<TypeRoom, "id">,
	token: string,
): Promise<ApiResult<TypeRoom>> {
	try {
		const response = await fetch(
			buildApiUrl(API_CONFIG.ENDPOINTS.TYPEROOM.CREATE),
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(typeRoomData),
			},
		);
		if (!response.ok) {
			const errorText = await response.text();
			try {
				const errorJson = JSON.parse(errorText);
				return { success: false, message: errorJson.message || errorText };
			} catch (e) {
				return { success: false, message: errorText };
			}
		}
		const data = await response.json();
		return { success: true, data };
	} catch (error: any) {
		return {
			success: false,
			message: error.message || "Error al crear el tipo de habitación.",
		};
	}
}

export async function getTypeRoomsByHotel(
	hotelId: number,
	token: string,
): Promise<ApiResult<TypeRoom[]>> {
	try {
		const url = buildApiUrl(
			API_CONFIG.ENDPOINTS.TYPEROOM.GET_BY_HOTEL.replace("{hotelId}", String(hotelId)),
		);
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});
		if (!response.ok) {
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
			message: error.message || "Error al obtener los tipos de habitación.",
		};
	}
} 