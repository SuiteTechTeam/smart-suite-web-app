"use client"
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { 
  Activity, 
  Battery, 
  Wifi, 
  Thermometer, 
  Lightbulb, 
  Lock, 
  Settings, 
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react"
import { getAllIoTDevices, getRoomDevicesByRoom, IoTDevice, RoomDevice } from "@/lib/services/iot-service"
import { getAllRooms, Room } from "@/lib/services/rooms-service"
import { useMediaQuery } from "@/hooks/use-mobile"

interface TemperatureData {
  time: string
  temperatura: number
}

const generateTemperatureData = (deviceId: number): TemperatureData[] => {
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

const deviceStatusConfig = {
  active: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "Activo",
    icon: <CheckCircle2 className="w-4 h-4" />,
    dotColor: "bg-emerald-500"
  },
  inactive: {
    color: "bg-gray-100 text-gray-700 border-gray-200",
    label: "Inactivo",
    icon: <Clock className="w-4 h-4" />,
    dotColor: "bg-gray-500"
  },
  maintenance: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Mantenimiento",
    icon: <AlertTriangle className="w-4 h-4" />,
    dotColor: "bg-amber-500"
  },
}

const deviceTypeIcons = {
  light: <Lightbulb className="w-5 h-5" />,
  thermostat: <Thermometer className="w-5 h-5" />,
  lock: <Lock className="w-5 h-5" />,
  wifi: <Wifi className="w-5 h-5" />,
  sensor: <Activity className="w-5 h-5" />,
  default: <Settings className="w-5 h-5" />
}

export default function IoTDashboard() {
  const [iotDevices, setIotDevices] = useState<IoTDevice[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null)
  const [temperatureData, setTemperatureData] = useState<TemperatureData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "maintenance">("all")
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.error('No auth token found');
          setLoading(false);
          return;
        }
        
        // Cargar dispositivos IoT
        const iotResult = await getAllIoTDevices(token);
        if (iotResult.success && iotResult.data) {
          setIotDevices(iotResult.data);
          if (iotResult.data.length > 0) {
            setSelectedDevice(iotResult.data[0]);
          }
        } else {
          console.error('Error loading IoT devices:', iotResult.message);
        }

        // Cargar habitaciones
        const roomsResult = await getAllRooms(token);
        if (roomsResult.success && roomsResult.data) {
          setRooms(roomsResult.data);
        } else {
          console.error('Error loading rooms:', roomsResult.message);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Actualizar datos de temperatura cuando se selecciona un dispositivo
  useEffect(() => {
    if (selectedDevice) {
      setTemperatureData(generateTemperatureData(selectedDevice.id));
    }
  }, [selectedDevice]);

  // Filtrar dispositivos
  const filteredDevices = iotDevices.filter(device => {
    const matchesSearch = device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.device_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: IoTDevice['status']) => (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${deviceStatusConfig[status].color}`}>
      <div className={`w-2 h-2 rounded-full mr-1.5 ${deviceStatusConfig[status].dotColor}`} />
      {deviceStatusConfig[status].label}
    </div>
  );

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    return deviceTypeIcons[type as keyof typeof deviceTypeIcons] || deviceTypeIcons.default;
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return "text-gray-400";
    if (level > 50) return "text-green-500";
    if (level > 20) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dispositivos IoT...</p>
        </div>
      </div>
    );
  }

  if (iotDevices.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No hay dispositivos IoT</h2>
          <p className="text-muted-foreground mb-4">No se encontraron dispositivos IoT en el sistema.</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Dispositivo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar con lista de dispositivos */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-4">Dispositivos IoT</h2>
          
          {/* Buscador */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar dispositivos..."
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            {(["all", "active", "inactive", "maintenance"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="text-xs"
              >
                {status === "all" ? "Todos" : deviceStatusConfig[status]?.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Lista de dispositivos */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredDevices.map((device) => (
              <Card
                key={device.id}
                className={`cursor-pointer transition-colors ${
                  selectedDevice?.id === device.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedDevice(device)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.device_type)}
                      <h3 className="font-medium">{device.device_name}</h3>
                    </div>
                    {getStatusBadge(device.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    Tipo: {device.device_type}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {device.battery_level && (
                      <div className="flex items-center gap-1">
                        <Battery className={`w-3 h-3 ${getBatteryColor(device.battery_level)}`} />
                        <span>{device.battery_level}%</span>
                      </div>
                    )}
                    {device.last_activity && (
                      <span>
                        Última actividad: {new Date(device.last_activity).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Panel principal */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedDevice ? (
          <div className="space-y-6">
            {/* Header del dispositivo */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {getDeviceIcon(selectedDevice.device_type)}
                  {selectedDevice.device_name}
                </h1>
                <p className="text-muted-foreground">
                  {selectedDevice.device_type} • ID: {selectedDevice.id}
                </p>
              </div>
              {getStatusBadge(selectedDevice.status)}
            </div>

            {/* Información del dispositivo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{deviceStatusConfig[selectedDevice.status].label}</div>
                  <p className="text-xs text-muted-foreground">
                    Última actualización: {selectedDevice.last_activity ? 
                      new Date(selectedDevice.last_activity).toLocaleString() : 
                      'No disponible'
                    }
                  </p>
                </CardContent>
              </Card>

              {selectedDevice.battery_level && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Batería</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      <Battery className={`w-6 h-6 ${getBatteryColor(selectedDevice.battery_level)}`} />
                      {selectedDevice.battery_level}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Nivel de carga actual
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Firmware</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedDevice.firmware_version || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Versión instalada
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de datos */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Sensor</CardTitle>
                <CardDescription>
                  Datos registrados en las últimas 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={temperatureData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="temperatura" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Temperatura (°C)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Selecciona un dispositivo</h2>
              <p className="text-muted-foreground">
                Elige un dispositivo de la lista para ver sus detalles
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
