"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { LocalDashboard } from '@/components/dashboard/local-dashboard';

export default function LoginPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Espera a que termine la carga
    }
    if (role === 'admin') {
      router.replace('/admin-dashboard');
    } else if (role === 'local') {
      router.replace('/local-dashboard');
    } else {
      // Si no hay rol (y no se está cargando), el usuario no está autenticado o hubo un problema.
      // Se le envía de vuelta a la página principal para que inicie sesión.
      router.replace('/');
    }
  }, [role, loading, router]);


  // Muestra un indicador de carga mientras se determina la redirección.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <div className="bg-primary text-primary-foreground p-3 rounded-full animate-pulse">
            <DollarSign className="h-8 w-8" />
          </div>
        </div>
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </main>
  );
}
