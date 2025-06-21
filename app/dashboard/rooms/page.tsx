"use client";

import { useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import { Home, Settings, Layers, Plus, Search, Edit, Trash2, Filter, Building2, Users, Bed } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { getAllRooms, createRoom, updateRoomState, updateRoom, Room } from "@/lib/services/rooms-service"
import { getTypeRoomsByHotel, getAllTypeRooms, createTypeRoom, TypeRoom } from "@/lib/services/typeroom-service"
import { useHotel } from "@/contexts/HotelContext"
import { AuthContext } from "@/contexts/AuthContext"

type RoomStatus = "occupied" | "available" | "maintenance"

interface RoomData {
  id: number
  name: string
  floor: number
  status: RoomStatus
  type: string
  capacity: number
  price: number
  devices: string[]
  lastCleaned?: string
  notes?: string
}

// Definimos explícitamente la interfaz para el statusConfig
interface StatusConfigType {
  [key: string]: {
    color: string;
    label: string;
    iconColor: string;
  };
}

// Aseguramos que todos los estados posibles estén definidos
const statusConfig: StatusConfigType = {
  occupied: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "Ocupada",
    iconColor: "bg-emerald-500",
  },
  available: {
    color: "bg-sky-100 text-sky-700 border-sky-200",
    label: "Disponible",
    iconColor: "bg-sky-500",
  },
  maintenance: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Mantenimiento",
    iconColor: "bg-amber-500",
  },
}

const roomTypes = ["Individual", "Doble", "Suite", "Familiar"]
const deviceOptions = ["luz", "termostato", "cerradura", "wifi", "minibar", "caja fuerte", "tv", "aire acondicionado"]

