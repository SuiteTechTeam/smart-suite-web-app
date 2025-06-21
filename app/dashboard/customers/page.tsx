"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusCircle, Users, CircleDollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
	getAllPayments,
	type PaymentCustomer,
} from "@/lib/services/customer-service";


import CustomerTable from "./components/CustomerTable";
import FilterBar from "./components/FilterBar";
import StatsPanel from "./components/StatsPanel";

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
				(p.guest?.email && p.guest.email.toLowerCase().includes(lowercaseFilter)),
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
		<main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
			<div className="flex items-center">
				<h1 className="font-semibold text-lg md:text-2xl">
					Pagos de Clientes
				</h1>
				<div className="ml-auto flex items-center gap-2">
					<Button onClick={handleNewPayment}>
						<PlusCircle className="h-4 w-4 mr-2" />
						Nuevo Pago
					</Button>
				</div>
			</div>

			<StatsPanel stats={stats} />

			<div className="flex flex-col gap-4">
				<FilterBar
					onFilterChange={setFilter}
					placeholder="Buscar por ID de pago, huésped o email..."
				/>
				<CustomerTable
					payments={filteredPayments}
					onEdit={handleEditPayment}
					loading={loading}
					error={error}
				/>
			</div>

		
		</main>
	);
}