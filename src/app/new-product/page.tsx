"use client";

import { NewProductForm } from "@/components/product/new-product-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
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
