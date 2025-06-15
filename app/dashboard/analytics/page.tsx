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
  ChevronLeft
} from "lucide-react"

type RoomStatus = "occupied" | "vacant" | "maintenance"

interface Room {
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

const roomsData: Room[] = [
  {
    id: 101,
    name: "Habitación 101",
    floor: 1,
    status: "occupied",
    devices: ["luz", "termostato", "cerradura", "wifi"],
  },
  { id: 102, name: "Habitación 102", floor: 1, status: "vacant", devices: ["luz", "termostato", "cerradura", "wifi"] },
  {
    id: 103,
    name: "Habitación 103",
    floor: 1,
    status: "maintenance",
    devices: ["luz", "termostato", "cerradura", "wifi"],
  },
  {
    id: 201,
    name: "Habitación 201",
    floor: 2,
    status: "occupied",
    devices: ["luz", "termostato", "cerradura", "wifi"],
  },
  { id: 202, name: "Habitación 202", floor: 2, status: "vacant", devices: ["luz", "termostato", "cerradura", "wifi"] },
  {
    id: 203,
    name: "Habitación 203",
    floor: 2,
    status: "occupied",
    devices: ["luz", "termostato", "cerradura", "wifi"],
  },
]

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

export default function HotelRoomDashboard() {
  const [selectedRoom, setSelectedRoom] = useState<Room>(roomsData[0])
  const [temperatureData, setTemperatureData] = useState<TemperatureData[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [deviceStates, setDeviceStates] = useState<{
    luz: boolean
    termostato: number
    cerradura: boolean
    wifi: boolean
  }>({
    luz: false,
    termostato: 22,
    cerradura: true,
    wifi: true,
  })
  const [search, setSearch] = useState("")

  useEffect(() => {
    setTemperatureData(generateTemperatureData(selectedRoom.id))
  }, [selectedRoom])

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room)
    setDeviceStates({
      luz: Math.random() > 0.5,
      termostato: 20 + Math.floor(Math.random() * 5),
      cerradura: Math.random() > 0.3,
      wifi: Math.random() > 0.1,
    })
    setSidebarOpen(false)
  }

