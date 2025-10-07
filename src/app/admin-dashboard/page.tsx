"use client";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardPage() { // ✅ Quitar la prop onLogout
    const { role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && role && role !== 'admin') {
            router.replace('/local-dashboard');
        }
    }, [role, loading, router]);

    if (loading || (role && role !== 'admin')) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando...</p>
          </div>
        </div>
      );
    }
    
    return <AdminDashboard />;
}