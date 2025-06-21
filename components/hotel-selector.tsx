"use client";

import { useState, useEffect } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useHotel } from '@/contexts/HotelContext';
import { useAuth } from '@/hooks/use-auth';
import { getHotelsByOwner } from '@/lib/services/hotels-service';
import { toast } from 'sonner';

export function HotelSelector() {
  const { selectedHotel, setSelectedHotel, hotels, setHotels, isLoading, setIsLoading } = useHotel();
  const { user } = useAuth();

  useEffect(() => {
    const loadHotels = async () => {
      if (!user || !user.id) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          toast.error('No hay token de autenticación');
          return;
        }

        const result = await getHotelsByOwner(user.id, token);
        if (result.success && result.data) {
          setHotels(result.data);
          
          // Si no hay hotel seleccionado y hay hoteles disponibles, seleccionar el primero
          if (!selectedHotel && result.data.length > 0) {
            setSelectedHotel(result.data[0]);
          }
        } else {
          toast.error(result.message || 'Error al cargar los hoteles');
          setHotels([]);
        }
      } catch (error: any) {
        console.error('Error al cargar hoteles:', error);
        toast.error('Error al cargar los hoteles');
        setHotels([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHotels();
  }, [user]);

  const handleHotelSelect = (hotel: any) => {
    setSelectedHotel(hotel);
    toast.success(`Hotel cambiado a: ${hotel.name}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted animate-pulse">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Cargando hoteles...</span>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
        <Building2 className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Sin hoteles</span>
      </div>
    );
  }

  if (hotels.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/20">
        <Building2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{selectedHotel?.name || hotels[0].name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[200px]">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {selectedHotel?.name || 'Seleccionar hotel'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="ml-2">
              {hotels.length}
            </Badge>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px]">
        <DropdownMenuLabel>Mis Hoteles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hotels.map((hotel) => (
          <DropdownMenuItem
            key={hotel.id}
            onClick={() => handleHotelSelect(hotel)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{hotel.name}</span>
                {hotel.address && (
                  <span className="text-xs text-muted-foreground truncate">
                    {hotel.address}
                  </span>
                )}
              </div>
            </div>
            {selectedHotel?.id === hotel.id && (
              <Badge variant="default" className="ml-2">
                Activo
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
