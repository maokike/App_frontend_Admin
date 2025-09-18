"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoginForm } from "@/components/auth/login-form";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';


export default function LoginPage() {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished, and we have a user and a role, redirect.
    if (!loading && user && role) {
      if (role === 'admin') {
        router.replace('/admin-dashboard');
      } else {
        router.replace('/local-dashboard');
      }
    }
  }, [user, loading, role, router]);
  
  // While loading, or if user is logged in but we are still waiting for the role to redirect, show a loading screen.
  if (loading || user) {
     return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
            <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <p className="text-muted-foreground">Verificando credenciales...</p>
            </div>
        </main>
    );
  }

  // If not loading and no user, show the login form.
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
