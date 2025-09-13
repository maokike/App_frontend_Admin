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
            router.push('/admin-dashboard');
        }
    }, [role, loading, router]);

    return <DashboardPage />;
}
