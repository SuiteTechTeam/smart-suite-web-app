"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getHotelsByOwner, type Hotel } from "@/lib/services/hotel-service";
import {
	getTypeRoomsByHotel,
	type TypeRoom,
} from "@/lib/services/typeroom-service";
import { TypeRoomFormDialog } from "@/components/dialogs/TypeRoomFormDialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

export default function HotelManagementPage() {
	const { user } = useAuth();
	const [hotel, setHotel] = useState<Hotel | null>(null);
	const [typeRooms, setTypeRooms] = useState<TypeRoom[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isTypeRoomFormOpen, setIsTypeRoomFormOpen] = useState(false);

	useEffect(() => {
		const loadInitialData = async () => {
			if (user && user.roleId === "1") {
				const token = localStorage.getItem("auth_token");
				if (!token) {
					toast.error("Error de autenticación.");
					setIsLoading(false);
					return;
				}

				// 1. Cargar el hotel del owner
				const hotelResult = await getHotelsByOwner(Number(user.id), token);
				if (hotelResult.success && hotelResult.data && hotelResult.data.length > 0) {
					const currentHotel = hotelResult.data[0];
					setHotel(currentHotel);

					// 2. Cargar los tipos de habitación de ese hotel
					const typeRoomResult = await getTypeRoomsByHotel(
						currentHotel.id,
						token,
					);
					if (typeRoomResult.success && typeRoomResult.data) {
						setTypeRooms(typeRoomResult.data);
					}
				}
			}
			setIsLoading(false);
		};

		loadInitialData();
	}, [user]);

	const handleTypeRoomCreated = (newTypeRoom: TypeRoom) => {
		setTypeRooms(prev => [...prev, newTypeRoom]);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!hotel) {
		return (
			<div className="text-center">
				<p>No se encontró un hotel asociado a su cuenta.</p>
				<p className="text-sm text-muted-foreground">
					Por favor, cree un hotel desde el dashboard principal.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{hotel.name}</CardTitle>
					<CardDescription>{hotel.description}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					<p>
						<strong>Email:</strong> {hotel.email}
					</p>
					<p>
						<strong>Dirección:</strong> {hotel.address}
					</p>
					<p>
						<strong>Teléfono:</strong> {hotel.phone}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>Tipos de Habitación</CardTitle>
						<CardDescription>
							Gestione los tipos de habitación disponibles en su hotel.
						</CardDescription>
					</div>
					<Button onClick={() => setIsTypeRoomFormOpen(true)}>
						<PlusCircle className="mr-2 h-4 w-4" /> Añadir Tipo
					</Button>
				</CardHeader>
				<CardContent>
					{typeRooms.length > 0 ? (
						<ul className="divide-y">
							{typeRooms.map(tr => (
								<li
									key={tr.id}
									className="flex justify-between items-center p-3"
								>
									<span className="font-medium">{tr.description}</span>
									<span className="text-lg font-semibold">
										${tr.price.toFixed(2)}
									</span>
								</li>
							))}
						</ul>
					) : (
						<p className="text-center text-muted-foreground py-4">
							Aún no hay tipos de habitación. ¡Añada el primero!
						</p>
					)}
				</CardContent>
			</Card>

			<TypeRoomFormDialog
				open={isTypeRoomFormOpen}
				onOpenChange={setIsTypeRoomFormOpen}
				onTypeRoomCreated={handleTypeRoomCreated}
				hotelId={hotel.id}
			/>
		</div>
	);
} 