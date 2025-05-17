import { Customer } from "@/lib/models";
import { StatCard } from "./StatCard";
import { Users, UserCheck, UserMinus, UserCog } from "lucide-react";

interface StatsPanelProps {
  customers: Customer[];
}

export const StatsPanel = ({ customers }: StatsPanelProps) => {
  // Calcular estadísticas
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(customer => customer.state === "activo").length;
  const inactiveCustomers = customers.filter(customer => customer.state === "inactivo").length;
  const pendingCustomers = customers.filter(customer => customer.state === "pendiente").length;
  
  // Calcular porcentajes
  const activePercentage = totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0;
  const inactivePercentage = totalCustomers > 0 ? Math.round((inactiveCustomers / totalCustomers) * 100) : 0;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Clientes"
        value={totalCustomers}
        icon={Users}
        description="Número total de clientes registrados"
      />
      <StatCard
        title="Clientes Activos"
        value={activeCustomers}
        description={`${activePercentage}% del total de clientes`}
        icon={UserCheck}
        iconColor="text-green-500"
      />
      <StatCard
        title="Clientes Inactivos"
        value={inactiveCustomers}
        description={`${inactivePercentage}% del total de clientes`}
        icon={UserMinus}
        iconColor="text-destructive"
      />
      <StatCard
        title="Clientes Pendientes"
        value={pendingCustomers}
        icon={UserCog}
        iconColor="text-amber-500"
      />
    </div>
  );
};