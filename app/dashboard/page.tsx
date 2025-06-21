"use client"
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  Loader2
} from "lucide-react"
import { getAllRooms, Room } from "@/lib/services/rooms-service"
import { getAllIoTDevices, getRoomDevicesByRoom, IoTDevice, RoomDevice } from "@/lib/services/iot-service"
import { useAuth } from "@/hooks/use-auth"
import { getHotelsByOwner, type Hotel } from "@/lib/services/hotel-service"
import { HotelFormDialog } from "@/components/dialogs/HotelFormDialog"
import { toast } from "sonner"

type RoomStatus = "occupied" | "vacant" | "maintenance"

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
  vacant: {
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
	const [hotels, setHotels] = useState<Hotel[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isHotelFormOpen, setIsHotelFormOpen] = useState(false);

  useEffect(() => {
		const fetchHotels = async () => {
			if (user && user.roleId === "1") {
				const token = localStorage.getItem("auth_token");
        if (!token) {
					toast.error("Error de autenticación.");
					setIsLoading(false);
          return;
        }

				try {
					const result = await getHotelsByOwner(Number(user.id), token);
					if (result.success && result.data) {
						setHotels(result.data);
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

	const handleHotelCreated = (newHotel: Hotel) => {
		setHotels(prev => [...prev, newHotel]);
		localStorage.setItem("selected_hotel_id", String(newHotel.id));
		toast.info(
			`Ahora ve a "Gestión del Hotel" para añadir tipos de habitación.`,
		);
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
            <div>
                <Card>
                  <CardHeader>
					<CardTitle>Dashboard del Propietario</CardTitle>
                  </CardHeader>
                  <CardContent>
					{hotels.length > 0 ? (
						<div>
							<h2 className="text-xl font-semibold mb-2">Mis Hoteles</h2>
							<ul>
								{hotels.map(hotel => (
									<li key={hotel.id} className="p-2 border-b">
										{hotel.name}
									</li>
								))}
							</ul>
						</div>
					) : (
						<div className="text-center p-4 border-2 border-dashed rounded-lg">
							<h3 className="text-lg font-semibold">
								¡Bienvenido a Smart Suite!
							</h3>
							<p className="text-muted-foreground mt-1">
								Parece que aún no tienes hoteles registrados.
							</p>
							<Button
								onClick={() => setIsHotelFormOpen(true)}
								className="mt-4"
							>
								Crear Mi Primer Hotel
							</Button>
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