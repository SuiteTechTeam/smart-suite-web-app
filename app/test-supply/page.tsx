"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupply } from "@/lib/services/supply-service";
import { toast } from "sonner";

export default function TestSupplyPage() {
  const [formData, setFormData] = useState({
    name: "Test Item",
    price: 10.99,
    stock: 5,
    providerId: 1,
    hotelId: 1,
    state: "active"
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("No hay token de autenticación");
        return;
      }

      console.log('Test: Sending data to createSupply:', formData);
      
      const result = await createSupply(formData, token);
      
      if (result.success) {
        toast.success("Supply creado exitosamente!");
        console.log('Test: Success result:', result);
      } else {
        toast.error(`Error: ${result.message}`);
        console.error('Test: Error result:', result);
      }
    } catch (error: any) {
      toast.error(`Exception: ${error.message}`);
      console.error('Test: Exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Create Supply</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="providerId">Provider ID</Label>
              <Input
                id="providerId"
                type="number"
                value={formData.providerId}
                onChange={(e) => setFormData({...formData, providerId: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="hotelId">Hotel ID</Label>
              <Input
                id="hotelId"
                type="number"
                value={formData.hotelId}
                onChange={(e) => setFormData({...formData, hotelId: parseInt(e.target.value)})}
              />
            </div>
            
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Supply"}
            </Button>
          </form>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
