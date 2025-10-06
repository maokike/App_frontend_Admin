
"use client";

import { SalesForm } from "./sales-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, LogOut, Newspaper, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LocalDashboard() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const isLocalUserWithoutStore = role === 'local' && !user?.localId;

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

  return (
    <div className="grid gap-8">
      {isLocalUserWithoutStore && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Sin local asignado</AlertTitle>
            <AlertDescription>
                No tienes un local asignado. Por favor, contacta a un administrador para que te asigne a uno y puedas empezar a registrar ventas.
            </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Quick Sale</CardTitle>
                    <CardDescription>Record a new sale quickly and efficiently.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <SalesForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Acciones Rápidas</CardTitle>
            <CardDescription>Navega a otras secciones importantes de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="w-full">
                <Link href="/daily-summary">
                    <Newspaper className="mr-2 h-4 w-4" />
                    Resumen de Venta del Día
                </Link>
            </Button>
            <Button asChild className="w-full" variant="secondary">
                <Link href="/inventory">
                    <Warehouse className="mr-2 h-4 w-4" />
                    Ver Inventario
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
