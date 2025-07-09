"use client"
import { AlertTriangle, Thermometer, Droplets, Eye, Flame } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface SensorAlert {
  id: string
  type: "temperature" | "humidity" | "motion" | "smoke"
  severity: "warning" | "critical"
  message: string
  value: number
  timestamp: string
}

interface IoTAlertsProps {
  temperature: number
  humidity: number
  motion: boolean
  smoke: number
  timestamp: string
}

export function IoTAlerts({ temperature, humidity, motion, smoke, timestamp }: IoTAlertsProps) {
  const alerts: SensorAlert[] = []

  // Verificar temperatura (rango normal: 18-26°C)
  if (temperature < 18) {
    alerts.push({
      id: "temp-low",
      type: "temperature",
      severity: "warning",
      message: "Temperatura baja detectada",
      value: temperature,
      timestamp
    })
  } else if (temperature > 26) {
    alerts.push({
      id: "temp-high",
      type: "temperature",
      severity: "critical",
      message: "Temperatura alta detectada",
      value: temperature,
      timestamp
    })
  }

  // Verificar humedad (rango normal: 30-70%)
  if (humidity < 30) {
    alerts.push({
      id: "hum-low",
      type: "humidity",
      severity: "warning",
      message: "Humedad baja detectada",
      value: humidity,
      timestamp
    })
  } else if (humidity > 70) {
    alerts.push({
      id: "hum-high",
      type: "humidity",
      severity: "warning",
      message: "Humedad alta detectada",
      value: humidity,
      timestamp
    })
  }

  // Verificar humo (umbral crítico: > 300)
  if (smoke > 300) {
    alerts.push({
      id: "smoke-high",
      type: "smoke",
      severity: "critical",
      message: "Niveles de humo críticos detectados",
      value: smoke,
      timestamp
    })
  } else if (smoke > 200) {
    alerts.push({
      id: "smoke-warning",
      type: "smoke",
      severity: "warning",
      message: "Niveles de humo elevados",
      value: smoke,
      timestamp
    })
  }

  // Verificar movimiento (solo alerta si no hay movimiento por mucho tiempo)
  if (!motion) {
    alerts.push({
      id: "no-motion",
      type: "motion",
      severity: "warning",
      message: "No se detecta movimiento",
      value: 0,
      timestamp
    })
  }

  if (alerts.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <AlertTriangle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">Estado Normal</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          Todos los sensores están funcionando dentro de los rangos normales.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3 w-full">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          className={
            alert.severity === "critical"
              ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
          }
        >
          <div className="flex items-center justify-between w-full flex-row">
            <div className="flex items-center space-x-2 w-auto">
              {alert.type === "temperature" && <Thermometer className="h-4 w-4" />}
              {alert.type === "humidity" && <Droplets className="h-4 w-4" />}
              {alert.type === "motion" && <Eye className="h-4 w-4" />}
              {alert.type === "smoke" && <Flame className="h-4 w-4" />}
              <AlertTitle
                className={
                  alert.severity === "critical"
                    ? "text-red-800 dark:text-red-200"
                    : "text-yellow-800 dark:text-yellow-200"
                }
              >
                {alert.message}
              </AlertTitle>
              <AlertDescription
                className={
                alert.severity === "critical"
                    ? "text-red-700 dark:text-red-300"
                    : "text-yellow-700 dark:text-yellow-300"
                }
            >
                Valor actual: {alert.value}
                {alert.type === "temperature" && "°C"}
                {alert.type === "humidity" && "%"}
                {alert.type === "smoke" && " ppm"}
                {alert.type === "motion" && " (sin movimiento)"}
            </AlertDescription>
            </div>
            <Badge
              variant={alert.severity === "critical" ? "destructive" : "secondary"}
              className="ml-2"
            >
              {alert.severity === "critical" ? "Crítico" : "Advertencia"}
            </Badge>
          </div>
        </Alert>
      ))}
    </div>
  )
} 