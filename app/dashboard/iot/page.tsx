"use client"
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Thermometer, LightbulbOff, LightbulbIcon, Lock, Wifi, Home, Settings, BarChart3, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-mobile"

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

export default function Page() {
  const [selectedRoom, setSelectedRoom] = useState<Room>(roomsData[0])
  const [temperatureData, setTemperatureData] = useState<TemperatureData[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
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

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  useEffect(() => {
    setTemperatureData(generateTemperatureData(selectedRoom.id))
  }, [selectedRoom])

  const handleLightToggle = (checked: boolean) => {
    setDeviceStates((prev) => ({ ...prev, luz: checked }))
  }

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room)
    setDeviceStates({
      luz: Math.random() > 0.5,
      termostato: 20 + Math.floor(Math.random() * 5),
      cerradura: Math.random() > 0.3,
      wifi: Math.random() > 0.1,
    })
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const getStatusBadge = (status: RoomStatus) => (
    <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status].color}`}>
      {statusConfig[status].icon}
      {statusConfig[status].label}
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Hotel Smart Control</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sistema de gestión IoT</p>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Habitaciones</h2>
              <Badge variant="outline" className="text-xs font-normal">
                {roomsData.length} total
              </Badge>
            </div>
          </div>

          <ScrollArea className="flex-1 p-3">
            <div className="space-y-1">
              {roomsData.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                    selectedRoom.id === room.id
                      ? "bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/30",
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{room.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Piso {room.floor}</span>
                  </div>
                  {getStatusBadge(room.status)}
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <Settings className="h-4 w-4" />
              <span className="text-sm">Configuración</span>
            </div>
          </div>
        </div>
      </div>

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
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedRoom.name}</h1>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <span>Piso {selectedRoom.floor}</span>
                <span className="mx-2">•</span>
                {getStatusBadge(selectedRoom.status)}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Tabs defaultValue="devices" className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-slate-100 dark:bg-slate-800">
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
            </div>

            {/* Devices Tab */}
            <TabsContent value="devices" className="space-y-6">
              {/* Quick Status Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className={`p-3 rounded-full ${deviceStates.luz ? "bg-amber-100" : "bg-slate-100"} mb-3`}>
                      {deviceStates.luz ? (
                        <LightbulbIcon className="h-6 w-6 text-amber-500" />
                      ) : (
                        <LightbulbOff className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <h3 className="font-medium text-center">Iluminación</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                      {deviceStates.luz ? "Encendida" : "Apagada"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className="p-3 rounded-full bg-rose-100 mb-3">
                      <Thermometer className="h-6 w-6 text-rose-500" />
                    </div>
                    <h3 className="font-medium text-center">Temperatura</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                      {deviceStates.termostato}°C
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div
                      className={`p-3 rounded-full ${deviceStates.cerradura ? "bg-indigo-100" : "bg-slate-100"} mb-3`}
                    >
                      <Lock className="h-6 w-6 text-indigo-500" />
                    </div>
                    <h3 className="font-medium text-center">Cerradura</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                      {deviceStates.cerradura ? "Bloqueada" : "Desbloqueada"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className={`p-3 rounded-full ${deviceStates.wifi ? "bg-emerald-100" : "bg-slate-100"} mb-3`}>
                      <Wifi className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="font-medium text-center">WiFi</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                      {deviceStates.wifi ? "Activo" : "Inactivo"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Device Controls */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Light Control */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      {deviceStates.luz ? (
                        <LightbulbIcon className="h-5 w-5 text-amber-500 mr-2" />
                      ) : (
                        <LightbulbOff className="h-5 w-5 text-slate-400 mr-2" />
                      )}
                      <CardTitle>Iluminación</CardTitle>
                    </div>
                    <CardDescription>Control de luces de la habitación</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{deviceStates.luz ? "Encendida" : "Apagada"}</span>
                      <Switch checked={deviceStates.luz} onCheckedChange={handleLightToggle} />
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-slate-500 dark:text-slate-400 pt-0">
                    Última activación: hace 35 minutos
                  </CardFooter>
                </Card>

                {/* Thermostat Control */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <Thermometer className="h-5 w-5 text-rose-500 mr-2" />
                      <CardTitle>Termostato</CardTitle>
                    </div>
                    <CardDescription>Control de temperatura</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{deviceStates.termostato}°C</div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setDeviceStates((prev) => ({
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
                            setDeviceStates((prev) => ({
                              ...prev,
                              termostato: Math.min(30, prev.termostato + 1),
                            }))
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-slate-500 dark:text-slate-400 pt-0">Modo: Automático</CardFooter>
                </Card>

                {/* Lock Control */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-indigo-500 mr-2" />
                      <CardTitle>Cerradura Inteligente</CardTitle>
                    </div>
                    <CardDescription>Control de acceso a la habitación</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{deviceStates.cerradura ? "Bloqueada" : "Desbloqueada"}</span>
                      <Switch
                        checked={deviceStates.cerradura}
                        onCheckedChange={(checked) => setDeviceStates((prev) => ({ ...prev, cerradura: checked }))}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-slate-500 dark:text-slate-400 pt-0">
                    Último acceso: 14:27
                  </CardFooter>
                </Card>

                {/* WiFi Control */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <Wifi className="h-5 w-5 text-emerald-500 mr-2" />
                      <CardTitle>WiFi</CardTitle>
                    </div>
                    <CardDescription>Control de conexión a internet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{deviceStates.wifi ? "Activo" : "Inactivo"}</span>
                      <Switch
                        checked={deviceStates.wifi}
                        onCheckedChange={(checked) => setDeviceStates((prev) => ({ ...prev, wifi: checked }))}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-slate-500 dark:text-slate-400 pt-0">
                    Dispositivos conectados: 2
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Temperature Tab */}
            <TabsContent value="temperature">
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Histórico de Temperatura (24h)</CardTitle>
                  <CardDescription>Temperatura registrada en °C para {selectedRoom.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={temperatureData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
                        <YAxis domain={[18, 28]} stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="temperatura"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200">
                      Promedio: 22.5°C
                    </Badge>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      Mínima: 19.8°C
                    </Badge>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                      Máxima: 24.7°C
                    </Badge>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Configuración de la Habitación</CardTitle>
                  <CardDescription>Ajustes y preferencias para {selectedRoom.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Modo Ahorro de Energía</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Reducir consumo cuando esté desocupada
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">No Molestar</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Desactivar notificaciones al personal
                        </p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Limpieza Automática</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Programar limpieza diaria</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Modo Automático</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Ajustar dispositivos según ocupación
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Restablecer valores</Button>
                  <Button>Guardar cambios</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
