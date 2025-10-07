"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, Children, cloneElement, isValidElement } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DollarSign,
  Home,
  Newspaper,
  Warehouse,
  PlusCircle,
  LogOut,
  Users,
  Package,
  Store
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DashboardHeader } from "@/components/dashboard/header";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [currentViewRole, setCurrentViewRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    if (role) {
      setCurrentViewRole(role);
    }
  }, [user, loading, router, role]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Sesión Cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión.",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentViewRole(newRole);
    if (newRole === 'admin') {
      router.push('/admin-dashboard');
    } else {
      router.push('/local-dashboard');
    }
  };

  if (loading || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground p-3 rounded-full animate-pulse">
              <DollarSign className="h-8 w-8" />
            </div>
          </div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </main>
    );
  }

  const isAdmin = role === 'admin';
  const userLocal = user.locales_asignados && user.locales_asignados.length > 0 ? user.locales_asignados[0] : null;
  const localName = currentViewRole === 'local' ? (userLocal?.name || 'Mi Local') : undefined;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-full">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold">SalesTrack</span>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                href={currentViewRole === "admin" ? "/admin-dashboard" : "/local-dashboard"}
                isActive
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {currentViewRole === 'local' && (
              <SidebarMenuItem>
                <SidebarMenuButton href="/local-dashboard">
                  <PlusCircle className="h-4 w-4" />
                  <span>Nueva Venta</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            <SidebarMenuItem>
              <SidebarMenuButton href="/daily-summary">
                <Newspaper className="h-4 w-4" />
                <span>Resumen Diario</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton href="/inventory">
                <Warehouse className="h-4 w-4" />
                <span>Inventario</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {isAdmin && currentViewRole === 'admin' && (
              <SidebarGroup>
                <SidebarGroupLabel>Administración</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton href="/new-local">
                        <Store className="h-4 w-4" />
                        <span>Gestión de Locales</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton href="/new-product">
                        <Package className="h-4 w-4" />
                        <span>Gestión de Productos</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton href="/sales-history">
                        <Users className="h-4 w-4" />
                        <span>Historial de Ventas</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter>
          <Separator className="my-2" />
          
          {/* Información del usuario */}
          <div className="flex items-center gap-3 p-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold truncate">{user?.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </div>

          {/* Botón de Cerrar Sesión */}
          <div className="p-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleLogout}
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <header className="flex items-center gap-4 border-b bg-background/90 px-6 py-3 backdrop-blur-sm min-h-[64px]">
          <SidebarTrigger className="md:hidden" />
          <DashboardHeader 
            currentRole={currentViewRole!} 
            onRoleChange={handleRoleChange} 
            localName={localName} 
            isAdmin={isAdmin}
            onLogout={handleLogout}
          />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}