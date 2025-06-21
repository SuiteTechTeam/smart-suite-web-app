"use client";

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Home, Settings, Layers, Plus, Search, Edit, Trash2, Filter } from "lucide-react"
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
import { getTypeRoomsByHotel, TypeRoom } from "@/lib/services/typeroom-service"

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
    icon: React.ReactNode;
  };
}

// Aseguramos que todos los estados posibles estén definidos
const statusConfig: StatusConfigType = {
  occupied: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "Ocupada",
    icon: <Badge variant="outline" className="bg-emerald-500 border-0 h-2 w-2 p-0 mr-2" />,
  },
  available: {
    color: "bg-sky-100 text-sky-700 border-sky-200",
    label: "Disponible",
    icon: <Badge variant="outline" className="bg-sky-500 border-0 h-2 w-2 p-0 mr-2" />,
  },
  maintenance: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Mantenimiento",
    icon: <Badge variant="outline" className="bg-amber-500 border-0 h-2 w-2 p-0 mr-2" />,
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
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null)
  const [isNewRoom, setIsNewRoom] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()

  const [newRoomData, setNewRoomData] = useState({
    typeRoomId: 0,
    state: "available" as RoomStatus,
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
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          toast.error("No hay sesión activa. Por favor, inicie sesión de nuevo.");
          router.push('/sign-in');
          return;
        }
        
        const hotelId = parseInt(localStorage.getItem('selected_hotel_id') || '1');

        const roomsResult = await getAllRooms(token, hotelId);
        if (roomsResult.success && roomsResult.data) {
          const roomsData = roomsResult.data.map(convertRoomToRoomData);
          setRooms(roomsData);
          setFilteredRooms(roomsData);
        } else {
          toast.error(roomsResult.message || "No se pudieron cargar las habitaciones");
        }

        const typeRoomsResult = await getTypeRoomsByHotel(hotelId, token);
        if (typeRoomsResult.success && typeRoomsResult.data) {
          setTypeRooms(typeRoomsResult.data);
        } else {
          toast.error(typeRoomsResult.message || "No se pudieron cargar los tipos de habitación.");
        }

      } catch (error: any) {
        toast.error("Error al cargar los datos iniciales: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [router]);

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
    if (typeRooms.length === 0) {
      toast.error("No hay tipos de habitación definidos.", {
        description: "Por favor, vaya a 'Gestión del Hotel' para añadir al menos un tipo de habitación.",
      });
      return;
    }
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
    const token = localStorage.getItem('auth_token');
    const hotelId = localStorage.getItem('selected_hotel_id');

    if (!token || !hotelId) {
      toast.error("Error de configuración. No se encontró token o ID del hotel.");
      return;
    }

    if (isNewRoom) {
      // Lógica para CREAR una nueva habitación
      if (!newRoomData.typeRoomId) {
        toast.error("Debe seleccionar un tipo de habitación.");
        return;
      }

      try {
        const result = await createRoom({
          ...newRoomData,
          hotelId: parseInt(hotelId),
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
    // Verificar que el estado exista en la configuración
    const config = statusConfig[status];
    if (!config) {
      console.warn(`Estado no reconocido en getStatusBadge: ${status}, usando configuración de 'available'`);
      return (
        <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig["available"].color}`}>
          {statusConfig["available"].icon}
          {"Desconocido"}
        </div>
      );
    }
    
    return (
      <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
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
      const token = localStorage.getItem('auth_token');
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

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden mr-2">
              <Layers className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Administración de Habitaciones</h1>
              <div className="text-sm text-slate-500 dark:text-slate-400">Gestiona las habitaciones del hotel</div>
            </div>
          </div>
          <Button onClick={handleCreateRoom} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Habitación</span>
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Buscar habitación..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={statusFilter.toString()}
                    onValueChange={(value) => setStatusFilter(value as RoomStatus | "all")}
                  >
                    <SelectTrigger className="w-[130px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Estado</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="occupied">Ocupada</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={floorFilter.toString()}
                    onValueChange={(value) => setFloorFilter(value === "all" ? "all" : Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-[130px]">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span>Piso</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {getUniqueFloors().map((floor) => (
                        <SelectItem key={floor} value={floor.toString()}>
                          Piso {floor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-200 dark:border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Piso</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Capacidad</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          Cargando habitaciones...
                        </TableCell>
                      </TableRow>
                    ) : filteredRooms.length > 0 ? (
                      filteredRooms.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium">{room.id}</TableCell>
                          <TableCell>{room.name}</TableCell>
                          <TableCell>{room.floor}</TableCell>
                          <TableCell>{room.type}</TableCell>
                          <TableCell>{room.capacity} personas</TableCell>
                          <TableCell>${room.price}/noche</TableCell>
                          <TableCell>{getStatusBadge(room.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Settings className="h-4 w-4" />
                                  <span className="sr-only">Acciones</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditRoom(room)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar habitación
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusChange(room.id, "available")}
                                  disabled={room.status === "available"}
                                >
                                  <Badge variant="outline" className="bg-sky-500 border-0 h-2 w-2 p-0 mr-2" />
                                  Disponible
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusChange(room.id, "occupied")}
                                  disabled={room.status === "occupied"}
                                >
                                  <Badge variant="outline" className="bg-emerald-500 border-0 h-2 w-2 p-0 mr-2" />
                                  Ocupada
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusChange(room.id, "maintenance")}
                                  disabled={room.status === "maintenance"}
                                >
                                  <Badge variant="outline" className="bg-amber-500 border-0 h-2 w-2 p-0 mr-2" />
                                  Mantenimiento
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 dark:text-red-400"
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
                        <TableCell colSpan={8} className="h-24 text-center">
                          No se encontraron habitaciones con los filtros seleccionados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
              <div>Total: {filteredRooms.length} habitaciones</div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-emerald-500 border-0 h-2 w-2 p-0" />
                  <span>Ocupadas: {rooms.filter((r) => r.status === "occupied").length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-sky-500 border-0 h-2 w-2 p-0" />
                  <span>Disponibles: {rooms.filter((r) => r.status === "available").length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-amber-500 border-0 h-2 w-2 p-0" />
                  <span>Mantenimiento: {rooms.filter((r) => r.status === "maintenance").length}</span>
                </div>
              </div>
            </CardFooter>
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
                  </SelectTrigger>
                  <SelectContent>
                    {typeRooms.map(tr => (
                      <SelectItem key={tr.id} value={String(tr.id)}>
                        {tr.description} (${tr.price.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
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
            <Button onClick={handleSaveRoom}>{isNewRoom ? "Crear habitación" : "Guardar cambios"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
