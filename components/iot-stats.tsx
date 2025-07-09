"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer, Droplets, Eye, Flame, Zap, Gauge } from "lucide-react"

interface SensorStats {
  temperature: {
    current: number
    min: number
    max: number
    avg: number
  }
  humidity: {
    current: number
    min: number
    max: number
    avg: number
  }
  smoke: {
    current: number
    min: number
    max: number
    avg: number
  }
  motion: {
    current: boolean
    lastActivity: string
  }
  servos: {
    servo1: number
    servo2: number
  }
}

interface IoTStatsProps {
  sensorData: Array<{
    id: number
    registrationDate: string
    roomDeviceId: number
    metric: string
  }>
}

export function IoTStats({ sensorData }: IoTStatsProps) {
  if (!sensorData || sensorData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Sensores</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No se han registrado datos de sensores aún.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Parsear todos los datos de sensores
  const parsedData = sensorData.map(data => {
    const parts = data.metric.split(';')
    const result: any = {}
    parts.forEach(part => {
      const [key, value] = part.split(':')
      if (key === 'temp' || key === 'hum' || key === 'smoke' || key === 'servo1' || key === 'servo2') {
        result[key] = parseFloat(value)
      } else if (key === 'motion') {
        result[key] = value === 'true'
      }
    })
    return result
  })

  // Calcular estadísticas
  const temperatures = parsedData.map(d => d.temp).filter(t => !isNaN(t))
  const humidities = parsedData.map(d => d.hum).filter(h => !isNaN(h))
  const smokes = parsedData.map(d => d.smoke).filter(s => !isNaN(s))
  const motions = parsedData.map(d => d.motion)
  const servos1 = parsedData.map(d => d.servo1).filter(s => !isNaN(s))
  const servos2 = parsedData.map(d => d.servo2).filter(s => !isNaN(s))

  const stats: SensorStats = {
    temperature: {
      current: temperatures[temperatures.length - 1] || 0,
      min: Math.min(...temperatures) || 0,
      max: Math.max(...temperatures) || 0,
      avg: temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0
    },
    humidity: {
      current: humidities[humidities.length - 1] || 0,
      min: Math.min(...humidities) || 0,
      max: Math.max(...humidities) || 0,
      avg: humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : 0
    },
    smoke: {
      current: smokes[smokes.length - 1] || 0,
      min: Math.min(...smokes) || 0,
      max: Math.max(...smokes) || 0,
      avg: smokes.length > 0 ? smokes.reduce((a, b) => a + b, 0) / smokes.length : 0
    },
    motion: {
      current: motions[motions.length - 1] || false,
      lastActivity: sensorData[sensorData.length - 1]?.registrationDate || ''
    },
    servos: {
      servo1: servos1[servos1.length - 1] || 0,
      servo2: servos2[servos2.length - 1] || 0
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Temperatura */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
            <Thermometer className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.temperature.current.toFixed(1)}°C</div>
          <div className="text-xs text-muted-foreground mt-1">
            Min: {stats.temperature.min.toFixed(1)}°C | Max: {stats.temperature.max.toFixed(1)}°C
          </div>
          <div className="text-xs text-muted-foreground">
            Promedio: {stats.temperature.avg.toFixed(1)}°C
          </div>
        </CardContent>
      </Card>

      {/* Humedad */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Humedad</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.humidity.current}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            Min: {stats.humidity.min}% | Max: {stats.humidity.max}%
          </div>
          <div className="text-xs text-muted-foreground">
            Promedio: {stats.humidity.avg.toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      {/* Humo */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Nivel de Humo</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.smoke.current.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Min: {stats.smoke.min.toFixed(1)} | Max: {stats.smoke.max.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">
            Promedio: {stats.smoke.avg.toFixed(1)}
          </div>
          <Badge 
            variant={stats.smoke.current > 300 ? "destructive" : stats.smoke.current > 200 ? "secondary" : "default"}
            className="mt-2"
          >
            {stats.smoke.current > 300 ? "Crítico" : stats.smoke.current > 200 ? "Elevado" : "Normal"}
          </Badge>
        </CardContent>
      </Card>

      {/* Movimiento */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Movimiento</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${stats.motion.current ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-lg font-medium">
              {stats.motion.current ? 'Detectado' : 'Sin movimiento'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Última actividad: {new Date(stats.motion.lastActivity).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Servo 1 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Servo 1</CardTitle>
            <Zap className="h-4 w-4 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.servos.servo1}°</div>
          <div className="text-xs text-muted-foreground mt-1">
            Rango: 0° - 180°
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-500 h-2 rounded-full" 
              style={{ width: `${(stats.servos.servo1 / 180) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Servo 2 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Servo 2</CardTitle>
            <Gauge className="h-4 w-4 text-indigo-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.servos.servo2}°</div>
          <div className="text-xs text-muted-foreground mt-1">
            Rango: 0° - 180°
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full" 
              style={{ width: `${(stats.servos.servo2 / 180) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 