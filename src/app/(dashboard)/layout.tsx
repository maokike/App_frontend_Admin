
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  LogOut,
  Newspaper,
  Package,
  ShoppingCart,
  Store,
  Users,
  Warehouse,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DashboardHeader } from "@/components/dashboard/header";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Sesión Cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión.",
        variant: "destructive",
      });
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


  console.log("🟢 LAYOUT - User:", user);
  console.log("🟢 LAYOUT - Role:", role);
  console.log("🟢 LAYOUT - isAdmin:", isAdmin);


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-full">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold">SalesTrack</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href={isAdmin ? "/admin-dashboard" : "/local-dashboard"} isActive={router.pathname === (isAdmin ? "/admin-dashboard" : "/local-dashboard")}>
                <Home />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/daily-summary" isActive={router.pathname === "/daily-summary"}>
                <Newspaper />
                <span>Resumen Diario</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/inventory" isActive={router.pathname === "/inventory"}>
                <Warehouse />
                <span>Inventario</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAdmin && (
              <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton href="/new-product" isActive={router.pathname === "/new-product"}>
                        <Package />
                        <span>Productos</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton href="/new-local" isActive={router.pathname === "/new-local"}>
                        <Store />
                        <span>Locales</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton href="/new-customer" isActive={router.pathname === "/new-customer"}>
                        <Users />
                        <span>Clientes</span>
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
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-4 border-b bg-background/90 px-6 py-3 backdrop-blur-sm min-h-[64px]">
          <SidebarTrigger className="md:hidden" />
          <DashboardHeader
            currentRole={role || 'local'}
            onRoleChange={(newRole) => {
              if (role === 'admin') {
                if (newRole === 'admin') {
                  router.push('/admin-dashboard');
                } else {
                  router.push('/local-dashboard');
                }
              }
            }}
            localName={userLocal?.name}
            isAdmin={isAdmin}
            onLogout={handleLogout}
          />
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
