"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusCircle, Users, CircleDollarSign, Wallet, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
	getAllPayments,
	type PaymentCustomer,
} from "@/lib/services/customer-service";

import CustomerTable from "./components/CustomerTable";
import FilterBar from "./components/FilterBar";
import StatsPanel from "./components/StatsPanel";
import AddPaymentDialog from "./modal/add-payment-dialogs";
import EditPaymentDialog from "./modal/edit-payment-dialog";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomersPage() {
	const { user } = useAuth();
	const [payments, setPayments] = useState<PaymentCustomer[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedPayment, setSelectedPayment] = useState<PaymentCustomer | null>(
		null,
	);

	const [filter, setFilter] = useState("");

	const fetchPayments = async () => {
		const token = localStorage.getItem("auth_token");
		if (!token) {
			setError("No se encontró el token de autenticación.");
			setLoading(false);
			return;
		}

		setLoading(true);
		const result = await getAllPayments(token);
		if (result.success) {
			setPayments(result.data ?? []);
		} else {
			setError(result.message ?? "Error al cargar los pagos.");
		}
		setLoading(false);
	};

	useEffect(() => {
		if (user) {
			fetchPayments();
		}
	}, [user]);

	const handleNewPayment = () => {
		setSelectedPayment(null);
		setIsFormOpen(true);
	};

	const handleEditPayment = (payment: PaymentCustomer) => {
		setSelectedPayment(payment);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		setIsFormOpen(false);
		fetchPayments(); // Recargar la lista de pagos
	};

	const filteredPayments = useMemo(() => {
		if (!filter) return payments;
		const lowercaseFilter = filter.toLowerCase();
		return payments.filter(
			p =>
				p.guestId.toString().includes(lowercaseFilter) ||
				p.id.toString().includes(lowercaseFilter) ||
				(p.guest?.email && p.guest.email.toLowerCase().includes(lowercaseFilter)) ||
				(p.guest?.name && p.guest.name.toLowerCase().includes(lowercaseFilter)) ||
				(p.guest?.surname && p.guest.surname.toLowerCase().includes(lowercaseFilter)),
		);
	}, [payments, filter]);

	const totalRevenue = useMemo(() => {
		return payments.reduce((sum, p) => sum + p.finalAmount, 0);
	}, [payments]);

	const stats = [
		{ title: "Total de Pagos", value: payments.length.toString(), icon: Users },
		{
			title: "Ingresos Totales",
			value: `S/.${totalRevenue.toLocaleString("es-ES", {
				minimumFractionDigits: 2,
			})}`,
			icon: CircleDollarSign,
		},
		{ title: "Pago Promedio", value: `S/.${(payments.length > 0 ? totalRevenue / payments.length : 0).toFixed(2)}`, icon: Wallet },
	];

	return (
		<main className="flex flex-1 flex-col gap-6 p-6 md:gap-8">
			<div className="flex flex-col gap-1">
				<div className="flex items-center">
					<div className="flex items-center gap-2">
						<div className="p-1.5 rounded-md bg-primary/10">
							<LayoutDashboard className="h-5 w-5 text-primary" />
						</div>
						<h1 className="font-semibold text-xl md:text-2xl">
							Pagos de Clientes
						</h1>
					</div>
					<div className="ml-auto flex items-center gap-2">
						<Button onClick={handleNewPayment} className="gap-1.5 shadow-sm">
							<PlusCircle className="h-4 w-4" />
							Nuevo Pago
						</Button>
					</div>
				</div>
				<p className="text-sm text-muted-foreground">
					Gestiona los pagos de los huéspedes de tu hotel
				</p>
			</div>

			<StatsPanel stats={stats} />

			<div className="flex flex-col gap-6">
				<Card className="border border-border/40 shadow-sm overflow-hidden">
					<CardContent className="p-4">
						<FilterBar
							onFilterChange={setFilter}
							placeholder="Buscar por ID, nombre, apellido o email del huésped..."
						/>
					</CardContent>
				</Card>
				
				<CustomerTable
					payments={filteredPayments}
					onEdit={handleEditPayment}
					loading={loading}
					error={error}
				/>
			</div>

			<AddPaymentDialog
				open={isFormOpen && !selectedPayment}
				onOpenChange={(open) => {
					if (!open) setIsFormOpen(false);
				}}
				onSuccess={handleFormSuccess}
			/>
			
			<EditPaymentDialog
				open={isFormOpen && !!selectedPayment}
				onOpenChange={(open) => {
					if (!open) setIsFormOpen(false);
				}}
				onSuccess={handleFormSuccess}
				payment={selectedPayment}
			/>
		</main>
	);
}