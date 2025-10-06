
"use client";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardPage({ onLogout }: { onLogout?: () => void }) {
    const { role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && role && role !== 'admin') {
            router.replace('/local-dashboard');
        }
    }, [role, loading, router]);

    if (loading || (role && role !== 'admin')) {
      // You can return a loading spinner or a placeholder
      return <div>Loading or Access Denied...</div>;
    }
    
    return <AdminDashboard onLogout={onLogout} />;
}
