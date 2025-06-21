"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hotel } from '@/lib/services/hotels-service';

interface HotelContextType {
  selectedHotel: Hotel | null;
  setSelectedHotel: (hotel: Hotel | null) => void;
  hotels: Hotel[];
  setHotels: (hotels: Hotel[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

interface HotelProviderProps {
  children: ReactNode;
}

export function HotelProvider({ children }: HotelProviderProps) {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar hotel seleccionado desde localStorage al inicializar
  useEffect(() => {
    const savedHotelId = localStorage.getItem('selected_hotel_id');
    if (savedHotelId && hotels.length > 0) {
      const hotel = hotels.find(h => h.id.toString() === savedHotelId);
      if (hotel) {
        setSelectedHotel(hotel);
      } else if (hotels.length > 0) {
        // Si no encuentra el hotel guardado, seleccionar el primero
        setSelectedHotel(hotels[0]);
        localStorage.setItem('selected_hotel_id', hotels[0].id.toString());
      }
    } else if (hotels.length > 0 && !selectedHotel) {
      // Si no hay hotel guardado, seleccionar el primero
      setSelectedHotel(hotels[0]);
      localStorage.setItem('selected_hotel_id', hotels[0].id.toString());
    }
  }, [hotels]);

  // Guardar hotel seleccionado en localStorage cuando cambie
  const handleSetSelectedHotel = (hotel: Hotel | null) => {
    setSelectedHotel(hotel);
    if (hotel) {
      localStorage.setItem('selected_hotel_id', hotel.id.toString());
    } else {
      localStorage.removeItem('selected_hotel_id');
    }
  };

  const value: HotelContextType = {
    selectedHotel,
    setSelectedHotel: handleSetSelectedHotel,
    hotels,
    setHotels,
    isLoading,
    setIsLoading,
  };

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}
