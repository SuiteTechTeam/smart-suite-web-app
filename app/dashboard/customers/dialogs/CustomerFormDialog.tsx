import { Customer } from "@/lib/models";
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
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  customer: Partial<Customer>;
  setCustomer: (customer: Partial<Customer>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export const CustomerFormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  customer,
  setCustomer,
  onSubmit,
  isSubmitting,
  submitLabel,
}: CustomerFormDialogProps) => {
  // Manejar cambios en los campos del formulario
  const handleChange = (field: keyof Customer, value: string) => {
    setCustomer({ ...customer, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la empresa <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={customer.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nombre de la empresa"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">Nombre de contacto <span className="text-destructive">*</span></Label>
              <Input
                id="contact_name"
                value={customer.contact_name || ""}
                onChange={(e) => handleChange("contact_name", e.target.value)}
                placeholder="Nombre de la persona de contacto"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono <span className="text-destructive">*</span></Label>
              <Input
                id="phone"
                value={customer.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Número de teléfono"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customer.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Correo electrónico"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={customer.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Dirección completa"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Select
                value={customer.state || "activo"}
                onValueChange={(value) => handleChange("state", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isSubmitting ||
              !customer.name ||
              !customer.contact_name ||
              !customer.phone
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};