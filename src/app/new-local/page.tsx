"use client";

import { useState, useEffect } from "react";
import { NewLocalForm } from "@/components/local/new-local-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalsTable } from "@/components/local/locals-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Local } from "@/lib/types";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, runTransaction } from "firebase/firestore";
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

    const handleLocalAdded = async (newLocal: Omit<Local, 'id'>) => {
        try {
            await runTransaction(db, async (transaction) => {
                const newLocalRef = doc(collection(db, "locals"));
                transaction.set(newLocalRef, newLocal);

                const userRef = doc(db, "Usuarios", newLocal.userId);
                transaction.update(userRef, { localId: newLocalRef.id });
            });
            
            toast({
                title: "Local Creado",
                description: `El local ${newLocal.name} ha sido añadido.`,
            });
            router.push('/');
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
                const originalLocalData = originalLocalDoc.data() as Local;

                if (originalLocalData.userId !== updatedLocal.userId) {
                    const oldUserRef = doc(db, "Usuarios", originalLocalData.userId);
                    transaction.update(oldUserRef, { localId: null });

                    const newUserRef = doc(db, "Usuarios", updatedLocal.userId);
                    transaction.update(newUserRef, { localId: updatedLocal.id });
                }

                transaction.update(localRef, { ...updatedLocal });
            });

            toast({
                title: "Local Actualizado",
                description: `El local ${updatedLocal.name} ha sido actualizado.`,
            });
            router.push('/');
       } catch (error) {
            console.error("Error updating local: ", error);
            toast({ title: "Error", description: "No se pudo actualizar el local", variant: "destructive" });
       }
    };

    const handleLocalDeleted = async (localId: string, userId: string) => {
        try {
             await runTransaction(db, async (transaction) => {
                const localRef = doc(db, "locals", localId);
                transaction.delete(localRef);

                if (userId) {
                    const userRef = doc(db, "Usuarios", userId);
                    transaction.update(userRef, { localId: null });
                }
             });
            
            toast({
                title: "Local Eliminado",
                description: "El local ha sido eliminado correctamente.",
                variant: "destructive",
            });
            router.push('/');
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
