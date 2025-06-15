"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, BedDouble, Users, AlertTriangle, PlusCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Lun", ocupacion: 32 },
  { name: "Mar", ocupacion: 40 },
  { name: "Mié", ocupacion: 38 },
  { name: "Jue", ocupacion: 44 },
  { name: "Vie", ocupacion: 47 },
  { name: "Sáb", ocupacion: 45 },
  { name: "Dom", ocupacion: 41 },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Bienvenido/a, Administrador</h1>
          <p className="text-muted-foreground">Panel general de gestión y monitoreo del hotel</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2"><PlusCircle className="h-4 w-4" /> Nueva reserva</Button>
          <Button variant="outline" className="gap-2"><Users className="h-4 w-4" /> Añadir cliente</Button>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card text-card-foreground border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Habitaciones</CardTitle>
            <BedDouble className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Totales</p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Reservas</CardTitle>
            <BarChart3 className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Activas hoy</p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Ingresos</CardTitle>
            <span className="text-xl font-bold text-green-600">$2,350</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$12,800</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Alertas</CardTitle>
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de ocupación semanal */}
      <Card className="bg-card text-card-foreground border border-border">
        <CardHeader>
          <CardTitle>Ocupación del hotel</CardTitle>
          <CardDescription>Histórico de ocupación semanal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="fill-muted-foreground text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="fill-muted-foreground text-xs" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    color: "#0f172a"
                  }}
                  labelStyle={{ color: "#64748b" }}
                  itemStyle={{ color: "#38bdf8" }}
                />
                <Bar dataKey="ocupacion" fill="#38bdf8" fillOpacity={0.85} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
