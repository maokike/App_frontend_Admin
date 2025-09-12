"use client";

import { useState, useEffect } from "react";
import { NewLocalForm } from "@/components/local/new-local-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalsTable } from "@/components/local/locals-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Local } from "@/lib/types";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";


export default function NewLocalPage() {
    const [locals, setLocals] = useState<Local[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

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
            await addDoc(collection(db, "locals"), newLocal);
            toast({
                title: "Local Creado",
                description: `El local ${newLocal.name} ha sido añadido.`,
            });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo crear el local", variant: "destructive" });
        }
    };

    const handleLocalUpdated = async (updatedLocal: Local) => {
       try {
            const localRef = doc(db, "locals", updatedLocal.id);
            await updateDoc(localRef, { ...updatedLocal });
             toast({
                title: "Local Actualizado",
                description: `El local ${updatedLocal.name} ha sido actualizado.`,
            });
       } catch (error) {
            toast({ title: "Error", description: "No se pudo actualizar el local", variant: "destructive" });
       }
    };

    const handleLocalDeleted = async (localId: string) => {
        try {
            const localRef = doc(db, "locals", localId);
            await deleteDoc(localRef);
            toast({
                title: "Local Eliminado",
                description: "El local ha sido eliminado correctamente.",
                variant: "destructive",
            });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar el local", variant: "destructive" });
        }
    };

    return (
        <div className="grid gap-8">
            <div className="flex justify-start">
                <Button asChild variant="outline">
                    <Link href="/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Dashboard
                    </Link>
                </Button>
            </div>
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
