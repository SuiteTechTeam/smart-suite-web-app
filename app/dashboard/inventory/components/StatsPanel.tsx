import { Inventory } from "@/types/interfaces";
import { StatCard } from "./StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Warehouse, AlertTriangle, DollarSign } from "lucide-react";

interface StatsPanelProps {
  inventory: Inventory[];
  stats: {
    totalItems: number;
    totalStock: number;
    lowStock: number;
    totalValue: number;
    averagePrice: number;
  };
  itemTypes: string[];
}

export const StatsPanel = ({ inventory, stats, itemTypes }: StatsPanelProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        title="Total Items" 
        value={stats.totalItems}
        description="Productos diferentes en el inventario"
        icon={<Package className="h-4 w-4 text-muted-foreground" />}
      />
      
      <StatCard 
        title="Total Stock" 
        value={stats.totalStock}
        description="Unidades totales disponibles"
        icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
      />
      
      <StatCard 
        title="Items con stock bajo" 
        value={stats.lowStock}
        description="Productos con menos de 10 unidades"
        icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
      />
      
      <StatCard 
        title="Precio Promedio" 
        value={`$${stats.averagePrice.toFixed(2)}`}
        description="Valor promedio por producto"
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      
      <StatCard 
        title="Valor Total" 
        value={`$${stats.totalValue.toFixed(2)}`}
        description="Valor total del inventario"
        icon={<DollarSign className="h-4 w-4 text-green-500" />}
      />
      
      <Card className="col-span-1 sm:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Distribución de Tipos</CardTitle>
          <CardDescription>
            Categorías de productos en inventario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {itemTypes.map(type => {
              const count = inventory.filter(item => item.type === type).length;
              const percentage = (count / inventory.length) * 100;
              
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{type}</span>
                    <span className="text-muted-foreground">{count} items ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 