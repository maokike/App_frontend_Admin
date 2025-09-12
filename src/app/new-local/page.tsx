"use client";

import { NewLocalForm } from "@/components/local/new-local-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalsTable } from "@/components/local/locals-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewLocalPage() {
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
                    <NewLocalForm />
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline">Gestionar Locales Existentes</CardTitle>
                    <CardDescription>Edite o elimine los locales existentes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LocalsTable />
                </CardContent>
            </Card>
        </div>
    );
}
