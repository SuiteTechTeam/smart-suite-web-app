"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, AlertTriangle, Menu, LayoutDashboard, Boxes, BarChart, BedDouble, Users, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeSwitcher } from "@/components/theme-switcher";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/inventory", label: "Inventario", icon: Boxes },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart },
  { href: "/dashboard/rooms", label: "Rooms", icon: BedDouble },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/iot", label: "IoT", icon: Wifi },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (sidebarOpen) setShowSidebar(true);
    else setTimeout(() => setShowSidebar(false), 300);
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    const cookieOptions = [
      'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;',
      'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=' + window.location.hostname + ';',
      'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;',
      'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=' + window.location.hostname + ';'
    ];
    cookieOptions.forEach(cookieString => {
      document.cookie = cookieString;
    });
    window.location.replace('/sign-in');
  };
  const confirmLogout = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full bg-card text-card-foreground shadow-sm border-b border-border flex items-center h-16 px-4 md:px-8 flex-shrink-0">
          {/* Ícono hamburguesa a la izquierda */}
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => setSidebarOpen(v => !v)}>
            <Menu />
          </Button>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Image src="/logos/logo-smart-suite-bg-translucent.png" alt="Logo" width={36} height={36} />
          </div>
          <nav className="hidden md:flex flex-1 items-center justify-center gap-1 overflow-x-auto">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-md whitespace-nowrap transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 ml-2">
            <ThemeSwitcher />
            <Button 
              onClick={() => setShowLogoutDialog(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-destructive border-destructive/30 hover:text-white hover:bg-destructive hover:border-destructive"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>
        <div className="flex flex-1 min-h-0">
          {/* Sidebar overlay animado en cualquier tamaño de pantalla */}
          {showSidebar && (
            <aside className="fixed inset-0 z-50">
              <div
                className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setSidebarOpen(false)}
              />
              <div
                className={`absolute left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-border shadow-lg
                  transition-transform duration-300 will-change-transform
                  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 font-bold text-lg">Hotel Smart Control</div>
                <nav className="flex-1 flex flex-col gap-1 px-2">
                  {NAV_LINKS.map(link => (
                    <Link key={link.href} href={link.href} className="px-4 py-2 rounded-md hover:bg-sidebar-accent/20 text-sm font-medium transition-colors" onClick={() => setSidebarOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>
          )}
          {/* Contenido principal */}
          <main className="flex-1 h-full min-h-0 overflow-y-auto bg-dashboard text-dashboard-foreground p-4 md:p-8 flex flex-col">
            {children}
          </main>
        </div>
       
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
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
                className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}