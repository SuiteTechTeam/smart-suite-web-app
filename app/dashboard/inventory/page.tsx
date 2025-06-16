"use client";

import { useState, useEffect, useMemo } from "react";
import { Supply, Provider } from "@/types/interfaces";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, PlusCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

import { FilterBar } from "./components/FilterBar";
import { InventoryTable } from "./components/InventoryTable";
import { StatsPanel } from "./components/StatsPanel";
import { ItemFormDialog } from "./dialogs/ItemFormDialog";
import { toast } from "sonner";
import { getAllSupplies, createSupply, updateSupply } from "@/lib/services/supply-service";
import { getAllProviders } from "@/lib/services/providers-service";

// Función para convertir Supply a formato compatible con la UI existente
const convertSupplyToInventory = (supply: Supply) => ({
  id: supply.id,
  name: supply.name,
  type: supply.state, // Usamos el estado como tipo por ahora
  unit_price: supply.price,
  stock: supply.stock
});

// Función para convertir datos de la UI a Supply
const convertInventoryToSupply = (item: any, user: any = null): Omit<Supply, 'id'> => {
  // Simplificar y usar valores que probablemente funcionen
  const supplyData = {
    providerId: Number(item.providerId || 1), // Ahora viene del formulario
    hotelId: 1,    // Valor fijo simple
    name: String(item.name || '').trim(),
    price: Number(item.unit_price || item.price || 0),
    stock: Number(item.stock || 0),
    state: String(item.state || "active") // Ahora viene del formulario
  };
  
  // Validar que todos los campos requeridos estén presentes
  if (!supplyData.name) {
    throw new Error('El nombre es requerido');
  }
  
  console.log('Converting to supply data:', supplyData); // Debug log
  return supplyData;
};

// Estados disponibles para los suministros
const SUPPLY_STATES = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "discontinued", label: "Descontinuado" },
  { value: "pending", label: "Pendiente" },
  { value: "out_of_stock", label: "Sin stock" }
];

