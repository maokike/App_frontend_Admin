"use client";

import { products } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export function InventoryView() {
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
                            {products.map(product => {
                                // Assuming max stock is 100 for visualization
                                const stockLevel = (Math.random() * 80) + 20;
                                return (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="text-center">${product.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-center">{Math.round(stockLevel)}</TableCell>
                                        <TableCell>
                                            <Progress value={stockLevel} className="w-full" />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}