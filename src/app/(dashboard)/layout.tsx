
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
    <div className="min-h-screen bg-red-100"> {/* Color de fondo temporal */}
      {/* HEADER SIMPLIFICADO */}
      <header className="bg-blue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">HEADER TEST</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded font-bold"
          >
            🔴 CERRAR SESIÓN TEST
          </button>
        </div>
      </header>
      
      {/* CONTENIDO PRINCIPAL */}
      <main className="p-4">
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-xl font-bold">Contenido principal:</h2>
          {children}
        </div>
      </main>
    </div>
  );
}
