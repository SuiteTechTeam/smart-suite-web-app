'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Sistema de Gestión Hotelera</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Inventario</CardTitle>
              <CardDescription>Gestiona los productos del inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Administra los productos, precios y stock disponible.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/inventory">Acceder</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Habitaciones</CardTitle>
              <CardDescription>Gestiona las habitaciones del hotel</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Administra tipos, capacidad y precios de habitaciones.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/rooms">Acceder</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>Gestiona los datos de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Administra información de contacto y estado de clientes.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/customers">Acceder</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reservas</CardTitle>
              <CardDescription>Gestiona las reservas de habitaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Administra fechas, precios y estado de las reservas.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/bookings">Acceder</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
