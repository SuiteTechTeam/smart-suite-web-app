"use client"
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
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
  Activity,
  AlertTriangle,
  Eye,
  EyeOff,
  Zap,
  Gauge,
  Bell,
  Clock,
  RefreshCw
} from "lucide-react"
import { getAllRooms, Room } from "@/lib/services/rooms-service"
import { getAllIoTDevices, getRoomDevicesByRoom, getNotificationsByRoom, IoTDevice, RoomDevice, NotificationHistory, fetchNotificationHistoryByRoom, IoTMetricData, SensorData, DeviceStatus } from "@/lib/services/iot-service"
import { IoTAlerts } from "@/components/iot-alerts"
import { IoTStats } from "@/components/iot-stats"

interface LegacySensorData {
  id: number;
  registrationDate: string;
  roomDeviceId: number;
  metric: string;
}

interface ParsedMetric {
  temp: number;
  hum: number;
  motion: boolean;
  smoke: number;
  servo1: number;
  servo2: number;
  stamp: number;
}

interface RoomStatus {
  id: number;
  name: string;
  floor: number;
  status: "occupied" | "available" | "maintenance";
  devices: string[];
  iotData?: IoTMetricData[];
}

const parseMetric = (metricString: string): ParsedMetric => {
  const parts = metricString.split(';');
  const result: ParsedMetric = {
    temp: 0,
    hum: 0,
    motion: false,
    smoke: 0,
    servo1: 0,
    servo2: 0,
    stamp: 0
  };

  parts.forEach(part => {
    const [key, value] = part.split(':');
    switch (key) {
      case 'temp':
        result.temp = parseFloat(value);
        break;
      case 'hum':
        result.hum = parseFloat(value);
        break;
      case 'motion':
        result.motion = value === 'true';
        break;
      case 'smoke':
        result.smoke = parseFloat(value);
        break;
      case 'servo1':
        result.servo1 = parseFloat(value);
        break;
      case 'servo2':
        result.servo2 = parseFloat(value);
        break;
      case 'stamp':
        result.stamp = parseInt(value);
        break;
    }
  });

  return result;
};

const convertRoomToAnalyticsRoom = (room: Room): RoomStatus => ({
  id: room.id,
  name: room.room_number || `Habitación ${room.id}`,
  floor: room.floor || Math.floor(room.id / 100) || 1,
  status: room.state as "occupied" | "available" | "maintenance",
  devices: ["luz", "termostato", "cerradura", "wifi"]
});

const statusConfig = {
  occupied: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    label: "Ocupada",
    dot: "bg-emerald-500",
  },
  available: {
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    label: "Disponible",
    dot: "bg-blue-500",
  },
  maintenance: {
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    label: "Mantenimiento",
    dot: "bg-amber-500",
  },
}

