"use client";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardPage from "../login/page";

export default function AdminDashboardPage() {
    const { role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && role && role !== 'admin') {
            router.replace('/local-dashboard');
        }
    }, [role, loading, router]);

    if (loading || !role) {
      // You can return a loading spinner here
      return <div>Loading...</div>;
    }
    
    if (role !== 'admin') {
      // Or a generic "access denied" message
      return <div>Access Denied</div>;
    }

    return <DashboardPage />;
}
