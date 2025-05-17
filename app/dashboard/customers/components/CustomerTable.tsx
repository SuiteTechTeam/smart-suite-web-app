import { Customer } from "@/lib/models";
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
import { User } from "lucide-react";

interface CustomerTableProps {
  customers: Customer[];
  filteredCustomers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
  resetFilters: () => void;
}

export const CustomerTable = ({ 
  customers, 
  filteredCustomers, 
  onEdit, 
  onDelete,
  resetFilters
}: CustomerTableProps) => {
  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-300">
      <CardContent className="p-0">
        <Table>
          <TableCaption>
            {filteredCustomers.length === 0 
              ? "No hay clientes que coincidan con la búsqueda" 
              : `Mostrando ${filteredCustomers.length} de ${customers.length} clientes`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => (
                <TableRow key={customer.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.contact_name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={customer.address}>
                    {customer.address}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      customer.state === "activo" 
                        ? "bg-green-500 hover:bg-green-600" 
                        : customer.state === "inactivo"
                          ? "bg-destructive hover:bg-destructive/90"
                          : "bg-amber-500 hover:bg-amber-600"
                    }>
                      {customer.state}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => onEdit(customer)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(customer.id)}
                          className="text-destructive focus:text-destructive"
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
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <User size={32} className="mb-2" />
                    <p>No se encontraron clientes</p>
                    {(customers.length > 0) && (
                      <Button 
                        variant="link" 
                        onClick={resetFilters}
                        className="mt-2"
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};