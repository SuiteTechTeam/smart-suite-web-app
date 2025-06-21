"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createTypeRoom, type TypeRoom } from "@/lib/services/typeroom-service";

interface TypeRoomFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onTypeRoomCreated: (newTypeRoom: TypeRoom) => void;
	hotelId: number;
}

export function TypeRoomFormDialog({
	open,
	onOpenChange,
	onTypeRoomCreated,
	hotelId,
}: TypeRoomFormDialogProps) {
	const [formData, setFormData] = useState({
		description: "",
		price: 0,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === "number" ? parseFloat(value) || 0 : value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!hotelId) {
			toast.error("No se ha seleccionado un hotel.");
			return;
		}
		setIsSubmitting(true);

		const token = localStorage.getItem("auth_token");
		if (!token) {
			toast.error("Error de autenticación. Por favor, inicie sesión de nuevo.");
			setIsSubmitting(false);
			return;
		}

		try {
			const result = await createTypeRoom(
				{ ...formData, hotelId },
				token,
			);
			if (result.success && result.data) {
				toast.success("¡Tipo de habitación creado con éxito!");
				onTypeRoomCreated(result.data);
				onOpenChange(false);
				setFormData({ description: "", price: 0 }); // Reset form
			} else {
				toast.error(result.message || "No se pudo crear el tipo de habitación.");
			}
		} catch (error: any) {
			toast.error(error.message || "Ocurrió un error inesperado.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Crear Tipo de Habitación</DialogTitle>
					<DialogDescription>
						Añada un nuevo tipo de habitación para su hotel, como "Doble",
						"Individual" o "Suite".
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="description" className="text-right">
								Descripción
							</Label>
							<Input
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								className="col-span-3"
								placeholder="Ej: Suite Presidencial"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="price" className="text-right">
								Precio
							</Label>
							<Input
								id="price"
								name="price"
								type="number"
								value={formData.price}
								onChange={handleChange}
								className="col-span-3"
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Creando..." : "Crear Tipo"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
} 