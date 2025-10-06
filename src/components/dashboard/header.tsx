
"use client";

import type { UserRole } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  localName?: string;
  isAdmin: boolean;
  onLogout: () => void; 
}

export function DashboardHeader({ 
  currentRole, 
  onRoleChange, 
  localName, 
  isAdmin, 
  onLogout 
}: DashboardHeaderProps) { 
  
  console.log("🔴 HEADER - Props recibidas:", { 
    currentRole, 
    localName, 
    isAdmin 
  });

  return (
    <div className="flex w-full items-center gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold font-headline">Dashboard</h1>
        {currentRole === 'local' && localName && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-xl font-semibold text-muted-foreground">{localName}</span>
          </>
        )}
      </div>
      <div className="ml-auto flex items-center gap-4">
        {isAdmin && (
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden sm:block">Simular Rol:</p>
            <Select value={currentRole} onValueChange={(value) => onRoleChange(value as UserRole)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
         <Button variant="outline" onClick={onLogout} className="hidden sm:inline-flex">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
      </div>
    </div>
  );
}
