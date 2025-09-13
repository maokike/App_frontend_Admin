"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardPage from "../login/page";

export default function LocalDashboardPage() {
    const { role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && role && role !== 'local') {
            router.replace('/admin-dashboard');
        }
    }, [role, loading, router]);
    
    if (loading || !role) {
      // You can return a loading spinner here
      return <div>Loading...</div>;
    }

    if (role !== 'local') {
        // Or a generic "access denied" message
        return <div>Access Denied</div>;
    }


    return <DashboardPage />;
}
