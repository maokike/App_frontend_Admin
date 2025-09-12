"use client";

import { useState } from "react";
import { NewLocalForm } from "@/components/local/new-local-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalsTable } from "@/components/local/locals-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { locals as initialLocals } from "@/lib/data";
import type { Local } from "@/lib/types";

export default function NewLocalPage() {
    const [locals, setLocals] = useState<Local[]>(initialLocals);

    const handleLocalAdded = (newLocal: Omit<Local, 'id'>) => {
        const localWithId = { ...newLocal, id: `local_${Date.now()}` };
        setLocals(currentLocals => [...currentLocals, localWithId]);
    };

    const handleLocalUpdated = (updatedLocal: Local) => {
        setLocals(currentLocals => currentLocals.map(l => l.id === updatedLocal.id ? updatedLocal : l));
    };

    const handleLocalDeleted = (localId: string) => {
        setLocals(currentLocals => currentLocals.filter(l => l.id !== localId));
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
                        onLocalUpdated={handleLocalUpdated}
                        onLocalDeleted={handleLocalDeleted}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