  const getStatusBadge = (status: RoomStatus) => (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[status].color}`}>
      <div className={`w-2 h-2 rounded-full mr-1.5 ${statusConfig[status].dot}`} />
      {statusConfig[status].label}
    </div>
  )

  const filteredRooms = roomsData.filter(room =>
    room.name.toLowerCase().includes(search.toLowerCase()) ||
    String(room.id).includes(search)
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border shadow-xl">
            <RoomSidebar 
              search={search}
              setSearch={setSearch}
              filteredRooms={filteredRooms}
              selectedRoom={selectedRoom}
              handleRoomSelect={handleRoomSelect}
              getStatusBadge={getStatusBadge}
              setSidebarOpen={setSidebarOpen}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col border-r border-border bg-card">
        <RoomSidebar 
          search={search}
          setSearch={setSearch}
          filteredRooms={filteredRooms}
          selectedRoom={selectedRoom}
          handleRoomSelect={handleRoomSelect}
          getStatusBadge={getStatusBadge}
          setSidebarOpen={setSidebarOpen}
          isMobile={false}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{selectedRoom.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Piso {selectedRoom.floor}</span>
                <span>•</span>
                {getStatusBadge(selectedRoom.status)}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            <Tabs defaultValue="devices" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="devices" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Dispositivos</span>
                </TabsTrigger>
                <TabsTrigger value="temperature" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Temperatura</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Configuración</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="devices" className="space-y-6">
                {/* Quick Status Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatusCard 
                    icon={deviceStates.luz ? <Lightbulb className="h-6 w-6" /> : <LightbulbOff className="h-6 w-6" />}
                    title="Iluminación"
                    status={deviceStates.luz ? "Encendida" : "Apagada"}
                    active={deviceStates.luz}
                    color="amber"
                  />
                  <StatusCard 
                    icon={<Thermometer className="h-6 w-6" />}
                    title="Temperatura"
                    status={`${deviceStates.termostato}°C`}
                    active={true}
                    color="red"
                  />
                  <StatusCard 
                    icon={<Lock className="h-6 w-6" />}
                    title="Cerradura"
                    status={deviceStates.cerradura ? "Bloqueada" : "Desbloqueada"}
                    active={deviceStates.cerradura}
                    color="indigo"
                  />
                  <StatusCard 
                    icon={<Wifi className="h-6 w-6" />}
                    title="WiFi"
                    status={deviceStates.wifi ? "Activo" : "Inactivo"}
                    active={deviceStates.wifi}
                    color="emerald"
                  />
                </div>

                {/* Device Controls */}
                <div className="grid gap-6 md:grid-cols-2">
                  <DeviceCard
                    icon={deviceStates.luz ? <Lightbulb className="h-5 w-5 text-amber-500" /> : <LightbulbOff className="h-5 w-5 text-muted-foreground" />}
                    title="Iluminación"
                    description="Control de luces de la habitación"
                    footer="Última activación: hace 35 minutos"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{deviceStates.luz ? "Encendida" : "Apagada"}</span>
                      <Switch 
                        checked={deviceStates.luz} 
                        onCheckedChange={(checked) => setDeviceStates(prev => ({ ...prev, luz: checked }))} 
                      />
                    </div>
                  </DeviceCard>

                  <DeviceCard
                    icon={<Thermometer className="h-5 w-5 text-red-500" />}
                    title="Termostato"
                    description="Control de temperatura"
                    footer="Modo: Automático"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{deviceStates.termostato}°C</div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setDeviceStates(prev => ({
                              ...prev,
                              termostato: Math.max(16, prev.termostato - 1),
                            }))
                          }
                        >
                          -
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setDeviceStates(prev => ({
                              ...prev,
                              termostato: Math.min(30, prev.termostato + 1),
                            }))
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </DeviceCard>

                  <DeviceCard
                    icon={<Lock className="h-5 w-5 text-indigo-500" />}
                    title="Cerradura Inteligente"
                    description="Control de acceso a la habitación"
                    footer="Último acceso: 14:27"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{deviceStates.cerradura ? "Bloqueada" : "Desbloqueada"}</span>
                      <Switch
                        checked={deviceStates.cerradura}
                        onCheckedChange={(checked) => setDeviceStates(prev => ({ ...prev, cerradura: checked }))}
                      />
                    </div>
                  </DeviceCard>

                  <DeviceCard
                    icon={<Wifi className="h-5 w-5 text-emerald-500" />}
                    title="WiFi"
                    description="Control de conexión a internet"
                    footer="Dispositivos conectados: 2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{deviceStates.wifi ? "Activo" : "Inactivo"}</span>
                      <Switch
                        checked={deviceStates.wifi}
                        onCheckedChange={(checked) => setDeviceStates(prev => ({ ...prev, wifi: checked }))}
                      />
                    </div>
                  </DeviceCard>
                </div>
              </TabsContent>

              <TabsContent value="temperature">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Temperatura (24h)</CardTitle>
                    <CardDescription>Temperatura registrada en °C para {selectedRoom.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] md:h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={temperatureData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="time" 
                            className="fill-muted-foreground text-xs"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            domain={[18, 28]} 
                            className="fill-muted-foreground text-xs"
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="temperatura"
                            stroke="hsl(var(--destructive))"
                            strokeWidth={2}
                            dot={{ r: 3, strokeWidth: 2 }}
                            activeDot={{ r: 5, strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                        Promedio: 22.5°C
                      </Badge>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                        Mínima: 19.8°C
                      </Badge>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                        Máxima: 24.7°C
                      </Badge>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de la Habitación</CardTitle>
                    <CardDescription>Ajustes y preferencias para {selectedRoom.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <SettingItem
                      title="Modo Ahorro de Energía"
                      description="Reducir consumo cuando esté desocupada"
                      defaultChecked={true}
                    />
                    <Separator />
                    <SettingItem
                      title="No Molestar"
                      description="Desactivar notificaciones al personal"
                      defaultChecked={false}
                    />
                    <Separator />
                    <SettingItem
                      title="Limpieza Automática"
                      description="Programar limpieza diaria"
                      defaultChecked={true}
                    />
                    <Separator />
                    <SettingItem
                      title="Modo Automático"
                      description="Ajustar dispositivos según ocupación"
                      defaultChecked={true}
                    />
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                    <Button variant="outline" className="w-full sm:w-auto">Restablecer valores</Button>
                    <Button className="w-full sm:w-auto">Guardar cambios</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
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
  filteredRooms: Room[]
  selectedRoom: Room
  handleRoomSelect: (room: Room) => void
  getStatusBadge: (status: RoomStatus) => void
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