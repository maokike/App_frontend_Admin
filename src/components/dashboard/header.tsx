"use client";

import { useState, useEffect } from 'react';
import type { UserRole } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { doc, onSnapshot } from 'firebase/firestore';

export function DashboardHeader() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [localName, setLocalName] = useState<string | undefined>(undefined);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(role);

  useEffect(() => {
    setSimulatedRole(role);
  }, [role]);
  
  useEffect(() => {
    if (role === 'local' && user?.localId) {
      const localRef = doc(db, "locals", user.localId);
      const unsubscribe = onSnapshot(localRef, (doc) => {
        if (doc.exists()) {
          setLocalName(doc.data().name);
        } else {
          setLocalName(undefined);
        }
      });
      return () => unsubscribe();
    } else if (role === 'admin') {
      setLocalName(undefined);
    }
  }, [role, user]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        toast({
            title: "Sesión Cerrada",
            description: "Has cerrado sesión correctamente.",
        });
        router.push('/');
    } catch (error) {
        console.error("Error signing out: ", error);
        toast({
            title: "Error",
            description: "No se pudo cerrar la sesión.",
            variant: "destructive",
        });
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (role === 'admin') {
      setSimulatedRole(newRole);
      if (newRole === 'admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/local-dashboard');
      }
    }
  };

  const isAdmin = role === 'admin';
  const currentViewRole = isAdmin ? simulatedRole : role;

  return (
    <div className="flex w-full items-center gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold font-headline">Dashboard</h1>
        {currentViewRole === 'local' && localName && (
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
            <Select value={currentViewRole || 'admin'} onValueChange={(value) => handleRoleChange(value as UserRole)}>
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
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
