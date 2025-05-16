"use client";

import { useState, useEffect, useMemo } from "react";
import { Inventory } from "@/types/interfaces";
import { createClient } from "@/utils/supabase/client";
import { deleteInventoryItem, updateInventoryItem } from "./service/inventory-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, PlusCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { FilterBar } from "./components/FilterBar";
import { InventoryTable } from "./components/InventoryTable";
import { StatsPanel } from "./components/StatsPanel";
import { ItemFormDialog } from "./dialogs/ItemFormDialog";

const toast = (props: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
  console.log(`Toast: ${props.title} - ${props.description}`);
};

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
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .order('id', { ascending: true });
        
        if (error) throw error;
        
        setInventory(data || []);
      } catch (error: any) {
        console.error("Error al cargar inventario:", error.message);
        toast({
          title: "Error",
          description: "No se pudo cargar el inventario. " + error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
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
      
      // Este servicio ya existe
      const result = await import("./service/inventory-service").then(mod => {
        return mod.createInventoryItem(itemToAdd);
      });
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Refrescar inventario
      const supabase = createClient();
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('id', { ascending: true });
        
      if (error) throw error;
      
      setInventory(data || []);
      setNewItem({
        name: "",
        type: "",
        unit_price: 0,
        stock: 0
      });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Éxito",
        description: "El elemento ha sido añadido correctamente",
      });
    } catch (error: any) {
      console.error("Error al añadir elemento:", error.message);
      toast({
        title: "Error",
        description: "No se pudo añadir el elemento. " + error.message,
        variant: "destructive"
      });
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
      
      const result = await updateInventoryItem(itemToEdit.id, itemToUpdate);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Refrescar inventario
      const supabase = createClient();
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('id', { ascending: true });
        
      if (error) throw error;
      
      setInventory(data || []);
      setIsEditDialogOpen(false);
      setItemToEdit(null);
      
      toast({
        title: "Éxito",
        description: "El elemento ha sido actualizado correctamente",
      });
    } catch (error: any) {
      console.error("Error al actualizar elemento:", error.message);
      toast({
        title: "Error",
        description: "No se pudo actualizar el elemento. " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar ítem
  const handleDeleteItem = async (id: number) => {
    try {
      const result = await deleteInventoryItem(id);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Actualizar el estado local
      setInventory(inventory.filter(item => item.id !== id));
      
      toast({
        title: "Éxito",
        description: "El elemento ha sido eliminado correctamente",
      });
    } catch (error: any) {
      console.error("Error al eliminar elemento:", error.message);
      toast({
        title: "Error",
        description: "No se pudo eliminar el elemento. " + error.message,
        variant: "destructive"
      });
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