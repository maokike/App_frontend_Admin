"use client";

import { useState } from "react";
import { localUsers } from "@/lib/data";
import type { Local } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EditLocalForm } from "./edit-local-form";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";

interface LocalsTableProps {
    locals: Local[];
    onLocalUpdated: (local: Local) => void;
    onLocalDeleted: (localId: string) => void;
}

export function LocalsTable({ locals, onLocalUpdated, onLocalDeleted }: LocalsTableProps) {
    const [selectedLocal, setSelectedLocal] = useState<Local | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { toast } = useToast();

    const handleSave = (updatedLocal: Local) => {
        onLocalUpdated(updatedLocal);
        setIsSheetOpen(false);
        setSelectedLocal(null);
    };

    const handleDeleteInForm = (localId: string) => {
        onLocalDeleted(localId);
        setIsSheetOpen(false);
        setSelectedLocal(null);
    }
    
    const handleDeleteInDialog = (localId: string) => {
        onLocalDeleted(localId);
        toast({
            title: "Local Eliminado",
            description: "El local ha sido eliminado correctamente.",
            variant: "destructive",
        })
    };

    return (
        <>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Usuario Asignado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {locals.map(local => {
                            const user = localUsers.find(u => u.id === local.userId);
                            return (
                                <TableRow key={local.id}>
                                    <TableCell className="font-medium">{local.name}</TableCell>
                                    <TableCell>{local.address}</TableCell>
                                    <TableCell>{user?.name || "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                         <Sheet open={isSheetOpen && selectedLocal?.id === local.id} onOpenChange={(isOpen) => {
                                             setIsSheetOpen(isOpen);
                                             if (!isOpen) setSelectedLocal(null);
                                         }}>
                                            <SheetTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => {
                                                    setSelectedLocal(local);
                                                    setIsSheetOpen(true);
                                                }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </SheetTrigger>
                                            {selectedLocal && (
                                            <SheetContent>
                                                <SheetHeader>
                                                    <SheetTitle>Editar Local</SheetTitle>
                                                    <SheetDescription>
                                                        Realice cambios en el local aquí. Haga clic en guardar cuando haya terminado.
                                                    </SheetDescription>
                                                </SheetHeader>
                                                <EditLocalForm 
                                                    local={selectedLocal} 
                                                    onSave={handleSave} 
                                                    onDelete={handleDeleteInForm}
                                                />
                                            </SheetContent>
                                            )}
                                        </Sheet>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el local.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteInDialog(local.id)}>
                                                    Eliminar
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
            {locals.length === 0 && (
                <p className="text-center text-muted-foreground mt-4">
                    No hay locales registrados. Añada uno para empezar.
                </p>
            )}
        </>
    );
}
