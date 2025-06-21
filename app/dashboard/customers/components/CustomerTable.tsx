import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, MoreHorizontal, Edit } from "lucide-react";
import type { PaymentCustomer } from "@/lib/services/customer-service";

interface CustomerTableProps {
    payments: PaymentCustomer[];
    onEdit: (payment: PaymentCustomer) => void;
    // onDelete: (id: number) => void; // Podemos añadirlo después si es necesario
    loading: boolean;
    error: string | null;
}

export const CustomerTable = ({
    payments,
    onEdit,
    loading,
    error,
}: CustomerTableProps) => {

    if (loading) {
        return (
            <Card className="border border-border/40 shadow-sm">
                <CardContent className="p-6 flex justify-center items-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                        <p className="text-muted-foreground">Cargando pagos...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border border-destructive/20 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col items-center gap-2 text-destructive">
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 px-6 py-4">
                <CardTitle className="text-lg font-medium">Registro de Pagos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-muted/30">
                            <TableHead className="font-medium">ID del Pago</TableHead>
                            <TableHead className="font-medium">Huésped</TableHead>
                            <TableHead className="font-medium">Monto Final</TableHead>
                            <TableHead className="text-right font-medium">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length > 0 ? (
                            payments.map((payment) => (
                                <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">{payment.id}</TableCell>
                                    <TableCell>
                                        {payment.guest ? (
                                            <div className="flex flex-col">
                                                <span>{payment.guest.email}</span>
                                                {payment.guest.name && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {payment.guest.name} {payment.guest.surname}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">ID: {payment.guestId}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-primary">
                                            S/.{payment.finalAmount.toFixed(2)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onEdit(payment)} className="cursor-pointer">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar Pago
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <CircleDollarSign size={36} className="mb-2 opacity-30" />
                                        <p className="font-medium">No se encontraron pagos</p>
                                        <p className="text-sm">Crea un nuevo pago usando el botón "Nuevo Pago"</p>
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

export default CustomerTable;