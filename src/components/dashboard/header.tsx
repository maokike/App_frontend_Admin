"use client";

import type { UserRole } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '../ui/separator';

interface DashboardHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  localName?: string;
}

export function DashboardHeader({ currentRole, onRoleChange, localName }: DashboardHeaderProps) {
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
        <p className="text-sm text-muted-foreground hidden sm:block">Simulate Role:</p>
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
    </div>
  );
}
