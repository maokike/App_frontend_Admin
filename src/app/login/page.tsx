"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { DollarSign } from 'lucide-react';

export default function RedirectPage() {
  const { role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // No hacer nada mientras la autenticación está en curso.
    if (loading) {
      return;
    }

    // Una vez que la carga ha terminado, decidimos a dónde redirigir.
    if (role === 'admin') {
      router.replace('/admin-dashboard');
    } else if (role === 'local') {
      router.replace('/local-dashboard');
    } else {
      // Si no hay rol (y no estamos cargando), el usuario no está autenticado o hay un problema.
      // Lo enviamos de vuelta a la página de inicio para que inicie sesión.
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