export default function InventoryPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [newItem, setNewItem] = useState<any>({
    name: "",
    type: "",
    unit_price: 0,
    stock: 0,
    providerId: "",
    state: "active"
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
    // Obtener suministros del backend
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("No hay token de autenticación");
        return;
      }

      const result = await getAllSupplies(token);
      if (result.success && result.data) {
        // Convertir los datos de Supply al formato esperado por la UI
        const convertedData = result.data.map(convertSupplyToInventory);
        setInventory(convertedData);
      } else {
        toast.error(result.message || "No se pudo obtener el inventario");
      }
    } catch (error: any) {
      toast.error("Error al cargar el inventario: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener proveedores del backend
  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return;
      }

      const result = await getAllProviders(token);
      if (result.success && result.data) {
        setProviders(result.data);
      } else {
        console.error("Error al cargar proveedores:", result.message);
      }
    } catch (error: any) {
      console.error("Error al cargar proveedores:", error.message);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchInventory(),
        fetchProviders()
      ]);
    };
    
    loadData();
  }, []);
  
  // Extraer todos los tipos únicos para el filtro
  const itemTypes = useMemo(() => {
    return [...new Set(inventory.map(item => item.type))].sort();
  }, [inventory]);
  
  // Filtrar inventario por búsqueda y filtros
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesType = !filterType || item.type === filterType;
      
      const matchesStock = !filterStock || 
        (filterStock === "low" && item.stock < 10) ||
        (filterStock === "normal" && item.stock >= 10 && item.stock < 30) ||
        (filterStock === "high" && item.stock >= 30);
        
      return matchesSearch && matchesType && matchesStock;
    });
  }, [inventory, searchTerm, filterType, filterStock]);  // Añadir nuevo elemento al inventario
  const handleAddItem = async () => {
    if (!newItem.name || (!newItem.type || (newItem.type === "otro" && !newItem.customType))) return;
    if (!newItem.providerId) {
      toast.error("Debe seleccionar un proveedor");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("No hay token de autenticación");
        return;
      }      const finalType = newItem.type === "otro" ? newItem.customType : newItem.type;
      
      let supplyData;
      try {
        supplyData = convertInventoryToSupply({
          ...newItem,
          type: finalType
        }, user);
      } catch (conversionError: any) {
        toast.error(conversionError.message);
        return;
      }
      
      // Validar que los datos requeridos estén presentes
      if (!supplyData.name) {
        toast.error("El nombre es requerido");
        return;
      }
      if (supplyData.price < 0) {
        toast.error("El precio no puede ser negativo");
        return;
      }
      if (supplyData.stock < 0) {
        toast.error("El stock no puede ser negativo");
        return;
      }
      
      console.log('Sending supply data to API:', supplyData); // Debug log
      
      const result = await createSupply(supplyData, token);
      
      if (result.success) {
        await fetchInventory();        setNewItem({
          name: "",
          type: "",
          unit_price: 0,
          stock: 0,
          providerId: "",
          state: "active"
        });
        setIsAddDialogOpen(false);
        toast.success("El elemento ha sido añadido correctamente");
      } else {
        toast.error(result.message || "No se pudo añadir el elemento");
      }
    } catch (error: any) {
      toast.error("Error al añadir el elemento: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Abrir diálogo de edición
  const handleOpenEditDialog = (item: any) => {
    setItemToEdit({...item});
    setIsEditDialogOpen(true);
  };
  
  // Guardar cambios de edición
  const handleSaveEdit = async () => {
    if (!itemToEdit) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("No hay token de autenticación");
        return;
      }

      const finalType = itemToEdit.type === "otro" ? itemToEdit.customType : itemToEdit.type;
      const supplyData = {
        name: itemToEdit.name,
        price: itemToEdit.unit_price || itemToEdit.price,
        stock: itemToEdit.stock,
        state: finalType
      };
      
      const result = await updateSupply(itemToEdit.id, supplyData, token);
      
      if (result.success) {
        await fetchInventory();
        setIsEditDialogOpen(false);
        setItemToEdit(null);
        toast.success("El elemento ha sido actualizado correctamente");
      } else {
        toast.error(result.message || "No se pudo actualizar el elemento");
      }
    } catch (error: any) {
      toast.error("Error al actualizar el elemento: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar ítem
  const handleDeleteItem = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("No hay token de autenticación");
        return;
      }

      // Nota: Como no hay endpoint de DELETE para Supply, actualizamos el estado a 'deleted'
      const result = await updateSupply(id, { state: 'deleted' }, token);
      
      if (result.success) {
        // Actualizar el estado local filtrando el elemento eliminado
        setInventory(inventory.filter(item => item.id !== id));
        toast.success("El elemento ha sido eliminado correctamente");
      } else {
        toast.error(result.message || "No se pudo eliminar el elemento");
      }
    } catch (error: any) {
      toast.error("Error al eliminar el elemento: " + error.message);
    }
  };

  // Obtener estadísticas del inventario
  const inventoryStats = useMemo(() => ({
    totalItems: inventory.length,
    totalStock: inventory.reduce((sum, item) => sum + item.stock, 0),
    lowStock: inventory.filter(item => item.stock < 10).length,
    totalValue: inventory.reduce((sum, item) => sum + item.unit_price * item.stock, 0),
    averagePrice: inventory.length ? 
      inventory.reduce((sum, item) => sum + item.unit_price, 0) / inventory.length : 0
  }), [inventory]);

  // Restablecer filtros
  const resetFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setFilterStock("");
  };

  // Mostrar spinner de carga mientras se obtienen los datos
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Inventario</h1>
          <p className="text-muted-foreground">Gestiona los productos y recursos del hotel</p>
        </div>
        
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PlusCircle size={16} />
          <span>Añadir Item</span>
        </Button>
      </div>

      {inventoryStats.lowStock > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>¡Atención!</AlertTitle>
          <AlertDescription>
            Hay {inventoryStats.lowStock} productos con stock bajo (menos de 10 unidades). Revisa el inventario.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="list" className="mb-8">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <span>Lista de Productos</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <span>Estadísticas</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <div className="grid gap-6">
            <FilterBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              filterStock={filterStock}
              setFilterStock={setFilterStock}
              itemTypes={itemTypes}
            />
            
            <InventoryTable 
              inventory={inventory}
              filteredInventory={filteredInventory}
              totalValue={inventoryStats.totalValue}
              onEdit={handleOpenEditDialog}
              onDelete={handleDeleteItem}
              resetFilters={resetFilters}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="stats">
          <StatsPanel 
            inventory={inventory}
            stats={inventoryStats}
            itemTypes={itemTypes}
          />
        </TabsContent>
      </Tabs>
        {/* Diálogo para añadir item */}
      <ItemFormDialog
        title="Añadir Nuevo Item"
        description="Ingresa los detalles del nuevo producto para el inventario"
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        item={newItem}
        setItem={setNewItem}
        onSubmit={handleAddItem}
        isSubmitting={isSubmitting}
        availableTypes={itemTypes}
        providers={providers}
        supplyStates={SUPPLY_STATES}
      />
      
      {/* Diálogo para editar item */}
      {itemToEdit && (
        <ItemFormDialog
          title="Editar Item"
          description="Modifica los detalles del producto seleccionado"
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          item={itemToEdit}
          setItem={setItemToEdit as any}
          onSubmit={handleSaveEdit}
          isSubmitting={isSubmitting}
          buttonText="Guardar Cambios"
          availableTypes={itemTypes}
          providers={providers}
          supplyStates={SUPPLY_STATES}
        />
      )}
    </div>
  );
}