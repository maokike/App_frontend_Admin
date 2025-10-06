
"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DollarSign } from "lucide-react";

export default function HomePage() {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Espera a que termine la carga

    if (user) {
      if (role === 'admin') {
        router.replace('/admin-dashboard');
      } else {
        router.replace('/local-dashboard');
      }
    } else {
        router.replace('/login');
    }
  }, [user, loading, role, router]);

  // Muestra un estado de carga mientras se verifica la autenticación y se redirige.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <div className="bg-primary text-primary-foreground p-3 rounded-full animate-pulse">
            <DollarSign className="h-8 w-8" />
          </div>
        </div>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </main>
  );
}
