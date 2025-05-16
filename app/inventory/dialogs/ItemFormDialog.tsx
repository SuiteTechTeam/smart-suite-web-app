import { Inventory } from "@/types/interfaces";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ItemFormDialogProps {
  title: string;
  description: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: Partial<Inventory & { customType?: string }>;
  setItem: (item: Partial<Inventory & { customType?: string }>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  buttonText?: string;
  availableTypes: string[];
}

export const ItemFormDialog = ({
  title,
  description,
  isOpen,
  onOpenChange,
  item,
  setItem,
  onSubmit,
  isSubmitting,
  buttonText = "Guardar",
  availableTypes
}: ItemFormDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nombre</Label>
            <Input
              id="name"
              value={item.name || ""}
              onChange={(e) => setItem({...item, name: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Tipo</Label>
            <Select 
              value={item.type || ""} 
              onValueChange={(value) => setItem({...item, type: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {item.type === "otro" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customType" className="text-right">Tipo personalizado</Label>
              <Input
                id="customType"
                value={item.customType || ""}
                onChange={(e) => setItem({...item, customType: e.target.value})}
                className="col-span-3"
              />
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Precio Unitario</Label>
            <div className="relative col-span-3">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
              <Input
                id="price"
                type="number"
                value={item.unit_price || ""}
                onChange={(e) => setItem({...item, unit_price: parseFloat(e.target.value)})}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">Stock</Label>
            <Input
              id="stock"
              type="number"
              value={item.stock || ""}
              onChange={(e) => setItem({...item, stock: parseInt(e.target.value)})}
              className="col-span-3"
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" type="button" onClick={() => setItem({
              name: "",
              type: "",
              unit_price: 0,
              stock: 0
            })}>
              Limpiar
            </Button>
            <Button 
              type="submit" 
              onClick={onSubmit}
              disabled={isSubmitting || !item.name || (!item.type || (item.type === "otro" && !item.customType))}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 