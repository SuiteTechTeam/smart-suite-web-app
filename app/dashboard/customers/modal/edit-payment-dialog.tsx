"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, AlertCircle } from "lucide-react";
import { updatePayment, getAllGuests, type PaymentCustomer, type Guest } from "@/lib/services/customer-service";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    payment: PaymentCustomer | null;
}

export const EditPaymentDialog = ({
    open,
    onOpenChange,
    onSuccess,
    payment,
}: EditPaymentDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ guestId: '', finalAmount: '' });
    const [guests, setGuests] = useState<Guest[]>([]);
    const [isLoadingGuests, setIsLoadingGuests] = useState(false);

    // Fetch guests when dialog opens
    useEffect(() => {
        if (open) {
            fetchGuests();
            setError(null);
        }
    }, [open]);

    useEffect(() => {
        if (payment) {
            setFormData({
                guestId: String(payment.guestId),
                finalAmount: String(payment.finalAmount),
            });
        } else {
            setFormData({ guestId: '', finalAmount: '' });
        }
        setError(null);
    }, [payment, open]);

    const fetchGuests = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            setError("Error de autenticación.");
            return;
        }

        setIsLoadingGuests(true);
        const result = await getAllGuests(token);
        setIsLoadingGuests(false);

        if (result.success && result.data) {
            setGuests(result.data);
        } else {
            setError("Error al cargar la lista de huéspedes.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGuestChange = (value: string) => {
        setFormData(prev => ({ ...prev, guestId: value }));
    };

    const handleSubmit = async () => {
        if (!payment) {
            setError("No se encontró el pago a editar.");
            return;
        }

        const token = localStorage.getItem("auth_token");
        if (!token) {
            setError("Error de autenticación.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const paymentData = {
            id: payment.id, // Incluir el ID del pago para evitar "Payment customer ID mismatch"
            guestId: Number(formData.guestId),
            finalAmount: Number(formData.finalAmount),
        };

        if (isNaN(paymentData.guestId) || isNaN(paymentData.finalAmount)) {
            setError("Por favor, introduce valores numéricos válidos.");
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await updatePayment(payment.id, paymentData, token);
            
            setIsSubmitting(false);

            if (result.success) {
                onSuccess();
            } else {
                if (result.message?.includes("ID mismatch")) {
                    setError("Error de coincidencia de ID. Por favor, intente nuevamente.");
                } else {
                    setError(result.message || "Ocurrió un error al actualizar el pago.");
                }
            }
        } catch (err) {
            setIsSubmitting(false);
            setError("Error inesperado al actualizar el pago. Por favor, intente nuevamente.");
            console.error("Error al actualizar pago:", err);
        }
    };

    if (!payment) {
        return null;
    }

    // Find selected guest details
    const selectedGuest = guests.find(g => g.id === Number(formData.guestId));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-background">
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-primary/10">
                            <Edit className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Editar Pago #{payment.id}</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Modifica los detalles del pago seleccionado
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="px-6 py-4">
                    <div className="grid gap-5 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="guestId" className="text-sm font-medium">
                                Huésped
                            </Label>
                            <Select
                                value={formData.guestId}
                                onValueChange={handleGuestChange}
                                disabled={isSubmitting || isLoadingGuests}
                            >
                                <SelectTrigger className="w-full bg-background border-input">
                                    <SelectValue placeholder={isLoadingGuests ? "Cargando huéspedes..." : "Selecciona un huésped"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {guests.map((guest) => (
                                        <SelectItem key={guest.id} value={String(guest.id)}>
                                            {guest.name} {guest.surname} ({guest.email})
                                        </SelectItem>
                                    ))}
                                    {guests.length === 0 && !isLoadingGuests && (
                                        <SelectItem value="" disabled>
                                            No se encontraron huéspedes
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {payment.guest && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Huésped actual: {payment.guest.name} {payment.guest.surname} ({payment.guest.email})
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="finalAmount" className="text-sm font-medium">
                                Monto Final
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/.</span>
                                <Input
                                    id="finalAmount"
                                    name="finalAmount"
                                    type="number"
                                    value={formData.finalAmount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="pl-8"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        {error && (
                            <Alert variant="destructive" className="py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm ml-2">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
                <DialogFooter className="px-6 py-4 border-t bg-muted/30">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="gap-2">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || !formData.guestId || !formData.finalAmount}
                        className="gap-2"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditPaymentDialog;
