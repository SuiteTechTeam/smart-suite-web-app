"use client"

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
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-mobile"

type RoomStatus = "occupied" | "vacant" | "maintenance"

interface Room {
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

const statusConfig = {
  occupied: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "Ocupada",
    icon: <Badge variant="outline" className="bg-emerald-500 border-0 h-2 w-2 p-0 mr-2" />,
  },
  vacant: {
    color: "bg-sky-100 text-sky-700 border-sky-200",
    label: "Libre",
    icon: <Badge variant="outline" className="bg-sky-500 border-0 h-2 w-2 p-0 mr-2" />,
  },
  maintenance: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Mantenimiento",
    icon: <Badge variant="outline" className="bg-amber-500 border-0 h-2 w-2 p-0 mr-2" />,
  },
}

// Datos de ejemplo
const initialRooms: Room[] = [
  {
    id: 101,
    name: "Habitación 101",
    floor: 1,
    status: "occupied",
    type: "Individual",
    capacity: 1,
    price: 85,
    devices: ["luz", "termostato", "cerradura", "wifi"],
    lastCleaned: "2025-05-15",
    notes: "Vista al jardín",
  },
  {
    id: 102,
    name: "Habitación 102",
    floor: 1,
    status: "vacant",
    type: "Doble",
    capacity: 2,
    price: 120,
    devices: ["luz", "termostato", "cerradura", "wifi"],
    lastCleaned: "2025-05-16",
    notes: "",
  },
  {
    id: 103,
    name: "Habitación 103",
    floor: 1,
    status: "maintenance",
    type: "Suite",
    capacity: 3,
    price: 200,
    devices: ["luz", "termostato", "cerradura", "wifi"],
    lastCleaned: "2025-05-14",
    notes: "Problema con el aire acondicionado",
  },
  {
    id: 201,
    name: "Habitación 201",
    floor: 2,
    status: "occupied",
    type: "Doble",
    capacity: 2,
    price: 125,
    devices: ["luz", "termostato", "cerradura", "wifi"],
    lastCleaned: "2025-05-15",
    notes: "",
  },
  {
    id: 202,
    name: "Habitación 202",
    floor: 2,
    status: "vacant",
    type: "Individual",
    capacity: 1,
    price: 90,
    devices: ["luz", "termostato", "cerradura", "wifi"],
    lastCleaned: "2025-05-16",
    notes: "",
  },
  {
    id: 203,
    name: "Habitación 203",
    floor: 2,
    status: "occupied",
    type: "Suite",
    capacity: 4,
    price: 250,
    devices: ["luz", "termostato", "cerradura", "wifi", "minibar"],
    lastCleaned: "2025-05-15",
    notes: "Cliente VIP",
  },
]

const roomTypes = ["Individual", "Doble", "Suite", "Familiar"]
const deviceOptions = ["luz", "termostato", "cerradura", "wifi", "minibar", "caja fuerte", "tv", "aire acondicionado"]

export default function RoomsAdminPage() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(initialRooms)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "all">("all")
  const [floorFilter, setFloorFilter] = useState<number | "all">("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [isNewRoom, setIsNewRoom] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()

  // Formulario para nueva/editar habitación
  const [formData, setFormData] = useState<Omit<Room, "id">>({
    name: "",
    floor: 1,
    status: "vacant",
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
    setFormData({
      name: `Habitación ${Math.floor(Math.random() * 900) + 100}`,
      floor: 1,
      status: "vacant",
      type: "Individual",
      capacity: 1,
      price: 85,
      devices: ["luz", "termostato", "cerradura", "wifi"],
      lastCleaned: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setIsEditDialogOpen(true)
  }

  const handleEditRoom = (room: Room) => {
    setIsNewRoom(false)
    setCurrentRoom(room)
    setFormData({
      name: room.name,
      floor: room.floor,
      status: room.status,
      type: room.type,
      capacity: room.capacity,
      price: room.price,
      devices: room.devices,
      lastCleaned: room.lastCleaned || new Date().toISOString().split("T")[0],
      notes: room.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteRoom = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta habitación?")) {
      setRooms(rooms.filter((room) => room.id !== id))
    }
  }

  const handleSaveRoom = () => {
    if (isNewRoom) {
      // Crear nueva habitación
      const newId = Math.max(...rooms.map((r) => r.id), 0) + 1
      const newRoom: Room = {
        id: newId,
        ...formData,
      }
      setRooms([...rooms, newRoom])
    } else if (currentRoom) {
      // Actualizar habitación existente
      setRooms(rooms.map((room) => (room.id === currentRoom.id ? { ...room, ...formData } : room)))
    }

    setIsEditDialogOpen(false)
    setCurrentRoom(null)
  }

  const handleDeviceToggle = (device: string) => {
    if (formData.devices.includes(device)) {
      setFormData({
        ...formData,
        devices: formData.devices.filter((d) => d !== device),
      })
    } else {
      setFormData({
        ...formData,
        devices: [...formData.devices, device],
      })
    }
  }

  const getStatusBadge = (status: RoomStatus) => (
    <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status].color}`}>
      {statusConfig[status].icon}
      {statusConfig[status].label}
    </div>
  )

  const getUniqueFloors = () => {
    const floors = [...new Set(rooms.map((room) => room.floor))].sort((a, b) => a - b)
    return floors
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
                      <SelectItem value="vacant">Libre</SelectItem>
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
                    {filteredRooms.length > 0 ? (
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
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push(`/?room=${room.id}`)}>
                                  <Home className="h-4 w-4 mr-2" />
                                  Ver Detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditRoom(room)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
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
                  <span>Libres: {rooms.filter((r) => r.status === "vacant").length}</span>
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
            <DialogTitle>{isNewRoom ? "Crear nueva habitación" : "Editar habitación"}</DialogTitle>
            <DialogDescription>
              {isNewRoom
                ? "Completa los detalles para crear una nueva habitación."
                : `Modificando la habitación ${currentRoom?.id}.`}
            </DialogDescription>
          </DialogHeader>

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
                    <SelectItem value="vacant">Libre</SelectItem>
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
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

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
