"use client";

import { useState, useEffect } from "react";
import { NewLocalForm } from "@/components/local/new-local-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalsTable } from "@/components/local/locals-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Local, LocalAssignment } from "@/lib/types";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, runTransaction, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


export default function NewLocalPage() {
    const [locals, setLocals] = useState<Local[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const localsCollection = collection(db, "locals");
        const unsubscribe = onSnapshot(localsCollection, (snapshot) => {
            const localsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Local));
            setLocals(localsList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLocalAdded = async (newLocalData: Omit<Local, 'id'>) => {
        try {
            await runTransaction(db, async (transaction) => {
                const newLocalRef = doc(collection(db, "locals"));
                transaction.set(newLocalRef, { ...newLocalData, id: newLocalRef.id });

                const userRef = doc(db, "Usuarios", newLocalData.userId);
                const localAssignment: LocalAssignment = {
                    localId: newLocalRef.id,
                    name: newLocalData.name
                };
                transaction.update(userRef, { 
                    locales_asignados: arrayUnion(localAssignment)
                });
            });
            
            toast({
                title: "Local Creado",
                description: `El local ${newLocalData.name} ha sido añadido y asignado.`,
            });
            router.push('/admin-dashboard');
        } catch (error) {
            console.error("Error creating local: ", error);
            toast({ title: "Error", description: "No se pudo crear el local", variant: "destructive" });
        }
    };

    const handleLocalUpdated = async (updatedLocal: Local) => {
       try {
            await runTransaction(db, async (transaction) => {
                const localRef = doc(db, "locals", updatedLocal.id);
                const originalLocalDoc = await transaction.get(localRef);
                if (!originalLocalDoc.exists()) {
                    throw new Error("Local no encontrado");
                }
                const originalLocalData = originalLocalDoc.data() as Local;

                // If user assignment has changed
                if (originalLocalData.userId !== updatedLocal.userId) {
                    // Remove assignment from old user
                    if (originalLocalData.userId) {
                        const oldUserRef = doc(db, "Usuarios", originalLocalData.userId);
                        const oldAssignment: LocalAssignment = { localId: originalLocalData.id, name: originalLocalData.name };
                        transaction.update(oldUserRef, { locales_asignados: arrayRemove(oldAssignment) });
                    }
                    
                    // Add assignment to new user
                    const newUserRef = doc(db, "Usuarios", updatedLocal.userId);
                    const newAssignment: LocalAssignment = { localId: updatedLocal.id, name: updatedLocal.name };
                    transaction.update(newUserRef, { locales_asignados: arrayUnion(newAssignment) });
                }
                 // Handle name change affecting assignments
                if (originalLocalData.name !== updatedLocal.name) {
                    // If the user hasn't changed, update the existing assignment name
                    if (originalLocalData.userId === updatedLocal.userId && originalLocalData.userId) {
                        const userRef = doc(db, "Usuarios", originalLocalData.userId);
                        const oldAssignment: LocalAssignment = { localId: originalLocalData.id, name: originalLocalData.name };
                        const newAssignment: LocalAssignment = { localId: updatedLocal.id, name: updatedLocal.name };
                        transaction.update(userRef, { 
                            locales_asignados: arrayRemove(oldAssignment)
                        });
                         transaction.update(userRef, { 
                            locales_asignados: arrayUnion(newAssignment)
                        });
                    }
                }

                transaction.update(localRef, { ...updatedLocal });
            });

            toast({
                title: "Local Actualizado",
                description: `El local ${updatedLocal.name} ha sido actualizado.`,
            });
            router.push('/admin-dashboard');
       } catch (error) {
            console.error("Error updating local: ", error);
            toast({ title: "Error", description: "No se pudo actualizar el local", variant: "destructive" });
       }
    };

    const handleLocalDeleted = async (localId: string) => {
        try {
             await runTransaction(db, async (transaction) => {
                const localRef = doc(db, "locals", localId);
                const localDoc = await transaction.get(localRef);
                if (!localDoc.exists()) return;
                const localData = localDoc.data() as Local;

                transaction.delete(localRef);

                if (localData.userId) {
                    const userRef = doc(db, "Usuarios", localData.userId);
                    const assignmentToRemove: LocalAssignment = { localId: localId, name: localData.name };
                    transaction.update(userRef, { locales_asignados: arrayRemove(assignmentToRemove) });
                }
             });
            
            toast({
                title: "Local Eliminado",
                description: "El local ha sido eliminado correctamente.",
                variant: "destructive",
            });
            router.push('/admin-dashboard');
        } catch (error) {
            console.error("Error deleting local: ", error);
            toast({ title: "Error", description: "No se pudo eliminar el local", variant: "destructive" });
        }
    };

    return (
        <div className="grid gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Añadir Nuevo Local</CardTitle>
                    <CardDescription>Rellene el formulario para añadir un nuevo local al sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NewLocalForm onLocalAdded={handleLocalAdded} />
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline">Gestionar Locales Existentes</CardTitle>
                    <CardDescription>Edite o elimine los locales existentes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LocalsTable 
                        locals={locals}
                        loading={loading}
                        onLocalUpdated={handleLocalUpdated}
                        onLocalDeleted={handleLocalDeleted}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
