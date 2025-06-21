"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BedDouble, 
  WifiOff, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Activity,
  Zap,
  Thermometer,
  Droplets,
  Camera,
  Shield
} from "lucide-react";

// Importar servicios de la API
import { getAllRooms, type Room } from "@/lib/services/rooms-service";
import { getAllIoTDevices, getNotificationsByRoom, type IoTDevice, type NotificationHistory } from "@/lib/services/iot-service";
import { getAllSupplies } from "@/lib/services/supply-service";
import { useAuth } from "@/hooks/use-auth";

// Interfaces para los datos calculados
interface MonthlyMetrics {
  month: string;
  year: number;
  occupancyRate: number;
  averageRoomRate: number;
  totalRevenue: number;
  maintenanceRequests: number;
  customerSatisfaction: number;
  iotDevicesActive: number;
  iotDevicesInactive: number;
  energyConsumption: number;
  waterConsumption: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  maintenanceRooms: number;
}

interface RoomDeficiency {
  roomNumber: string;
  deficiencyCount: number;
  lastIssue: string;
  severity: "low" | "medium" | "high";
  type: string;
}

interface IoTMetrics {
  deviceType: string;
  totalDevices: number;
  activeDevices: number;
  batteryLow: number;
  maintenanceNeeded: number;
  avgResponseTime: number;
}

