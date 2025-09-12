"use client";

import { useState, useEffect } from "react";
import type { Local, User } from "@/lib/types";
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
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "../ui/skeleton";

interface LocalsTableProps {
    locals: Local[];
    loading: boolean;
    onLocalUpdated: (local: Local) => void;
    onLocalDeleted: (localId: string) => void;
}

export function LocalsTable({ locals, loading, onLocalUpdated, onLocalDeleted }: LocalsTableProps) {
    const [selectedLocal, setSelectedLocal] = useState<Local | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const q = query(collection(db, "users"));
            const querySnapshot = await getDocs(q);
            const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(userList);
        }
        fetchUsers();
    }, []);

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
    };

    const getUserName = (userId: string) => {
        return users.find(u => u.id === userId)?.name || "N/A";
    }

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
                        {loading ? (
                             Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : locals.map(local => (
                            <TableRow key={local.id}>
                                <TableCell className="font-medium">{local.name}</TableCell>
                                <TableCell>{local.address}</TableCell>
                                <TableCell>{getUserName(local.userId)}</TableCell>
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
                        ))}
                    </TableBody>
                </Table>
            </div>
            {!loading && locals.length === 0 && (
                <p className="text-center text-muted-foreground mt-4">
                    No hay locales registrados. Añada uno para empezar.
                </p>
            )}
        </>
    );
}