export default function RoomsAdminPage() {
  const [rooms, setRooms] = useState<RoomData[]>([])
  const [typeRooms, setTypeRooms] = useState<TypeRoom[]>([])
  const [filteredRooms, setFilteredRooms] = useState<RoomData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "all">("all")
  const [floorFilter, setFloorFilter] = useState<number | "all">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isTypeRoomDialogOpen, setIsTypeRoomDialogOpen] = useState(false)
  const [isCreatingTypeRoom, setIsCreatingTypeRoom] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null)
  const [isNewRoom, setIsNewRoom] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()
  const { selectedHotel } = useHotel()
  const { token } = useContext(AuthContext)
  const [newRoomData, setNewRoomData] = useState({
    typeRoomId: 0,
    state: "available" as RoomStatus,
  })

  const [newTypeRoomData, setNewTypeRoomData] = useState({
    description: "",
    price: 0,
  })

  // Formulario para nueva/editar habitación
  const [formData, setFormData] = useState<Omit<RoomData, "id">>({
    name: "",
    floor: 1,
    status: "available",
    type: "Individual",
    capacity: 1,
    price: 0,
    devices: [],
    lastCleaned: new Date().toISOString().split("T")[0],
    notes: "",
  })

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  // Función para convertir Room de la API a RoomData para la UI
  const convertRoomToRoomData = (room: Room): RoomData => {
    // Asegurar que el estado sea uno de los valores válidos
    let status: RoomStatus = "available"; // Valor por defecto
    if (room.state && ["occupied", "available", "maintenance"].includes(room.state)) {
      status = room.state as RoomStatus;
    } else {
      console.warn(`Estado no reconocido: ${room.state}, asignando 'available' por defecto`);
    }
    
    return {
      id: room.id,
      name: room.room_number || `Habitación ${room.id}`,
      floor: room.floor || Math.floor(room.id / 100) || 1,
      status: status,
      type: room.type || "Individual",
      capacity: room.capacity || 1,
      price: room.price || 0,
      devices: room.devices || ["luz", "termostato", "cerradura", "wifi"],
      lastCleaned: new Date().toISOString().split("T")[0],
      notes: "",
    };
  };
  // Cargar habitaciones desde la API
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!selectedHotel) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);      try {
        if (!token) {
          toast.error("No hay sesión activa. Por favor, inicie sesión de nuevo.");
          router.push('/sign-in');
          return;
        }

        const roomsResult = await getAllRooms(token, selectedHotel.id);
        if (roomsResult.success && roomsResult.data) {
          const roomsData = roomsResult.data.map(convertRoomToRoomData);
          setRooms(roomsData);
          setFilteredRooms(roomsData);
        } else {
          toast.error(roomsResult.message || "No se pudieron cargar las habitaciones");
          setRooms([]);
          setFilteredRooms([]);
        }

        const typeRoomsResult = await getAllTypeRooms(selectedHotel.id, token);
        if (typeRoomsResult.success && typeRoomsResult.data) {
          setTypeRooms(typeRoomsResult.data);
          console.log("Tipos de habitación cargados:", typeRoomsResult.data);
        } else {
          console.warn("No se pudieron cargar los tipos de habitación:", typeRoomsResult.message);
          setTypeRooms([]);
        }

      } catch (error: any) {
        toast.error("Error al cargar los datos iniciales: " + error.message);
        setRooms([]);
        setFilteredRooms([]);
        setTypeRooms([]);
      } finally {
        setIsLoading(false);
      }
    };    fetchInitialData();
  }, [selectedHotel, router, token]); // Recargar cuando cambie el hotel seleccionado o el token

  useEffect(() => {
    filterRooms()
  }, [searchTerm, statusFilter, floorFilter, rooms])

  const filterRooms = () => {
    let filtered = [...rooms]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()) || room.id.toString().includes(searchTerm),
      )
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((room) => room.status === statusFilter)
    }

    // Filtrar por piso
    if (floorFilter !== "all") {
      filtered = filtered.filter((room) => room.floor === floorFilter)
    }

    setFilteredRooms(filtered)
  }
  const handleCreateRoom = () => {
    setIsNewRoom(true)
    setNewRoomData({
      typeRoomId: typeRooms[0]?.id || 0,
      state: "available",
    })
    setIsEditDialogOpen(true)
  }

  const handleEditRoom = (room: RoomData) => {
    setIsNewRoom(false)
    setCurrentRoom(room)
    setFormData({
      name: room.name,
      floor: room.floor,
      status: room.status,
      type: room.type,
      capacity: room.capacity,
      price: room.price,
      devices: room.devices || [],
      lastCleaned: room.lastCleaned || new Date().toISOString().split("T")[0],
      notes: room.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteRoom = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta habitación?")) {
      try {
        // Nota: La función de eliminar no está implementada en la API aún
        toast.error("La función de eliminar no está disponible temporalmente");
        // Aquí iría: const result = await deleteRoom(id, token);
      } catch (error: any) {
        console.error("Error al eliminar habitación:", error.message);
        toast.error("Error al eliminar la habitación");
      }
    }
  }
  const handleSaveRoom = async () => {
    const hotelId = selectedHotel?.id;

    if (!token || !hotelId) {
      toast.error("Error de configuración. No se encontró token o ID del hotel.");
      return;
    }

    if (isNewRoom) {      // Lógica para CREAR una nueva habitación
      if (!newRoomData.typeRoomId && typeRooms.length > 0) {
        toast.error("Debe seleccionar un tipo de habitación.");
        return;
      }

      if (typeRooms.length === 0) {
        toast.error("No hay tipos de habitación definidos.", {
          description: "Por favor, vaya a 'Gestión del Hotel' para añadir al menos un tipo de habitación antes de crear habitaciones."
        });
        return;
      }

      try {
        const result = await createRoom({
          ...newRoomData,
          hotelId: hotelId,
        }, token);

        if (result.success && result.data) {
          toast.success("Habitación creada con éxito.");
          const newRoom = convertRoomToRoomData(result.data);
          setRooms(prev => [...prev, newRoom]);
          setIsEditDialogOpen(false);
        } else {
          toast.error(result.message || "No se pudo crear la habitación.");
        }
      } catch (error: any) {
        toast.error(error.message || "Ocurrió un error al crear la habitación.");
      }

    } else {
      // Lógica para ACTUALIZAR una habitación existente
      if (!currentRoom) return;
      try {
        // Solo actualizamos el estado por ahora
        const result = await updateRoomState(currentRoom.id, formData.status, token);
        if (result.success && result.data) {
          toast.success("Habitación actualizada.");
          const updatedRoom = convertRoomToRoomData(result.data);
          setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
          setIsEditDialogOpen(false);
        } else {
          toast.error(result.message || "No se pudo actualizar la habitación.");
        }
      } catch (error: any) {
        toast.error(error.message || "Ocurrió un error al actualizar.");
      }
    }
  };

  const handleDeviceToggle = (device: string) => {
    const currentDevices = formData.devices || [];
    if (currentDevices.includes(device)) {
      setFormData({
        ...formData,
        devices: currentDevices.filter((d) => d !== device),
      })
    } else {
      setFormData({
        ...formData,
        devices: [...currentDevices, device],
      })
    }
  }

  const getStatusBadge = (status: RoomStatus) => {
    const statusStyles = {
      occupied: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-700",
        dot: "bg-emerald-500",
        label: "Ocupada"
      },
      available: {
        bg: "bg-sky-100 dark:bg-sky-900/30",
        text: "text-sky-700 dark:text-sky-300", 
        border: "border-sky-200 dark:border-sky-700",
        dot: "bg-sky-500",
        label: "Disponible"
      },
      maintenance: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-700", 
        dot: "bg-amber-500",
        label: "Mantenimiento"
      }
    };

    const config = statusStyles[status] || statusStyles.available;
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
        {config.label}
      </div>
    );
  }

  const getUniqueFloors = () => {
    const floors = [...new Set(rooms.map((room) => room.floor))].filter(floor => floor !== undefined).sort((a, b) => (a || 0) - (b || 0))
    return floors as number[]
  }
  const handleQuickStatusChange = async (roomId: number, newStatus: RoomStatus) => {
    try {
      if (!token) {
        toast.error("No hay token de autenticación");
        return;
      }

      const result = await updateRoomState(roomId, newStatus, token);
      if (result.success) {
        // Actualizar el estado local
        const updatedRooms = rooms.map(room => 
          room.id === roomId ? { ...room, status: newStatus } : room
        );
        setRooms(updatedRooms);
        toast.success(`Estado de la habitación cambiado a ${statusConfig[newStatus].label}`);
      } else {
        toast.error(result.message || "Error al cambiar el estado de la habitación");
      }
    } catch (error: any) {
      console.error("Error al cambiar estado:", error);
      toast.error("Error al cambiar el estado de la habitación");
    }
  }

  const handleCreateTypeRoom = async () => {
    if (!selectedHotel || !token) {
      toast.error("Error de configuración. No se encontró hotel o token.");
      return;
    }

    if (!newTypeRoomData.description.trim()) {
      toast.error("La descripción del tipo de habitación es requerida.");
      return;
    }

    if (!newTypeRoomData.price || newTypeRoomData.price <= 0 || isNaN(newTypeRoomData.price)) {
      toast.error("El precio debe ser un número válido mayor a 0.");
      return;
    }

    console.log("Creando tipo de habitación:", {
      description: newTypeRoomData.description,
      price: newTypeRoomData.price,
      hotelId: selectedHotel.id,
    });

    setIsCreatingTypeRoom(true);
    
    try {
      const result = await createTypeRoom({
        description: newTypeRoomData.description,
        price: newTypeRoomData.price,
        hotelId: selectedHotel.id,
      }, token);

      console.log("Resultado de crear tipo de habitación:", result);

      if (result.success && result.data) {
        toast.success("Tipo de habitación creado con éxito.");
        setTypeRooms(prev => [...prev, result.data!]);
        setNewTypeRoomData({ description: "", price: 0 });
        setIsTypeRoomDialogOpen(false);
        
        // Actualizar el formulario de habitación con el nuevo tipo
        setNewRoomData(prev => ({ ...prev, typeRoomId: result.data!.id }));
      } else {
        console.error("Error al crear tipo de habitación:", result.message);
        toast.error(result.message || "No se pudo crear el tipo de habitación.");
      }
    } catch (error: any) {
      console.error("Excepción al crear tipo de habitación:", error);
      toast.error(error.message || "Ocurrió un error al crear el tipo de habitación.");
    } finally {
      setIsCreatingTypeRoom(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary dark:from-background dark:via-muted/50 dark:to-secondary">
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/60">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Administración de Habitaciones
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {selectedHotel ? (
                      <>
                        <span>Hotel:</span>
                        <Badge variant="secondary" className="font-medium">
                          {selectedHotel.name}
                        </Badge>
                      </>
                    ) : (
                      <span>Selecciona un hotel para gestionar habitaciones</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleCreateRoom} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 px-6"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Habitación
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Stats Overview */}
          {selectedHotel && rooms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-card to-muted border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary text-sm font-medium">Total</p>
                      <p className="text-3xl font-bold text-foreground">{rooms.length}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Home className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-muted border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-chart-1 text-sm font-medium">Ocupadas</p>
                      <p className="text-3xl font-bold text-foreground">
                        {rooms.filter((r) => r.status === "occupied").length}
                      </p>
                    </div>
                    <div className="p-3 bg-chart-1/10 rounded-full">
                      <Users className="h-6 w-6 text-chart-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-muted border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-chart-2 text-sm font-medium">Disponibles</p>
                      <p className="text-3xl font-bold text-foreground">
                        {rooms.filter((r) => r.status === "available").length}
                      </p>
                    </div>
                    <div className="p-3 bg-chart-2/10 rounded-full">
                      <Bed className="h-6 w-6 text-chart-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-muted border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-chart-4 text-sm font-medium">Mantenimiento</p>
                      <p className="text-3xl font-bold text-foreground">
                        {rooms.filter((r) => r.status === "maintenance").length}
                      </p>
                    </div>
                    <div className="p-3 bg-chart-4/10 rounded-full">
                      <Settings className="h-6 w-6 text-chart-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          <Card className="bg-card/70 backdrop-blur-sm border-border/60">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por nombre, ID o tipo..."
                    className="pl-10 bg-background border-input focus:border-ring focus:ring-ring/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Select
                    value={statusFilter.toString()}
                    onValueChange={(value) => setStatusFilter(value as RoomStatus | "all")}
                  >
                    <SelectTrigger className="w-[140px] bg-background">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Estado</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="occupied">Ocupada</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={floorFilter.toString()}
                    onValueChange={(value) => setFloorFilter(value === "all" ? "all" : Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-[140px] bg-background">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span>Piso</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los pisos</SelectItem>
                      {getUniqueFloors().map((floor) => (
                        <SelectItem key={floor} value={floor.toString()}>
                          Piso {floor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rooms Table */}
          <Card className="bg-card/70 backdrop-blur-sm border-border/60 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Lista de Habitaciones
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredRooms.length} habitaciones encontradas
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border">
                      <TableHead className="w-[80px] font-semibold text-foreground">ID</TableHead>
                      <TableHead className="font-semibold text-foreground">Habitación</TableHead>
                      <TableHead className="font-semibold text-foreground">Piso</TableHead>
                      <TableHead className="font-semibold text-foreground">Tipo</TableHead>
                      <TableHead className="font-semibold text-foreground">Capacidad</TableHead>
                      <TableHead className="font-semibold text-foreground">Precio</TableHead>
                      <TableHead className="font-semibold text-foreground">Estado</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!selectedHotel ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                              <Building2 className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-slate-900 dark:text-white">No hay hotel seleccionado</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Selecciona un hotel desde el dashboard para ver las habitaciones
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Cargando habitaciones...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredRooms.length > 0 ? (
                      filteredRooms.map((room) => (
                        <TableRow 
                          key={room.id} 
                          className="hover:bg-muted/50 transition-colors border-border"
                        >
                          <TableCell className="font-mono font-medium text-slate-600 dark:text-slate-300">
                            #{room.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <Home className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{room.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Habitación</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              Piso {room.floor}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{room.type}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-700 dark:text-slate-300">{room.capacity}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              ${room.price}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/noche</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(room.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <Settings className="h-4 w-4" />
                                  <span className="sr-only">Acciones</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                  Acciones
                                </DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditRoom(room)} className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar habitación
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                  Cambiar estado
                                </DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusChange(room.id, "available")}
                                  disabled={room.status === "available"}
                                  className="cursor-pointer"
                                >
                                  <Badge key={`${room.id}-available-badge`} variant="outline" className="bg-sky-500 border-0 h-2 w-2 p-0 mr-2" />
                                  Disponible
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusChange(room.id, "occupied")}
                                  disabled={room.status === "occupied"}
                                  className="cursor-pointer"
                                >
                                  <Badge key={`${room.id}-occupied-badge`} variant="outline" className="bg-emerald-500 border-0 h-2 w-2 p-0 mr-2" />
                                  Ocupada
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusChange(room.id, "maintenance")}
                                  disabled={room.status === "maintenance"}
                                  className="cursor-pointer"
                                >
                                  <Badge key={`${room.id}-maintenance-badge`} variant="outline" className="bg-amber-500 border-0 h-2 w-2 p-0 mr-2" />
                                  Mantenimiento
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 dark:text-red-400 cursor-pointer"
                                  onClick={() => handleDeleteRoom(room.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                              <Search className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-slate-900 dark:text-white">No se encontraron habitaciones</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Intenta ajustar los filtros o crear una nueva habitación
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Dialog para crear/editar habitación */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isNewRoom ? "Añadir Nueva Habitación" : "Editar Habitación"}</DialogTitle>
            <DialogDescription>
              {isNewRoom
                ? "Seleccione el tipo y estado para la nueva habitación."
                : `Editando detalles para la habitación ${currentRoom?.name}.`}
            </DialogDescription>
          </DialogHeader>

          {isNewRoom ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="typeRoomId" className="text-right">
                  Tipo
                </Label>
                <Select
                  value={String(newRoomData.typeRoomId)}
                  onValueChange={(value) => setNewRoomData(prev => ({ ...prev, typeRoomId: parseInt(value) }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>                  <SelectContent>
                    {typeRooms.length === 0 ? (
                      <SelectItem value="0" disabled>
                        No hay tipos disponibles - Cree uno primero
                      </SelectItem>
                    ) : (
                      typeRooms.map(tr => (
                        <SelectItem key={tr.id} value={String(tr.id)}>
                          {tr.description} (${tr.price ? tr.price.toFixed(2) : '0.00'})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>                </Select>
              </div>
              {typeRooms.length === 0 && (
                <div className="col-span-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                  <p className="font-medium">⚠️ No hay tipos de habitación definidos</p>
                  <p className="mb-3">Para crear habitaciones, primero debe definir al menos un tipo de habitación en la gestión del hotel.</p>                  <Button 
                    onClick={() => {
                      setIsTypeRoomDialogOpen(true);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-amber-700 border-amber-300 hover:bg-amber-100"
                  >
                    Crear Tipo de Habitación
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state" className="text-right">
                  Estado
                </Label>
                <Select
                  value={newRoomData.state}
                  onValueChange={(value: RoomStatus) => setNewRoomData(prev => ({ ...prev, state: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="occupied">Ocupada</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor">Piso</Label>
                  <Input
                    id="floor"
                    type="number"
                    min="1"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de habitación</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as RoomStatus })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="occupied">Ocupada</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidad (personas)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Precio por noche ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, price: value });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dispositivos IoT</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {deviceOptions.map((device) => (
                    <div key={device} className="flex items-center space-x-2">
                      <Switch
                        id={`device-${device}`}
                        checked={formData.devices.includes(device)}
                        onCheckedChange={() => handleDeviceToggle(device)}
                      />
                      <Label htmlFor={`device-${device}`} className="text-sm cursor-pointer">
                        {device.charAt(0).toUpperCase() + device.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastCleaned">Última limpieza</Label>
                <Input
                  id="lastCleaned"
                  type="date"
                  value={formData.lastCleaned}
                  onChange={(e) => setFormData({ ...formData, lastCleaned: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionales sobre la habitación..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveRoom} 
              disabled={isNewRoom && typeRooms.length === 0}
            >
              {isNewRoom ? "Crear habitación" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear tipo de habitación */}
      <Dialog open={isTypeRoomDialogOpen} onOpenChange={setIsTypeRoomDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Nuevo Tipo de Habitación
            </DialogTitle>
            <DialogDescription>
              Defina los detalles para el nuevo tipo de habitación. Este tipo podrá ser usado para crear habitaciones específicas.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descripción *
              </Label>
              <Input
                id="description"
                value={newTypeRoomData.description}
                onChange={(e) => setNewTypeRoomData({ ...newTypeRoomData, description: e.target.value })}
                placeholder="Ej: Habitación Doble, Suite Presidencial, Habitación Individual"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Ingrese una descripción clara del tipo de habitación
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeroom-price" className="text-sm font-medium">
                Precio por noche (USD) *
              </Label>
              <Input
                id="typeroom-price"
                type="number"
                min="0"
                step="0.01"
                value={newTypeRoomData.price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setNewTypeRoomData({ ...newTypeRoomData, price: value });
                }}
                placeholder="0.00"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Precio base por noche para este tipo de habitación
              </p>
            </div>

            {selectedHotel && (
              <div className="p-3 bg-muted/50 rounded-lg border">
                <p className="text-sm font-medium text-muted-foreground">
                  Hotel seleccionado:
                </p>
                <p className="text-sm font-semibold">{selectedHotel.name}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsTypeRoomDialogOpen(false);
                setNewTypeRoomData({ description: "", price: 0 });
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateTypeRoom}
              disabled={!newTypeRoomData.description.trim() || newTypeRoomData.price <= 0 || isCreatingTypeRoom}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreatingTypeRoom ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Tipo de Habitación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
