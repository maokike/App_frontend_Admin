"use client";

import { useState } from "react";
import { localUsers, locals as initialLocals } from "@/lib/data";
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


export function LocalsTable() {
    const [locals, setLocals] = useState(initialLocals);
    const [selectedLocal, setSelectedLocal] = useState<Local | null>(null);
    const { toast } = useToast();

    const handleDelete = (localId: string) => {
        setLocals(currentLocals => currentLocals.filter(l => l.id !== localId));
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
                                         <Sheet onOpenChange={(isOpen) => !isOpen && setSelectedLocal(null)}>
                                            <SheetTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => setSelectedLocal(local)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </SheetTrigger>
                                            {selectedLocal?.id === local.id && (
                                            <SheetContent>
                                                <SheetHeader>
                                                    <SheetTitle>Editar Local</SheetTitle>
                                                    <SheetDescription>
                                                        Realice cambios en el local aquí. Haga clic en guardar cuando haya terminado.
                                                    </SheetDescription>
                                                </SheetHeader>
                                                <EditLocalForm local={selectedLocal} onSave={() => setSelectedLocal(null)} />
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
                                                <AlertDialogAction onClick={() => handleDelete(local.id)}>
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
