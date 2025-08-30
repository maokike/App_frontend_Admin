"use client";

import { NewCustomerForm } from "@/components/customer/new-customer-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCustomerPage() {
    return (
        <div className="grid gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Ingresar Nuevo Cliente</CardTitle>
                    <CardDescription>Añada un nuevo cliente al sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NewCustomerForm />
                </CardContent>
            </Card>
        </div>
    );
}