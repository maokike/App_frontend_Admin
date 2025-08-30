"use client";

import { products } from "@/lib/data";
import type { Product } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import React, { useState, useEffect } from "react";

interface ProductWithStock extends Product {
    stockLevel: number;
}

export function InventoryView() {
    const [productsWithStock, setProductsWithStock] = useState<ProductWithStock[]>([]);

    useEffect(() => {
        // Generate stock levels only on the client side
        const productsWithGeneratedStock = products.map(product => ({
            ...product,
            stockLevel: (Math.random() * 80) + 20
        }));
        setProductsWithStock(productsWithGeneratedStock);
    }, []);


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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Producto</TableHead>
                                <TableHead className="text-center">Precio</TableHead>
                                <TableHead className="text-center">Stock Actual</TableHead>
                                <TableHead className="w-[20%] text-center">Nivel de Stock</TableHead>
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
                                    </TableRow>
                                ))
                            ) : (
                                products.map(product => (
                                     <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="text-center">${product.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-center">...</TableCell>
                                        <TableCell>
                                            <Progress value={0} className="w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
