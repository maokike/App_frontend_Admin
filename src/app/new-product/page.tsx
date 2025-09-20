"use client";

import { NewProductForm } from "@/components/product/new-product-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import type { UserRole } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

export default function NewProductPage() {
    const { role } = useAuth();
    return (
        <div className="grid gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Ingresar Nuevo Producto</CardTitle>
                    <CardDescription>Añada un nuevo producto al inventario.</CardDescription>
                </CardHeader>
                <CardContent>
                    <NewProductForm />
                </CardContent>
            </Card>
            {role === 'admin' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Editar Productos Existentes</CardTitle>
                        <CardDescription>
                            Para editar o eliminar un producto, vaya a la vista de inventario.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/inventory">
                                <Pencil className="mr-2 h-4 w-4" />
                                Ir al Inventario
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
