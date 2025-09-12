"use client";

import { products as initialProducts } from "@/lib/data";
import type { Product } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EditProductForm } from "@/components/product/edit-product-form";

interface ProductWithStock extends Product {
    stockLevel: number;
}

export function InventoryView() {
    const [productsWithStock, setProductsWithStock] = useState<ProductWithStock[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);

    useEffect(() => {
        // Generate stock levels only on the client side
        const productsWithGeneratedStock = initialProducts.map(product => ({
            ...product,
            stockLevel: (Math.random() * 80) + 20
        }));
        setProductsWithStock(productsWithGeneratedStock);
    }, []);

    const handleProductUpdate = (updatedProduct: Product) => {
        setProductsWithStock(prevProducts =>
            prevProducts.map(p => p.id === updatedProduct.id ? { ...p, ...updatedProduct, stockLevel: p.stockLevel } : p)
        );
        setSelectedProduct(null);
    };

    const handleProductDelete = (productId: string) => {
        setProductsWithStock(prevProducts => prevProducts.filter(p => p.id !== productId));
        setSelectedProduct(null);
    };


    return (
        <div className="grid gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Inventario de Productos</CardTitle>
                    <CardDescription>
                        Una vista general del stock de todos los productos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Sheet onOpenChange={(isOpen) => !isOpen && setSelectedProduct(null)}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[35%]">Producto</TableHead>
                                    <TableHead className="text-center">Precio</TableHead>
                                    <TableHead className="text-center">Stock Actual</TableHead>
                                    <TableHead className="w-[20%] text-center">Nivel de Stock</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productsWithStock.length > 0 ? (
                                    productsWithStock.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell className="text-center">${product.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">{Math.round(product.stockLevel)}</TableCell>
                                            <TableCell>
                                                <Progress value={product.stockLevel} className="w-full" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <SheetTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </SheetTrigger>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    initialProducts.map(product => (
                                         <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell className="text-center">${product.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">...</TableCell>
                                            <TableCell>
                                                <Progress value={0} className="w-full" />
                                            </TableCell>
                                            <TableCell className="text-right"></TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                         {selectedProduct && (
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Editar Producto</SheetTitle>
                                    <SheetDescription>
                                       Realice cambios en el producto aquí. Haga clic en guardar cuando haya terminado.
                                    </SheetDescription>
                                </SheetHeader>
                                <EditProductForm
                                    product={selectedProduct}
                                    onSave={handleProductUpdate}
                                    onDelete={handleProductDelete}
                                />
                            </SheetContent>
                        )}
                    </Sheet>
                </CardContent>
            </Card>
        </div>
    );
}
