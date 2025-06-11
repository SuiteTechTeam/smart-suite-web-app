"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Limpiar cookies
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Redirigir al login
    window.location.href = '/sign-in';
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <nav className="flex justify-between items-center p-4 bg-transparent text-black border-b border-gray-500">
          <div className="flex items-center space-x-4">
            <Image src="/logos/logo-smart-suite-bg-translucent.png" alt="Logo" width={50} height={50} />
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href="/dashboard/iot" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              Dashboard
            </Link>
            <Link href="/dashboard/inventory" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              Inventario
            </Link>
            <Link href="/dashboard/analytics" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              Analytics
            </Link>
            <Link href="/dashboard/rooms" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              Rooms 
            </Link>
            <Link href="/dashboard/customers" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              Customers 
            </Link>
          </div>          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setShowLogoutDialog(true)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          </div>
        </nav>
      </header>
      <main className="dashboard-content">{children}</main>
      <footer className="dashboard-footer">Dashboard Footer</footer>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <DialogTitle>Confirm Logout</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to logout? You will need to sign in again to access your dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmLogout}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}