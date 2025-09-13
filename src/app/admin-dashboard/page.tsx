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
            router.push('/local-dashboard');
        }
    }, [role, loading, router]);

    return <DashboardPage />;
}
