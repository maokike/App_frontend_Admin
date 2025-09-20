"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LocalDashboard } from "@/components/dashboard/local-dashboard";

export default function LocalDashboardPage() {
    const { role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // While loading, do nothing.
        if (loading) return;

        // If loading is finished and the role is admin, redirect.
        if (role === 'admin') {
            router.replace('/admin-dashboard');
        }
    }, [role, loading, router]);
    
    if (loading || (role && role === 'admin')) {
      // Show a loading indicator or placeholder while checking auth/role.
      return <div>Loading or redirecting...</div>;
    }

    // If role is 'local' or null (for the brief moment before role is confirmed), show the local dashboard.
    // The main layout already protects against unauthenticated users.
    return <LocalDashboard />;
}
