"use client";

import { useState, useEffect, useMemo } from "react";
import { Inventory } from "@/types/interfaces";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, PlusCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { FilterBar } from "./components/FilterBar";
import { InventoryTable } from "./components/InventoryTable";
import { StatsPanel } from "./components/StatsPanel";
import { ItemFormDialog } from "./dialogs/ItemFormDialog";
import { toast } from "sonner";

const BASE_URL = "http://smart-suite-web-service.azurewebsites.net/api/v1";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [newItem, setNewItem] = useState<Partial<Inventory & { customType?: string }>>({
    name: "",
    type: "",
    unit_price: 0,
    stock: 0
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Inventory & { customType?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Obtener inventario del backend
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/inventory`);
      if (!res.ok) throw new Error("No se pudo obtener el inventario");
      const data = await res.json();
      setInventory(data || []);
    } catch (error: any) {
      toast("No se pudo cargar el inventario. " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
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
  }, [inventory, searchTerm, filterType, filterStock]);

  // Añadir nuevo elemento al inventario
  const handleAddItem = async () => {
    if (!newItem.name || (!newItem.type || (newItem.type === "otro" && !newItem.customType))) return;

    setIsSubmitting(true);
    try {
      const finalType = newItem.type === "otro" ? newItem.customType : newItem.type;
      const itemToAdd = {
        name: newItem.name,
        type: finalType as string,
        unit_price: newItem.unit_price || 0,
        stock: newItem.stock || 0
      };
      
      const res = await fetch(`${BASE_URL}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemToAdd)
      });
      
      if (!res.ok) throw new Error("No se pudo añadir el elemento");
      
      await fetchInventory();
      setNewItem({
        name: "",
        type: "",
        unit_price: 0,
        stock: 0
      });
      setIsAddDialogOpen(false);
      
      toast("El elemento ha sido añadido correctamente");
    } catch (error: any) {
      toast("No se pudo añadir el elemento. " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Abrir diálogo de edición
  const handleOpenEditDialog = (item: Inventory) => {
    setItemToEdit({...item});
    setIsEditDialogOpen(true);
  };
  
  // Guardar cambios de edición
  const handleSaveEdit = async () => {
    if (!itemToEdit) return;
    
    setIsSubmitting(true);
    try {
      const finalType = itemToEdit.type === "otro" ? itemToEdit.customType : itemToEdit.type;
      const itemToUpdate = {
        ...itemToEdit,
        type: finalType as string
      };
      
      delete itemToUpdate.customType;
      
      const res = await fetch(`${BASE_URL}/inventory/${itemToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemToUpdate)
      });
      
      if (!res.ok) throw new Error("No se pudo actualizar el elemento");
      
      await fetchInventory();
      setIsEditDialogOpen(false);
      setItemToEdit(null);
      
      toast("El elemento ha sido actualizado correctamente");
    } catch (error: any) {
      toast("No se pudo actualizar el elemento. " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar ítem
  const handleDeleteItem = async (id: number) => {
    try {
      const res = await fetch(`${BASE_URL}/inventory/${id}`, { method: "DELETE" });
      
      if (!res.ok) throw new Error("No se pudo eliminar el elemento");
      
      // Actualizar el estado local
      setInventory(inventory.filter(item => item.id !== id));
      
      toast("El elemento ha sido eliminado correctamente");
    } catch (error: any) {
      toast("No se pudo eliminar el elemento. " + error.message);
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
        />
      )}
    </div>
  );
}