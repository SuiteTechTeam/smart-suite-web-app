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
import { Card, CardContent } from "@/components/ui/card";
import { CircleDollarSign, MoreHorizontal } from "lucide-react";
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
        return <div className="text-center py-10">Cargando pagos...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-destructive">Error: {error}</div>;
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID del Pago</TableHead>
                            <TableHead>Huésped</TableHead>
                            <TableHead>Monto Final</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length > 0 ? (
                            payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{payment.id}</TableCell>
                                    <TableCell>
                                        {payment.guest ? payment.guest.email : `ID: ${payment.guestId}`}
                                    </TableCell>
                                    <TableCell>S/.{payment.finalAmount.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onEdit(payment)}>
                                                    Editar Pago
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <CircleDollarSign size={32} className="mb-2" />
                                        <p>No se encontraron pagos.</p>
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