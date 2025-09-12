"use client";

import { NewLocalForm } from "@/components/local/new-local-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewLocalPage() {
    return (
        <div className="grid gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Gestion de Locales</CardTitle>
                    <CardDescription>Añada un nuevo local al sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NewLocalForm />
                </CardContent>
            </Card>
        </div>
    );
}
