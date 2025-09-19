"use client";

import { useState, useEffect } from 'react';
import type { UserRole } from '@/lib/types';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { DollarSign, LayoutDashboard, UserPlus, PackagePlus, ClipboardList, Warehouse, Store, LogOut } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { LocalDashboard } from '@/components/dashboard/local-dashboard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import NewCustomerPage from '../new-customer/page';
import NewProductPage from '../new-product/page';
import DailySummaryPage from '../daily-summary/page';
import InventoryPage from '../inventory/page';
import NewLocalPage from '../new-local/page';
import { useAuth } from '@/hooks/use-auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading, role: authRole } = useAuth();
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [localName, setLocalName] = useState<string | undefined>(undefined);

  const effectiveRole = authRole === 'admin' ? (simulatedRole || authRole) : authRole;

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (!loading && authRole) {
      const targetDashboard = authRole === 'admin' ? '/admin-dashboard' : '/local-dashboard';
      if (pathname !== targetDashboard && !pathname.startsWith('/new-') && pathname !== '/inventory' && pathname !== '/daily-summary') {
        router.replace(targetDashboard);
      }
    }
  }, [authRole, loading, router, pathname]);

  useEffect(() => {
    async function fetchLocalName() {
      if (user && authRole === 'local') {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.localId) {
            const localDocRef = doc(db, 'locals', userData.localId);
            const localDoc = await getDoc(localDocRef);
            if (localDoc.exists()) {
              setLocalName(localDoc.data().name);
            }
          }
        }
      } else if (authRole === 'admin' && simulatedRole === 'local') {
        setLocalName("Simulated Local");
      } else {
        setLocalName(undefined);
      }
    }
    fetchLocalName();
  }, [user, authRole, simulatedRole]);

  if (loading || !user || !authRole) {
    return (
      <div className="flex items-start min-h-screen bg-background">
        <Skeleton className="hidden md:block h-screen w-[256px]" />
        <div className="flex-1 p-8">
          <Skeleton className="h-16 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const renderContent = () => {
    if (pathname.includes('/admin-dashboard')) return <AdminDashboard />;
    if (pathname.includes('/local-dashboard')) return <LocalDashboard />;
    
    switch (pathname) {
      case '/new-customer':
        return <NewCustomerPage />;
      case '/new-product':
        return <NewProductPage role={effectiveRole as UserRole} />;
      case '/daily-summary':
        return <DailySummaryPage />;
      case '/inventory':
        return <InventoryPage />;
      case '/new-local':
        return <NewLocalPage />;
      default:
        // Fallback to the correct dashboard based on role
        return authRole === 'admin' ? <AdminDashboard /> : <LocalDashboard />;
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold font-headline text-primary group-data-[collapsible=icon]:hidden">
              Sales Tracker
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton as={Link} href={authRole === 'admin' ? "/admin-dashboard" : "/local-dashboard"} tooltip="Dashboard" isActive={pathname.includes('dashboard')}>
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton as={Link} href="/new-customer" tooltip="Nuevo Cliente" isActive={pathname === '/new-customer'}>
                <UserPlus />
                <span>Nuevo Cliente</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton as={Link} href="/new-product" tooltip="Gestion de producto" isActive={pathname === '/new-product'}>
                <PackagePlus />
                <span>Gestion de producto</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton as={Link} href="/daily-summary" tooltip="Resumen Diario" isActive={pathname === '/daily-summary'}>
                <ClipboardList />
                <span>Resumen Diario</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton as={Link} href="/inventory" tooltip="Inventario" isActive={pathname === '/inventory'}>
                <Warehouse />
                <span>Inventario</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {authRole === 'admin' && (
              <SidebarMenuItem>
                <SidebarMenuButton as={Link} href="/new-local" tooltip="Gestion Locales" isActive={pathname === '/new-local'}>
                  <Store />
                  <span>Gestion Locales</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:items-center">
          <div className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-sidebar-accent w-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${user.uid}`} alt="User" data-ai-hint="user avatar" />
              <AvatarFallback>{user.name?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-sm">{user.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{effectiveRole}</span>
            </div>
            <button onClick={handleLogout} className="ml-auto group-data-[collapsible=icon]:mx-auto">
              <LogOut className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <DashboardHeader currentRole={effectiveRole as UserRole} onRoleChange={setSimulatedRole} localName={localName} isAdmin={authRole === 'admin'} />
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </SidebarProvider>
  );
}
