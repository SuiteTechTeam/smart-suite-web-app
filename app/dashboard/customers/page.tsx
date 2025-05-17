"use client";

import { useState, useEffect, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, PlusCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Componentes
import { FilterBar } from "./components/FilterBar";
import { CustomerTable } from "./components/CustomerTable";
import { StatsPanel } from "./components/StatsPanel";
import { CustomerFormDialog } from "./dialogs/CustomerFormDialog";
import { Customer } from "@/lib/models";

// Servicios
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/app/dashboard/customers/service/customer-service";

// Toast provisional
const toast = (props: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
  console.log(`Toast: ${props.title} - ${props.description}`);
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    address: "",
    state: "activo"
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Cargar datos de clientes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getCustomers();
        
        if (!result.success) {
          throw new Error(result.message);
        }
        
        setCustomers(result.data || []);
      } catch (error: any) {
        console.error("Error al cargar clientes:", error.message);
        toast({
          title: "Error",
          description: "No se pudo cargar la lista de clientes. " + error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Extraer todos los estados únicos para el filtro
  const customerStates = useMemo(() => {
    return [...new Set(customers.map(customer => customer.state))].sort();
  }, [customers]);
  
  // Filtrar clientes por búsqueda y filtros
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = !searchTerm || 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm);
        
      const matchesState = filterState === "all" || customer.state === filterState;
        
      return matchesSearch && matchesState;
    });
  }, [customers, searchTerm, filterState]);

  // Añadir nuevo cliente
  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.contact_name || !newCustomer.phone) return;

    setIsSubmitting(true);
    try {
      const result = await createCustomer({
        name: newCustomer.name,
        contact_name: newCustomer.contact_name,
        phone: newCustomer.phone,
        email: newCustomer.email || "",
        address: newCustomer.address || "",
        state: newCustomer.state || "activo"
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      setCustomers(prev => [...prev, result.data]);
      setIsAddDialogOpen(false);
      setNewCustomer({
        name: "",
        contact_name: "",
        phone: "",
        email: "",
        address: "",
        state: "activo"
      });

      toast({
        title: "Cliente añadido",
        description: `${result.data.name} ha sido añadido correctamente.`
      });
    } catch (error: any) {
      console.error("Error al añadir cliente:", error.message);
      toast({
        title: "Error",
        description: "No se pudo añadir el cliente. " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Editar cliente existente
  const handleEditCustomer = async () => {
    if (!customerToEdit || !customerToEdit.name || !customerToEdit.contact_name || !customerToEdit.phone) return;

    setIsSubmitting(true);
    try {
      const result = await updateCustomer(customerToEdit.id, {
        name: customerToEdit.name,
        contact_name: customerToEdit.contact_name,
        phone: customerToEdit.phone,
        email: customerToEdit.email,
        address: customerToEdit.address,
        state: customerToEdit.state
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      setCustomers(prev => 
        prev.map(customer => 
          customer.id === customerToEdit.id ? result.data : customer
        )
      );
      setIsEditDialogOpen(false);
      setCustomerToEdit(null);

      toast({
        title: "Cliente actualizado",
        description: `${result.data.name} ha sido actualizado correctamente.`
      });
    } catch (error: any) {
      console.error("Error al actualizar cliente:", error.message);
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente. " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar cliente
  const handleDeleteCustomer = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const result = await deleteCustomer(id);

      if (!result.success) {
        throw new Error(result.message);
      }

      setCustomers(prev => prev.filter(customer => customer.id !== id));

      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado correctamente."
      });
    } catch (error: any) {
      console.error("Error al eliminar cliente:", error.message);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente. " + error.message,
        variant: "destructive"
      });
    }
  };

  // Resetear filtros
  const resetFilters = () => {
    setSearchTerm("");
    setFilterState("all");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona los clientes de tu negocio.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-1">
          <PlusCircle size={16} />
          Nuevo Cliente
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando clientes...</span>
        </div>
      ) : customers.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No hay clientes</AlertTitle>
          <AlertDescription>
            No se encontraron clientes en el sistema. Añade tu primer cliente haciendo clic en el botón "Nuevo Cliente".
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterState={filterState}
            setFilterState={setFilterState}
            customerStates={customerStates}
          />

          <div className="grid grid-cols-1 gap-6">
            <CustomerTable
              customers={customers}
              filteredCustomers={filteredCustomers}
              onEdit={(customer) => {
                setCustomerToEdit(customer);
                setIsEditDialogOpen(true);
              }}
              onDelete={handleDeleteCustomer}
              resetFilters={resetFilters}
            />
          </div>
        </>
      )}

      {/* Diálogo para añadir nuevo cliente */}
      <CustomerFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Añadir nuevo cliente"
        description="Completa el formulario para añadir un nuevo cliente al sistema."
        customer={newCustomer}
        setCustomer={setNewCustomer}
        onSubmit={handleAddCustomer}
        isSubmitting={isSubmitting}
        submitLabel="Añadir cliente"
      />

      {/* Diálogo para editar cliente */}
      {customerToEdit && (
        <CustomerFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Editar cliente"
          description="Actualiza la información del cliente."
          customer={customerToEdit}
          setCustomer={(customer) => setCustomerToEdit({...customerToEdit, ...customer})}
          onSubmit={handleEditCustomer}
          isSubmitting={isSubmitting}
          submitLabel="Guardar cambios"
        />
      )}
    </div>
  );
}