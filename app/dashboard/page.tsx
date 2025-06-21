"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Thermometer, 
  LightbulbOff, 
  Lightbulb, 
  Lock, 
  Wifi, 
  Home, 
  Settings, 
  BarChart3, 
  Menu,
  X,
  Search,
  ChevronLeft,
  Loader2,
  Building2,
  MapPin,
  Star,
  Users,
  Bed,
  Calendar,
  MoreVertical,
  Edit,
  Eye,
  Plus
} from "lucide-react"
import { getAllRooms, Room } from "@/lib/services/rooms-service"
import { getAllIoTDevices, getRoomDevicesByRoom, IoTDevice, RoomDevice } from "@/lib/services/iot-service"
import { useAuth } from "@/hooks/use-auth"
import { getHotelsByOwner, type Hotel } from "@/lib/services/hotel-service"
import { HotelFormDialog } from "@/components/dialogs/HotelFormDialog"
import { useHotel } from "@/contexts/HotelContext"
import { toast } from "sonner"

type RoomStatus = "occupied" | "available" | "maintenance"

interface AnalyticsRoom {
  id: number
  name: string
  floor: number
  status: RoomStatus
  devices: string[]
}

interface TemperatureData {
  time: string
  temperatura: number
}

// Función para convertir Room de la API a AnalyticsRoom para la UI
const convertRoomToAnalyticsRoom = (room: Room): AnalyticsRoom => ({
  id: room.id,
  name: room.room_number || `Habitación ${room.id}`,
  floor: room.floor || Math.floor(room.id / 100) || 1,
  status: room.state as RoomStatus,
  devices: room.devices || ["luz", "termostato", "cerradura", "wifi"]
});

const generateTemperatureData = (roomId: number): TemperatureData[] => {
  const now = new Date()
  const data: TemperatureData[] = []
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now)
    time.setHours(now.getHours() - i)
    const temp = 20 + Math.random() * 5
    data.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temperatura: Number.parseFloat(temp.toFixed(1)),
    })
  }
  return data
}

const statusConfig = {
  occupied: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    label: "Ocupada",
    dot: "bg-emerald-500",
  },
  available: {
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    label: "Libre",
    dot: "bg-blue-500",
  },
  maintenance: {
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    label: "Mantenimiento",
    dot: "bg-amber-500",
  },
}

