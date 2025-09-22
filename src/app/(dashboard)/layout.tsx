
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
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [localName, setLocalName] = useState<string | undefined>(undefined);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);

  console.log("DashboardLayout rendering", { user, role, loading });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading) {
      setSimulatedRole(role);
    }
  }, [role, loading]);
  
  useEffect(() => {
    if (user?.localId) {
      const localRef = doc(db, "locals", user.localId);
      const unsubscribe = onSnapshot(localRef, (doc) => {
        if (doc.exists()) {
          setLocalName(doc.data().name);
        } else {
          setLocalName(undefined);
        }
      });
      return () => unsubscribe();
    } else {
      setLocalName(undefined);
    }
  }, [user]);

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
  
  const handleRoleChange = (newRole: UserRole) => {
    if (role === 'admin') {
      setSimulatedRole(newRole);
      if (newRole === 'admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/local-dashboard');
      }
    }
  };

  const isAdmin = role === 'admin';
  const currentViewRole = isAdmin ? simulatedRole : role;

  console.log("🔴 DashboardLayout state:", { 
    user: !!user, 
    role, 
    loading, 
    isAdmin, 
    currentViewRole,
    localName 
  });

  if (loading || !user) {
    console.log("🔴 Showing loading state");
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

  console.log("🟢 Rendering main layout");

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <DollarSign />
            </div>
            <span className="text-lg font-semibold font-headline">
              Sales Tracker
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/login" isActive={true}>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAdmin ? (
              <>
                <SidebarGroup>
                  <SidebarGroupLabel>Administración</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton href="/new-local">
                          <Store />
                          Gestionar Locales
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton href="/inventory">
                          <Warehouse />
                          Inventario General
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarGroupLabel>Ventas (Vista Local)</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton href="/local-dashboard">
                          <ShoppingCart />
                          Nueva Venta
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton href="/daily-summary">
                          <Newspaper />
                          Resumen Diario
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            ) : (
              <SidebarGroup>
                <SidebarGroupLabel>Ventas</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton href="/local-dashboard">
                        <ShoppingCart />
                        Nueva Venta
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton href="/daily-summary">
                        <Newspaper />
                        Resumen Diario
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
            <SidebarGroup>
              <SidebarGroupLabel>Gestión</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/new-product">
                      <Package />
                      Productos
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/new-customer">
                      <Users />
                      Clientes
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2" />
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-md hover:bg-sidebar-accent">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          
          {/* BOTÓN TEMPORAL EN EL FOOTER */}
          <div className="p-2">
            <button 
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión (Footer)
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-4 border-b bg-background/90 px-6 py-3 backdrop-blur-sm min-h-[64px]">
          <SidebarTrigger className="md:hidden" />
          
          {/* CONTENIDO TEMPORAL - REEMPLAZA TODO EL DashboardHeader */}
          <div className="flex w-full items-center justify-between bg-yellow-100 p-2 rounded"> {/* Color temporal para verlo mejor */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-headline text-red-600">DASHBOARD TEST</h1>
              {currentViewRole === 'local' && localName && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <span className="text-xl font-semibold text-muted-foreground">{localName}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {isAdmin && (
                <div className="flex items-center gap-4 bg-blue-100 p-2 rounded">
                  <p className="text-sm text-muted-foreground hidden sm:block">Simular Rol:</p>
                  <select 
                    value={currentViewRole || ''} 
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="border p-1 rounded"
                  >
                    <option value="local">Local</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
              
              <button 
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* <DashboardHeader /> */}
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