export default function IoTDashboard() {
  const [selectedRoom, setSelectedRoom] = useState<RoomStatus | null>(null)
  const [roomsData, setRoomsData] = useState<RoomStatus[]>([])
  const [iotDevices, setIotDevices] = useState<IoTDevice[]>([])
  const [roomDevices, setRoomDevices] = useState<RoomDevice[]>([])
  const [notifications, setNotifications] = useState<NotificationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [deviceStates, setDeviceStates] = useState<{
    luz: boolean
    termostato: number
    cerradura: boolean
    wifi: boolean
    servo1: number
    servo2: number
    motion: boolean
  }>({
    luz: false,
    termostato: 22,
    cerradura: true,
    wifi: true,
    servo1: 0,
    servo2: 0,
    motion: false,
  })

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
        
        const hotelId = parseInt(localStorage.getItem('selected_hotel_id') || '1');
        
        // Cargar habitaciones
        const roomsResult = await getAllRooms(token, hotelId);
        if (roomsResult.success && roomsResult.data && roomsResult.data.length > 0) {
          const analyticsRooms = roomsResult.data.map(convertRoomToAnalyticsRoom);
          setRoomsData(analyticsRooms);
          setSelectedRoom(analyticsRooms[0]);
        }
        
        // Cargar dispositivos IoT
        const iotResult = await getAllIoTDevices(token);
        if (iotResult.success && iotResult.data) {
          setIotDevices(iotResult.data);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Cargar datos de la habitación seleccionada
  useEffect(() => {
    if (selectedRoom) {
      loadRoomData(selectedRoom.id);
    }
  }, [selectedRoom]);

  const loadRoomData = async (roomId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      // Cargar dispositivos de la habitación
      const devicesResult = await getRoomDevicesByRoom(roomId, token);
      if (devicesResult.success && devicesResult.data) {
        setRoomDevices(devicesResult.data);
      }
      
      // Cargar notificaciones de la habitación
      const notificationsResult = await getNotificationsByRoom(roomId, token);
      if (notificationsResult.success && notificationsResult.data) {
        setNotifications(notificationsResult.data);
      }
      
      // Cargar datos de sensores (simulado por ahora)
      await loadSensorData(roomId, token);
      
    } catch (error) {
      console.error('Error loading room data:', error);
    }
  };

  const loadSensorData = async (roomId: number, token: string) => {
    try {
      const result = await fetchNotificationHistoryByRoom(roomId, token);
      
      if (result.success && result.data) {
        const iotData = result.data;
        if (selectedRoom) {
          setSelectedRoom(prev => prev ? { ...prev, iotData } : null);
        }
        
        // Actualizar estados de dispositivos basado en datos reales
        const latestSensorData = iotData
          .filter(item => item.type === 'sensor')
          .pop();
          
        if (latestSensorData && latestSensorData.type === 'sensor') {
          const sensorData = latestSensorData.data as SensorData;
          setDeviceStates(prev => ({
            ...prev,
            servo1: sensorData.servo1 || 0,
            servo2: sensorData.servo2 || 0,
            termostato: sensorData.temp || 22,
            motion: sensorData.motion || false
          }));
        }
      }
    } catch (error) {
      console.error('Error loading sensor data:', error);
    }
  };

  const handleDeviceToggle = async (deviceType: string, value: boolean | number) => {
    setDeviceStates(prev => ({
      ...prev,
      [deviceType]: value
    }));
    
    // Aquí se enviaría la actualización al servidor
    console.log(`Actualizando ${deviceType} a:`, value);
  };

  const filteredRooms = roomsData.filter(room =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: "occupied" | "available" | "maintenance") => (
    <Badge variant="outline" className={statusConfig[status].color}>
      <div className={`w-2 h-2 rounded-full ${statusConfig[status].dot} mr-2`} />
      {statusConfig[status].label}
    </Badge>
  );

  const handleRoomSelect = (room: RoomStatus) => {
    setSelectedRoom(room);
    setSidebarOpen(false);
  };

  const refreshData = () => {
    if (selectedRoom) {
      loadRoomData(selectedRoom.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-background border-r transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Habitaciones IoT</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar habitación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleRoomSelect(room)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRoom?.id === room.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{room.name}</h3>
                    <p className="text-sm text-muted-foreground">Piso {room.floor}</p>
                  </div>
                  {getStatusBadge(room.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Dashboard IoT</h1>
                <p className="text-muted-foreground">
                  {selectedRoom ? `Habitación ${selectedRoom.name}` : 'Selecciona una habitación'}
                </p>
              </div>
            </div>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Content */}
        {selectedRoom ? (
          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Vista General</TabsTrigger>
                <TabsTrigger value="sensors">Sensores</TabsTrigger>
                <TabsTrigger value="devices">Dispositivos</TabsTrigger>
                <TabsTrigger value="device-status">Estado del Dispositivo</TabsTrigger>
                <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatusCard
                    icon={<Thermometer className="h-4 w-4" />}
                    title="Temperatura"
                    status={`${deviceStates.termostato.toFixed(1)}°C`}
                    active={true}
                    color="text-blue-600"
                  />
                  <StatusCard
                    icon={<Activity className="h-4 w-4" />}
                    title="Movimiento"
                    status={deviceStates.motion ? "Detectado" : "Sin movimiento"}
                    active={deviceStates.motion}
                    color="text-green-600"
                  />
                  <StatusCard
                    icon={<AlertTriangle className="h-4 w-4" />}
                    title="Humo"
                    status="Normal"
                    active={false}
                    color="text-orange-600"
                  />
                  <StatusCard
                    icon={<Zap className="h-4 w-4" />}
                    title="Servo 1"
                    status={`${deviceStates.servo1}°`}
                    active={deviceStates.servo1 > 0}
                    color="text-purple-600"
                  />
                </div>

                                 {/* Estadísticas de Sensores */}
                 {selectedRoom.iotData && selectedRoom.iotData.length > 0 && (
                   <Card>
                     <CardHeader>
                       <CardTitle>Estadísticas en Tiempo Real</CardTitle>
                       <CardDescription>
                         Resumen de los datos de sensores de la habitación {selectedRoom.name}
                       </CardDescription>
                     </CardHeader>
                     <CardContent>
                       <div className="space-y-4">
                         {/* Datos de Sensores */}
                         <div>
                           <h4 className="font-medium mb-2">Datos de Sensores</h4>
                           {selectedRoom.iotData.filter(item => item.type === 'sensor').slice(-5).map((item) => {
                             const sensorData = item.data as SensorData;
                             return (
                               <div key={item.id} className="p-3 border rounded-lg mb-2">
                                 <div className="flex justify-between items-center mb-2">
                                   <span className="text-sm font-medium">
                                     {new Date(item.registrationDate).toLocaleString()}
                                   </span>
                                   <Badge variant="outline">#{item.id}</Badge>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2 text-sm">
                                   <div>🌡️ Temperatura: {sensorData.temp?.toFixed(1)}°C</div>
                                   <div>💧 Humedad: {sensorData.hum}%</div>
                                   <div>👁️ Movimiento: {sensorData.motion ? 'Sí' : 'No'}</div>
                                   <div>🔥 Humo: {sensorData.smoke?.toFixed(1)}</div>
                                   <div>⚙️ Servo 1: {sensorData.servo1}°</div>
                                   <div>⚙️ Servo 2: {sensorData.servo2}°</div>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                         
                         {/* Estado del Dispositivo */}
                         <div>
                           <h4 className="font-medium mb-2">Estado del Dispositivo</h4>
                           {selectedRoom.iotData.filter(item => item.type === 'device_status').slice(-3).map((item) => {
                             const deviceStatus = item.data as DeviceStatus;
                             return (
                               <div key={item.id} className="p-3 border rounded-lg mb-2">
                                 <div className="flex justify-between items-center mb-2">
                                   <span className="text-sm font-medium">
                                     {new Date(item.registrationDate).toLocaleString()}
                                   </span>
                                   <Badge variant="outline">#{item.id}</Badge>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2 text-sm">
                                   <div>📡 Estado: {deviceStatus.device_status}</div>
                                   <div>🔋 Batería: {deviceStatus.battery}</div>
                                   <div>📶 Señal: {deviceStatus.signal}</div>
                                   <div>🕐 Última conexión: {deviceStatus.last_seen ? new Date(deviceStatus.last_seen).toLocaleString() : 'N/A'}</div>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 )}

                 {/* Charts */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Temperatura - Últimas 24h</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={selectedRoom.iotData?.filter(item => item.type === 'sensor').slice(-24).map(item => {
                          const sensorData = item.data as SensorData;
                          return {
                            time: new Date(item.registrationDate).toLocaleTimeString(),
                            temperatura: sensorData.temp || 0
                          };
                        }) || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="temperatura" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Humedad - Últimas 24h</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={selectedRoom.iotData?.filter(item => item.type === 'sensor').slice(-24).map(item => {
                          const sensorData = item.data as SensorData;
                          return {
                            time: new Date(item.registrationDate).toLocaleTimeString(),
                            humedad: sensorData.hum || 0
                          };
                        }) || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="humedad" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

                             <TabsContent value="sensors" className="space-y-4">
                 {/* Alertas de Sensores */}
                 {selectedRoom.iotData && selectedRoom.iotData.length > 0 && (
                   <Card>
                     <CardHeader>
                       <CardTitle>Alertas de Sensores</CardTitle>
                       <CardDescription>
                         Estado actual de los sensores de la habitación {selectedRoom.name}
                       </CardDescription>
                     </CardHeader>
                     <CardContent>
                       {(() => {
                         const latestSensorData = selectedRoom.iotData.filter(item => item.type === 'sensor').pop();
                         const sensorData = latestSensorData?.data as SensorData;
                         return (
                           <IoTAlerts
                             temperature={deviceStates.termostato}
                             humidity={sensorData?.hum || 0}
                             motion={deviceStates.motion}
                             smoke={sensorData?.smoke || 0}
                             timestamp={latestSensorData?.registrationDate || new Date().toISOString()}
                           />
                         );
                       })()}
                     </CardContent>
                   </Card>
                 )}
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Datos de Sensores en Tiempo Real</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedRoom.iotData && selectedRoom.iotData.length > 0 ? (
                        <div className="space-y-4">
                          {selectedRoom.iotData.filter(item => item.type === 'sensor').slice(-5).reverse().map((item, index) => {
                            const sensorData = item.data as SensorData;
                            return (
                              <div key={item.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium">
                                    {new Date(item.registrationDate).toLocaleString()}
                                  </span>
                                  <Badge variant="outline">#{item.id}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>🌡️ Temperatura: {sensorData.temp?.toFixed(1)}°C</div>
                                  <div>💧 Humedad: {sensorData.hum}%</div>
                                  <div>👁️ Movimiento: {sensorData.motion ? 'Sí' : 'No'}</div>
                                  <div>🔥 Humo: {sensorData.smoke?.toFixed(1)}</div>
                                  <div>⚙️ Servo 1: {sensorData.servo1}°</div>
                                  <div>⚙️ Servo 2: {sensorData.servo2}°</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No hay datos de sensores disponibles
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Control de Servos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="servo1">Servo 1: {deviceStates.servo1}°</Label>
                          <Slider
                            id="servo1"
                            value={[deviceStates.servo1]}
                            onValueChange={([value]) => handleDeviceToggle('servo1', value)}
                            max={180}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="servo2">Servo 2: {deviceStates.servo2}°</Label>
                          <Slider
                            id="servo2"
                            value={[deviceStates.servo2]}
                            onValueChange={([value]) => handleDeviceToggle('servo2', value)}
                            max={180}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="devices" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <DeviceCard
                    icon={<Lightbulb className="h-6 w-6" />}
                    title="Iluminación"
                    description="Control de luces de la habitación"
                    footer="Estado actual"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Luz principal</span>
                      <Switch
                        checked={deviceStates.luz}
                        onCheckedChange={(checked) => handleDeviceToggle('luz', checked)}
                      />
                    </div>
                  </DeviceCard>

                  <DeviceCard
                    icon={<Thermometer className="h-6 w-6" />}
                    title="Termostato"
                    description="Control de temperatura"
                    footer="Temperatura actual"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Temperatura</span>
                        <span className="font-medium">{deviceStates.termostato}°C</span>
                      </div>
                      <Slider
                        value={[deviceStates.termostato]}
                        onValueChange={([value]) => handleDeviceToggle('termostato', value)}
                        max={30}
                        min={16}
                        step={0.5}
                      />
                    </div>
                  </DeviceCard>

                  <DeviceCard
                    icon={<Lock className="h-6 w-6" />}
                    title="Cerradura"
                    description="Control de acceso"
                    footer="Estado de seguridad"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Cerradura</span>
                      <Switch
                        checked={deviceStates.cerradura}
                        onCheckedChange={(checked) => handleDeviceToggle('cerradura', checked)}
                      />
                    </div>
                  </DeviceCard>

                  <DeviceCard
                    icon={<Wifi className="h-6 w-6" />}
                    title="WiFi"
                    description="Conexión de red"
                    footer="Estado de conexión"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Conexión</span>
                      <Switch
                        checked={deviceStates.wifi}
                        onCheckedChange={(checked) => handleDeviceToggle('wifi', checked)}
                      />
                    </div>
                  </DeviceCard>
                </div>
              </TabsContent>

              <TabsContent value="device-status" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Estado del Dispositivo</CardTitle>
                    <CardDescription>
                      Información de conectividad y estado del dispositivo IoT
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedRoom.iotData && selectedRoom.iotData.length > 0 ? (
                      <div className="space-y-4">
                        {selectedRoom.iotData.filter(item => item.type === 'device_status').slice(-10).reverse().map((item) => {
                          const deviceStatus = item.data as DeviceStatus;
                          return (
                            <div key={item.id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium">
                                  {new Date(item.registrationDate).toLocaleString()}
                                </span>
                                <Badge variant="outline">#{item.id}</Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${deviceStatus.device_status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                  <span className="text-sm">Estado: <strong>{deviceStatus.device_status}</strong></span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                  <span className="text-sm">Batería: <strong>{deviceStatus.battery}</strong></span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                  <span className="text-sm">Señal: <strong>{deviceStatus.signal}</strong></span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                  <span className="text-sm">Última conexión: <strong>{deviceStatus.last_seen ? new Date(deviceStatus.last_seen).toLocaleString() : 'N/A'}</strong></span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No hay datos de estado del dispositivo disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Notificaciones</CardTitle>
                    <CardDescription>
                      Últimas notificaciones de la habitación {selectedRoom.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                            <div className="flex-shrink-0">
                              <Bell className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{notification.message}</p>
                              <p className="text-sm text-muted-foreground">
                                Tipo: {notification.notification_type}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(notification.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <Badge variant={notification.is_read ? "secondary" : "default"}>
                              {notification.is_read ? "Leída" : "Nueva"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No hay notificaciones disponibles
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecciona una habitación</h3>
              <p className="text-muted-foreground">
                Elige una habitación del panel lateral para ver sus datos IoT
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg ${active ? 'bg-primary/10' : 'bg-muted'}`}>
            <div className={color}>{icon}</div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{status}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-primary/10">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
      <CardContent className="pt-0">
        <Separator className="my-4" />
        <p className="text-sm text-muted-foreground">{footer}</p>
      </CardContent>
    </Card>
  );
}