export default function DashboardPage() {
	const { user } = useAuth();
	const router = useRouter();
	const { setSelectedHotel } = useHotel();
	const [hotels, setHotels] = useState<Hotel[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isHotelFormOpen, setIsHotelFormOpen] = useState(false);
	const [loadingStats, setLoadingStats] = useState<Set<number>>(new Set());
	const [hotelStats, setHotelStats] = useState<Record<number, { 
		rooms: number; 
		occupancy: number; 
		occupied: number; 
		available: number; 
		maintenance: number; 
	}>>({});

  useEffect(() => {
		const fetchHotels = async () => {
			if (user && user.roleId === "1") {
				const token = localStorage.getItem("auth_token");
        if (!token) {
					toast.error("Error de autenticación.");
					setIsLoading(false);
          return;
        }				try {
					const result = await getHotelsByOwner(Number(user.id), token);
					if (result.success && result.data) {
						setHotels(result.data);
						
						// Cargar estadísticas para cada hotel
						result.data.forEach(hotel => {
							fetchHotelStats(hotel.id, token);
						});
						
						if (result.data.length === 0) {
							setIsHotelFormOpen(true);
						}
        } else {
						// No mostrar error si el owner simplemente no tiene hoteles aun
						if (result.message?.includes("not found")) {
							setHotels([]);
							setIsHotelFormOpen(true);
        } else {
							toast.error(result.message || "No se pudieron cargar los hoteles.");
						}
					}
				} catch (error: any) {
					toast.error(error.message || "Ocurrió un error al buscar hoteles.");
				}
			}
			setIsLoading(false);
		};

		if (user) {
			fetchHotels();
		}
	}, [user]);

	// Función para obtener estadísticas reales de cada hotel
	const fetchHotelStats = async (hotelId: number, token: string) => {
		// Marcar como cargando
		setLoadingStats(prev => new Set(prev).add(hotelId));
		
		try {
			// Obtener habitaciones reales del hotel
			const roomsResult = await getAllRooms(token, hotelId);
			
			if (roomsResult.success && roomsResult.data) {
				const rooms = roomsResult.data;
				const totalRooms = rooms.length;
				
				// Calcular ocupación basada en los estados de las habitaciones
				const occupiedRooms = rooms.filter(room => 
					room.state === "occupied"
				).length;
				
				const availableRooms = rooms.filter(room => 
					room.state === "available"
				).length;
				
				const maintenanceRooms = rooms.filter(room => 
					room.state === "maintenance"
				).length;
				
				const occupancyPercentage = totalRooms > 0 
					? Math.round((occupiedRooms / totalRooms) * 100) 
					: 0;
				
				setHotelStats(prev => ({
					...prev,
					[hotelId]: {
						rooms: totalRooms,
						occupancy: occupancyPercentage,
						occupied: occupiedRooms,
						available: availableRooms,
						maintenance: maintenanceRooms
					}
				}));
				
				console.log(`Estadísticas del hotel ${hotelId}:`, {
					total: totalRooms,
					occupancy: occupancyPercentage,
					occupied: occupiedRooms
				});
			} else {
				// Si no hay habitaciones o hay error, establecer valores en 0
				setHotelStats(prev => ({
					...prev,
					[hotelId]: {
						rooms: 0,
						occupancy: 0,
						occupied: 0,
						available: 0,
						maintenance: 0
					}
				}));
			}
		} catch (error) {
			console.warn(`Error fetching stats for hotel ${hotelId}:`, error);
			// En caso de error, establecer valores en 0
			setHotelStats(prev => ({
				...prev,
				[hotelId]: {
					rooms: 0,
					occupancy: 0,
					occupied: 0,
					available: 0,
					maintenance: 0
				}
			}));
		} finally {
			// Quitar del estado de carga
			setLoadingStats(prev => {
				const newSet = new Set(prev);
				newSet.delete(hotelId);
				return newSet;
			});
		}
	};

	const handleHotelCreated = (newHotel: Hotel) => {
		setHotels(prev => [...prev, newHotel]);
		setSelectedHotel(newHotel);
		toast.info(
			`Ahora ve a "Gestión del Hotel" para añadir tipos de habitación.`,
		);
	};

	const handleSelectHotel = (hotel: Hotel) => {
		setSelectedHotel(hotel);
		toast.success(`Hotel "${hotel.name}" seleccionado`);
		// Aquí podrías redirigir a una página específica si lo deseas
	};

	const handleViewHotel = (hotel: Hotel) => {
		// Seleccionar el hotel usando el contexto y redirigir a la página de habitaciones
		setSelectedHotel(hotel);
		toast.success(`Viendo habitaciones del hotel "${hotel.name}"`);
		router.push('/dashboard/rooms');
	};

	const handleEditHotel = (hotel: Hotel) => {
		// Abrir modal de edición o redirigir
		toast.info("Funcionalidad de edición en desarrollo");
	};

	if (isLoading) {
    return (
			<div className="flex items-center justify-center h-full">
				<Loader2 className="h-8 w-8 animate-spin" />
				<p className="ml-2">Cargando dashboard...</p>
        </div>
		);
  }

	if (user?.roleId !== "1") {
    return (
			<Card>
				<CardHeader>
					<CardTitle>Bienvenido al Dashboard</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Seleccione una opción del menú de la izquierda para comenzar.</p>
				</CardContent>
			</Card>
		);
  }
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Dashboard del Propietario
              </CardTitle>
              <CardDescription className="mt-1">
                Gestiona tus hoteles y propiedades desde un solo lugar
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsHotelFormOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Hotel
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {hotels.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Mis Hoteles</h2>
                  <p className="text-sm text-muted-foreground">
                    {hotels.length} {hotels.length === 1 ? 'hotel registrado' : 'hoteles registrados'}
                  </p>
                </div>
                <Badge variant="secondary" className="px-3 py-1">
                  {hotels.length} propiedades
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map(hotel => (
                  <Card key={hotel.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="absolute top-4 right-4 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewHotel(hotel)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditHotel(hotel)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar hotel
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleSelectHotel(hotel)}>
                            <Building2 className="h-4 w-4 mr-2" />
                            Seleccionar hotel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <CardTitle className="text-lg line-clamp-1 pr-10">
                          {hotel.name}
                        </CardTitle>
                        {hotel.address && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{hotel.address}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Stats */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <Bed className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Habitaciones</p>
                            <p className="text-xs text-muted-foreground">
                              {loadingStats.has(hotel.id) ? (
                                <span className="flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Cargando...
                                </span>
                              ) : (
                                `${hotelStats[hotel.id]?.rooms || 0} registradas`
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Detalles de ocupación */}
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium">Ocupación</p>
                              <p className="text-xs text-muted-foreground">
                                {hotelStats[hotel.id]?.occupancy || 0}%
                              </p>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${hotelStats[hotel.id]?.occupancy || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Distribución de habitaciones */}
                        {hotelStats[hotel.id]?.rooms > 0 && (
                          <div className="grid grid-cols-3 gap-2 pt-2">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                  {hotelStats[hotel.id]?.occupied || 0}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">Ocupadas</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                  {hotelStats[hotel.id]?.available || 0}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">Libres</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                  {hotelStats[hotel.id]?.maintenance || 0}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">Mantenim.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-muted-foreground">Operativo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            ID: {hotel.id}
                          </Badge>
                          {hotelStats[hotel.id]?.occupancy && hotelStats[hotel.id].occupancy > 80 && (
                            <Badge variant="destructive" className="text-xs">
                              Alta ocupación
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <div className="flex gap-2 w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewHotel(hotel)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleSelectHotel(hotel)}
                        >
                          <Building2 className="h-4 w-4 mr-1" />
                          Seleccionar
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                ¡Bienvenido a Smart Suite!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Parece que aún no tienes hoteles registrados. Comienza creando tu primer hotel para gestionar habitaciones, reservas y más.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => setIsHotelFormOpen(true)}
                  size="lg"
                  className="px-8"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Mi Primer Hotel
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  <Calendar className="h-5 w-5 mr-2" />
                  Ver Tutorial
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {user && (
        <HotelFormDialog
          open={isHotelFormOpen}
          onOpenChange={setIsHotelFormOpen}
          onHotelCreated={handleHotelCreated}
          ownerId={Number(user.id)}
        />
      )}
    </div>
  );
}

// Component for room sidebar
function RoomSidebar({ 
  search, 
  setSearch, 
  filteredRooms, 
  selectedRoom, 
  handleRoomSelect, 
  getStatusBadge, 
  setSidebarOpen, 
  isMobile 
}: {
  search: string
  setSearch: (value: string) => void
  filteredRooms: AnalyticsRoom[]
  selectedRoom: AnalyticsRoom
  handleRoomSelect: (room: AnalyticsRoom) => void
  getStatusBadge: (status: RoomStatus) => React.ReactNode
  setSidebarOpen: (open: boolean) => void
  isMobile: boolean
}) {
  return (
    <div className="flex flex-col h-full p-4">
      {isMobile && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Habitaciones</h2>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar habitación..."
          className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
        />
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">Habitaciones</span>
        <span className="text-xs text-muted-foreground">{filteredRooms.length} total</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredRooms.length === 0 && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No se encontraron habitaciones
          </div>
        )}
        {filteredRooms.map(room => (
          <button
            key={room.id}
            onClick={() => handleRoomSelect(room)}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors border
              ${selectedRoom.id === room.id 
                ? "bg-accent border-ring" 
                : "border-transparent hover:bg-accent/50"
              }`}
          >
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{room.name}</span>
              <span className="text-xs text-muted-foreground">Piso {room.floor}</span>
            </div>
            
          </button>
        ))}
      </div>
    </div>
  )
}

// Component for status cards
function StatusCard({ 
  icon, 
  title, 
  status, 
  active, 
  color 
}: {
  icon: React.ReactNode
  title: string
  status: string
  active: boolean
  color: string
}) {
  const colorClasses = {
    amber: active ? "bg-amber-50 dark:bg-amber-950" : "bg-muted",
    red: "bg-red-50 dark:bg-red-950",
    indigo: active ? "bg-indigo-50 dark:bg-indigo-950" : "bg-muted",
    emerald: active ? "bg-emerald-50 dark:bg-emerald-950" : "bg-muted",
  }

  const iconColorClasses = {
    amber: active ? "text-amber-500" : "text-muted-foreground",
    red: "text-red-500",
    indigo: active ? "text-indigo-500" : "text-muted-foreground",
    emerald: active ? "text-emerald-500" : "text-muted-foreground",
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <div className={`p-3 rounded-full mb-3 ${colorClasses[color as keyof typeof colorClasses]}`}>
          <div className={iconColorClasses[color as keyof typeof iconColorClasses]}>
            {icon}
          </div>
        </div>
        <h3 className="font-medium text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{status}</p>
      </CardContent>
    </Card>
  )
}

// Component for device cards
function DeviceCard({ 
  icon, 
  title, 
  description, 
  footer, 
  children 
}: {
  icon: React.ReactNode
  title: string
  description: string
  footer: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-0">
        {footer}
      </CardFooter>
    </Card>
  )
}

// Component for settings items
function SettingItem({ 
  title, 
  description, 
  defaultChecked 
}: {
  title: string
  description: string
  defaultChecked: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}