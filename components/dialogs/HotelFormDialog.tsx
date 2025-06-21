"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createHotel, type Hotel } from "@/lib/services/hotel-service";

interface HotelFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onHotelCreated: (newHotel: Hotel) => void;
	ownerId: number;
}

export function HotelFormDialog({
	open,
	onOpenChange,
	onHotelCreated,
	ownerId,
}: HotelFormDialogProps) {
	const initialFormState = {
		name: "",
		description: "",
		email: "",
		address: "",
		phone: "",
	};
	const [formData, setFormData] = useState(initialFormState);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		// Reset form state when the dialog is opened
		if (open) {
			setFormData(initialFormState);
		}
	}, [open]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		const token = localStorage.getItem("auth_token");
		if (!token) {
			toast.error("Error de autenticación. Por favor, inicie sesión de nuevo.");
			setIsSubmitting(false);
			return;
		}

		try {
			const result = await createHotel({ ...formData, ownerId }, token);
			if (result.success && result.data) {
				toast.success("¡Hotel creado con éxito!");
				onHotelCreated(result.data);
				onOpenChange(false);
			} else {
				toast.error(result.message || "No se pudo crear el hotel.");
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
					<DialogTitle>Crear Nuevo Hotel</DialogTitle>
					<DialogDescription>
						Complete los detalles de su nuevo hotel. Este será el primer paso
						para configurar su espacio.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Nombre
							</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="description" className="text-right">
								Descripción
							</Label>
							<Textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="email" className="text-right">
								Email
							</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleChange}
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="address" className="text-right">
								Dirección
							</Label>
							<Input
								id="address"
								name="address"
								value={formData.address}
								onChange={handleChange}
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="phone" className="text-right">
								Teléfono
							</Label>
							<Input
								id="phone"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
								className="col-span-3"
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Creando..." : "Crear Hotel"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
} 