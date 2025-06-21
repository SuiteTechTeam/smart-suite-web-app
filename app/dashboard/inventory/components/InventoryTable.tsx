import { Inventory } from "@/types/interfaces";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Package } from "lucide-react";

interface InventoryTableProps {
  inventory: Inventory[];
  filteredInventory: Inventory[];
  totalValue: number;
  onEdit: (item: Inventory) => void;
  onDelete: (id: number) => void;
  resetFilters: () => void;
}

export const InventoryTable = ({ 
  inventory, 
  filteredInventory, 
  totalValue,
  onEdit, 
  onDelete,
  resetFilters
}: InventoryTableProps) => {
  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-300">
      <CardContent className="p-0">
        <Table>
          <TableCaption>
            {filteredInventory.length === 0 
              ? "No hay elementos que coincidan con la búsqueda" 
              : `Mostrando ${filteredInventory.length} de ${inventory.length} elementos`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Precio Unitario</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map(item => (                <TableRow key={item.id || Math.random()} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{item.id || "N/A"}</TableCell>
                  <TableCell>{item.name || "Sin nombre"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {item.type || "Desconocido"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    S/.{typeof item.unit_price === 'number' ? item.unit_price.toFixed(2) : "0.00"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={
                      !item.stock || item.stock < 10 
                        ? "bg-destructive hover:bg-destructive/90" 
                        : item.stock > 30 
                          ? "bg-green-500 hover:bg-green-600" 
                          : "bg-amber-500 hover:bg-amber-600"
                    }>
                      {item.stock || 0} {(!item.stock || item.stock === 1) ? "unidad" : "unidades"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    S/.{typeof item.unit_price === 'number' && typeof item.stock === 'number' 
                      ? (item.unit_price * item.stock).toFixed(2) 
                      : "0.00"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Acciones
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => onDelete(item.id)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package size={48} className="mb-2 opacity-30" />
                    <p>No hay elementos que coincidan con los criterios</p>
                    <Button 
                      variant="link" 
                      onClick={resetFilters}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Productos totales: <strong>{inventory.length}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Valor total: <strong>S/.{totalValue.toFixed(2)}</strong>
        </p>
      </CardFooter>
    </Card>
  );
}; 