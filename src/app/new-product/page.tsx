"use client";

import { NewProductForm } from "@/components/product/new-product-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewProductPage() {
    return (
        <div className="grid gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Ingresar Producto Nuevo</CardTitle>
                    <CardDescription>Añada un nuevo producto al inventario.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NewProductForm />
                </CardContent>
            </Card>
        </div>
    );
}