const StatCard = ({ title, value, description, icon, trend }: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}) => {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {trend && (
            <div className={`flex items-center ${
              trend === "up" ? "text-green-600" : 
              trend === "down" ? "text-red-600" : "text-gray-600"
            }`}>
              {trend === "up" && <TrendingUp className="h-4 w-4" />}
              {trend === "down" && <TrendingDown className="h-4 w-4" />}
            </div>
          )}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default function AnalyticsPage() {
  const [selectedMonth, setSelectedMonth] = useState("diciembre");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los datos de la API
  const [rooms, setRooms] = useState<Room[]>([]);
  const [iotDevices, setIoTDevices] = useState<IoTDevice[]>([]);
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [supplies, setSupplies] = useState<any[]>([]);
  
  // Hook de autenticación
  const { user } = useAuth();

  // Función para calcular métricas basadas en datos reales
  const calculateMetrics = (): MonthlyMetrics => {
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(room => room.state === "occupied").length;
    const vacantRooms = rooms.filter(room => room.state === "available").length;
    const maintenanceRooms = rooms.filter(room => room.state === "maintenance").length;
    
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    const averageRoomRate = totalRooms > 0 ? rooms.reduce((sum, room) => sum + room.price, 0) / totalRooms : 0;
    const totalRevenue = occupiedRooms * averageRoomRate * 30; // Estimación mensual
    
    const iotDevicesActive = iotDevices.filter(device => device.status === "active").length;
    const iotDevicesInactive = iotDevices.filter(device => device.status !== "active").length;
    
    return {
      month: "Diciembre",
      year: 2024,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      averageRoomRate: Math.round(averageRoomRate * 100) / 100,
      totalRevenue: Math.round(totalRevenue),
      maintenanceRequests: notifications.length,
      customerSatisfaction: 4.2, // Este podría calcularse de otra fuente
      iotDevicesActive,
      iotDevicesInactive,
      energyConsumption: 12450, // Estos requerirían APIs adicionales
      waterConsumption: 8900,
      totalRooms,
      occupiedRooms,
      vacantRooms,
      maintenanceRooms
    };
  };

  // Función para calcular deficiencias de habitaciones
  const calculateRoomDeficiencies = (): RoomDeficiency[] => {
    const roomNotifications: { [key: string]: NotificationHistory[] } = {};
    
    // Agrupar notificaciones por habitación
    notifications.forEach(notification => {
      const roomKey = notification.room_id.toString();
      if (!roomNotifications[roomKey]) {
        roomNotifications[roomKey] = [];
      }
      roomNotifications[roomKey].push(notification);
    });

    // Crear lista de deficiencias
    const deficiencies: RoomDeficiency[] = [];
    Object.entries(roomNotifications).forEach(([roomId, roomNotifs]) => {
      const room = rooms.find(r => r.id.toString() === roomId);
      if (room && roomNotifs.length > 0) {
        const latestNotif = roomNotifs.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        
        deficiencies.push({
          roomNumber: room.room_number,
          deficiencyCount: roomNotifs.length,
          lastIssue: latestNotif.message,
          severity: roomNotifs.length >= 5 ? "high" : roomNotifs.length >= 3 ? "medium" : "low",
          type: latestNotif.notification_type
        });
      }
    });

    return deficiencies.sort((a, b) => b.deficiencyCount - a.deficiencyCount).slice(0, 5);
  };

  // Función para calcular métricas IoT
  const calculateIoTMetrics = (): IoTMetrics[] => {
    const deviceTypes: { [key: string]: IoTDevice[] } = {};
    
    // Agrupar dispositivos por tipo
    iotDevices.forEach(device => {
      if (!deviceTypes[device.device_type]) {
        deviceTypes[device.device_type] = [];
      }
      deviceTypes[device.device_type].push(device);
    });

    return Object.entries(deviceTypes).map(([type, devices]) => ({
      deviceType: type,
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.status === "active").length,
      batteryLow: devices.filter(d => d.battery_level && d.battery_level < 20).length,
      maintenanceNeeded: devices.filter(d => d.status === "maintenance").length,
      avgResponseTime: Math.random() * 2 + 0.5 // Simulado - requeriría métricas adicionales
    }));
  };

  // Cargar datos de las APIs
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        // Cargar todas las APIs en paralelo
        const [roomsResult, iotResult, suppliesResult] = await Promise.all([
          getAllRooms(token),
          getAllIoTDevices(token),
          getAllSupplies(token)
        ]);

        if (!roomsResult.success) {
          throw new Error(roomsResult.message || 'Error al cargar habitaciones');
        }
        if (!iotResult.success) {
          throw new Error(iotResult.message || 'Error al cargar dispositivos IoT');
        }
        if (!suppliesResult.success) {
          console.warn('Error al cargar suministros:', suppliesResult.message);
        }

        setRooms(roomsResult.data || []);
        setIoTDevices(iotResult.data || []);
        setSupplies(suppliesResult.data || []);

        // Cargar notificaciones para cada habitación
        if (roomsResult.data && roomsResult.data.length > 0) {
          const allNotifications: NotificationHistory[] = [];
          
          for (const room of roomsResult.data.slice(0, 10)) { // Limitar para evitar muchas requests
            try {
              const notifResult = await getNotificationsByRoom(room.id, token);
              if (notifResult.success && notifResult.data) {
                allNotifications.push(...notifResult.data);
              }
            } catch (error) {
              console.warn(`Error al cargar notificaciones para habitación ${room.id}:`, error);
            }
          }
          
          setNotifications(allNotifications);
        }

      } catch (error: any) {
        console.error('Error al cargar datos:', error);
        setError(error.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, selectedMonth, selectedYear]);

  // Calcular métricas con datos reales
  const monthlyMetrics = calculateMetrics();
  const roomDeficiencies = calculateRoomDeficiencies();
  const iotMetrics = calculateIoTMetrics();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };
  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error al cargar datos</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen mensual de métricas y rendimiento del hotel
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enero">Enero</SelectItem>
              <SelectItem value="febrero">Febrero</SelectItem>
              <SelectItem value="marzo">Marzo</SelectItem>
              <SelectItem value="abril">Abril</SelectItem>
              <SelectItem value="mayo">Mayo</SelectItem>
              <SelectItem value="junio">Junio</SelectItem>
              <SelectItem value="julio">Julio</SelectItem>
              <SelectItem value="agosto">Agosto</SelectItem>
              <SelectItem value="septiembre">Septiembre</SelectItem>
              <SelectItem value="octubre">Octubre</SelectItem>
              <SelectItem value="noviembre">Noviembre</SelectItem>
              <SelectItem value="diciembre">Diciembre</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">        <StatCard
          title="Tasa de Ocupación"
          value={`${monthlyMetrics.occupancyRate}%`}
          description={`${monthlyMetrics.occupiedRooms}/${monthlyMetrics.totalRooms} habitaciones ocupadas`}
          icon={<BedDouble className="h-5 w-5 text-blue-600" />}
          trend={monthlyMetrics.occupancyRate > 70 ? "up" : "down"}
        />
        
        <StatCard
          title="Tarifa Promedio"
          value="S/.85"
          description="Precio promediado por habitación"
          icon={<DollarSign className="text-green-500" />}
          trend="up"
        />
        
        <StatCard
          title="Ingresos Estimados"
          value="S/.1,275"
          description="Ingresos mensuales estimados"
          icon={<TrendingUp className="text-green-500" />}
          trend="up"
        />
        
        <StatCard
          title="Dispositivos IoT"
          value={`${monthlyMetrics.iotDevicesActive}/${monthlyMetrics.iotDevicesActive + monthlyMetrics.iotDevicesInactive}`}
          description={`${monthlyMetrics.iotDevicesInactive} inactivos`}
          icon={<Activity className="h-5 w-5 text-blue-600" />}
          trend={monthlyMetrics.iotDevicesInactive < 5 ? "up" : "down"}
        />
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="rooms">Habitaciones</TabsTrigger>
          <TabsTrigger value="iot">Dispositivos IoT</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operational Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Métricas Operacionales
                </CardTitle>
              </CardHeader>              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Notificaciones Registradas</p>
                    <p className="text-2xl font-bold">{monthlyMetrics.maintenanceRequests}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Dispositivos IoT Activos</p>
                    <p className="text-2xl font-bold text-green-600">{monthlyMetrics.iotDevicesActive}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Habitaciones en Mantenimiento</p>
                    <p className="text-2xl font-bold text-orange-600">{monthlyMetrics.maintenanceRooms}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Suministros Registrados</p>
                    <p className="text-2xl font-bold">{supplies.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Estado General del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dispositivos IoT</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">{monthlyMetrics.iotDevicesActive} Activos</span>
                    <span className="text-sm text-red-600">{monthlyMetrics.iotDevicesInactive} Inactivos</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(monthlyMetrics.iotDevicesActive / (monthlyMetrics.iotDevicesActive + monthlyMetrics.iotDevicesInactive)) * 100}%` 
                    }}
                  ></div>
                </div>                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {monthlyMetrics.iotDevicesActive > 0 ? 
                        Math.round((monthlyMetrics.iotDevicesActive / (monthlyMetrics.iotDevicesActive + monthlyMetrics.iotDevicesInactive)) * 100) : 0}%
                      </p>
                    <p className="text-xs text-muted-foreground">Dispositivos Activos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{rooms.length}</p>
                    <p className="text-xs text-muted-foreground">Total Habitaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Habitaciones con Más Deficiencias - {monthlyMetrics.month} {monthlyMetrics.year}
              </CardTitle>
            </CardHeader>            <CardContent>
              <div className="space-y-4">
                {roomDeficiencies.length > 0 ? (
                  roomDeficiencies.map((room, index) => (
                    <div key={room.roomNumber} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold">#{index + 1}</div>
                        <div>
                          <p className="font-semibold">Habitación {room.roomNumber}</p>
                          <p className="text-sm text-muted-foreground">{room.lastIssue}</p>
                          <p className="text-xs text-muted-foreground">{room.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getSeverityColor(room.severity) as any}>
                          {room.severity === "high" ? "Alta" : room.severity === "medium" ? "Media" : "Baja"}
                        </Badge>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">{room.deficiencyCount}</p>
                          <p className="text-xs text-muted-foreground">Notificaciones</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-semibold">¡Excelente!</p>
                    <p className="text-muted-foreground">No hay habitaciones con deficiencias registradas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>        <TabsContent value="iot" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {iotMetrics.length > 0 ? (
              iotMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {metric.deviceType.toLowerCase().includes("temperatura") && <Thermometer className="h-5 w-5" />}
                      {metric.deviceType.toLowerCase().includes("movimiento") && <Activity className="h-5 w-5" />}
                      {metric.deviceType.toLowerCase().includes("cerradura") && <Shield className="h-5 w-5" />}
                      {metric.deviceType.toLowerCase().includes("cámara") && <Camera className="h-5 w-5" />}
                      {!metric.deviceType.toLowerCase().includes("temperatura") && 
                       !metric.deviceType.toLowerCase().includes("movimiento") && 
                       !metric.deviceType.toLowerCase().includes("cerradura") && 
                       !metric.deviceType.toLowerCase().includes("cámara") && <Activity className="h-5 w-5" />}
                      {metric.deviceType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-xl font-bold">{metric.totalDevices}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Activos</p>
                        <p className="text-xl font-bold text-green-600">{metric.activeDevices}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Batería Baja</p>
                        <p className="text-xl font-bold text-orange-600">{metric.batteryLow}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Requiere Mantenimiento</p>
                        <p className="text-xl font-bold text-red-600">{metric.maintenanceNeeded}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">Estado General</p>
                      <p className="text-lg font-bold">
                        {metric.totalDevices > 0 ? 
                          `${Math.round((metric.activeDevices / metric.totalDevices) * 100)}% Funcional` : 
                          "Sin datos"
                        }
                      </p>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${metric.totalDevices > 0 ? (metric.activeDevices / metric.totalDevices) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold">No hay dispositivos IoT registrados</p>
                <p className="text-muted-foreground">Los dispositivos aparecerán aquí una vez que se registren en el sistema</p>
              </div>
            )}
          </div>
        </TabsContent>        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatCard
              title="Notificaciones Totales"
              value={notifications.length.toString()}
              description="Notificaciones registradas"
              icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
              trend={notifications.length < 10 ? "up" : "down"}
            />
            
            <StatCard
              title="Habitaciones en Mantenimiento"
              value={monthlyMetrics.maintenanceRooms.toString()}
              description="Requieren atención"
              icon={<Calendar className="h-5 w-5 text-blue-600" />}
              trend={monthlyMetrics.maintenanceRooms < 3 ? "up" : "down"}
            />
            
            <StatCard
              title="Dispositivos Inactivos"
              value={monthlyMetrics.iotDevicesInactive.toString()}
              description="Necesitan revisión"
              icon={<WifiOff className="h-5 w-5 text-red-600" />}
              trend={monthlyMetrics.iotDevicesInactive < 5 ? "up" : "down"}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Estados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Habitaciones Ocupadas</span>
                  <span className="font-bold text-green-600">{monthlyMetrics.occupiedRooms} habitaciones</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Habitaciones Vacantes</span>
                  <span className="font-bold text-blue-600">{monthlyMetrics.vacantRooms} habitaciones</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Habitaciones en Mantenimiento</span>
                  <span className="font-bold text-orange-600">{monthlyMetrics.maintenanceRooms} habitaciones</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dispositivos IoT Activos</span>
                  <span className="font-bold text-green-600">{monthlyMetrics.iotDevicesActive} dispositivos</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Suministros Registrados</span>
                  <span className="font-bold">{supplies.length} artículos</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {notifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Últimas Notificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification, index) => (
                    <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-sm text-muted-foreground">
                          Habitación: {rooms.find(r => r.id === notification.room_id)?.room_number || 'N/A'} - 
                          Tipo: {notification.notification_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </p>
                        <Badge variant={notification.is_read ? "outline" : "secondary"}>
                          {notification.is_read ? "Leída" : "Nueva"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}