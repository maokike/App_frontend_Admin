
"use client";

import { useState, useEffect } from 'react';
import type { UserRole } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator'; // ← RUTA CORREGIDA
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { doc, onSnapshot } from 'firebase/firestore';

// ACTUALIZA LA INTERFACE CON LAS PROPS CORRECTAS
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
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
