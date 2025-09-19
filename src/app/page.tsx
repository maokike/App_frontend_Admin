"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoginForm } from "@/components/auth/login-form";
import { DollarSign } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Este efecto se encarga de la redirección.
    // Se ejecuta cada vez que el estado de autenticación cambia.
    console.log("Auth state changed:", { loading, user, role });
    
    if (!loading) {
      if (user && role) {
        // Si no estamos cargando y tenemos usuario y rol, redirigimos.
        console.log(`Redirecting to /${role}-dashboard`);
        if (role === 'admin') {
          router.replace('/admin-dashboard');
        } else if (role === 'local') {
          router.replace('/local-dashboard');
        }
      } else {
        // Si no estamos cargando y no hay usuario/rol, nos aseguramos de estar en la página de login.
        console.log("No user or role, staying on login page.");
      }
    }
  }, [user, loading, role, router]);
  
  if (loading) {
    // Muestra el spinner de carga SOLO mientras se verifica la autenticación.
     return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
            <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2">
                    <div className="bg-primary text-primary-foreground p-3 rounded-full animate-pulse">
                      <DollarSign className="h-8 w-8" />
                    </div>
                </div>
                <p className="text-muted-foreground">Verificando credenciales...</p>
            </div>
        </main>
    );
  }

  if (!user) {
    // Si no estamos cargando y no hay usuario, muestra el formulario de login.
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
        <div className="flex flex-col items-center space-y-2 mb-8">
          <div className="bg-primary text-primary-foreground p-3 rounded-full">
            <DollarSign className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold font-headline">Local Sales Tracker</h1>
          <p className="text-muted-foreground">Sign in to access your dashboard</p>
        </div>
        <LoginForm />
        <p className="mt-4 text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </main>
    );
  }

  // Si el usuario está logueado pero aún no se ha redirigido, muestra la pantalla de carga.
  // Esto evita un parpadeo del formulario de login antes de la redirección.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
        <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
                <div className="bg-primary text-primary-foreground p-3 rounded-full animate-pulse">
                  <DollarSign className="h-8 w-8" />
                </div>
            </div>
            <p className="text-muted-foreground">Redirigiendo a tu dashboard...</p>
        </div>
    </main>
  );
}
