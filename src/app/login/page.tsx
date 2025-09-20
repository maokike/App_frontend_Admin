"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DollarSign } from 'lucide-react';

export default function LoginPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Wait until loading is complete
    }
    if (role === 'admin') {
      router.replace('/admin-dashboard');
    } else if (role === 'local') {
      router.replace('/local-dashboard');
    } else {
       // If no role is found after loading, it means the user is not authenticated or there's an issue.
       // We should redirect them to the main page to log in.
       router.replace('/');
    }
  }, [role, loading, router]);


  // Display a loading indicator while determining the redirection path.
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
