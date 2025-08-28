"use client";

import { useState } from 'react';
import type { UserRole } from '@/lib/types';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import { DollarSign, LayoutDashboard } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { LocalDashboard } from '@/components/dashboard/local-dashboard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>('local');

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
              <SidebarMenuButton tooltip="Dashboard" isActive>
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:items-center">
            <div className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-sidebar-accent">
                <Avatar className="h-10 w-10">
                    <AvatarImage src="https://picsum.photos/100" alt="User" data-ai-hint="user avatar" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold text-sm">Jane Doe</span>
                    <span className="text-xs text-muted-foreground capitalize">{role}</span>
                </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <DashboardHeader currentRole={role} onRoleChange={setRole} />
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          {role === 'admin' ? <AdminDashboard /> : <LocalDashboard />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
