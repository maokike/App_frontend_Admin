"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EditProductForm } from "@/components/product/edit-product-form";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

export function InventoryView() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const productsCollection = collection(db, "products");
        const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
            const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(productList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleProductUpdate = async (updatedProduct: Product) => {
        const productRef = doc(db, "products", updatedProduct.id);
        await updateDoc(productRef, {
            name: updatedProduct.name,
            price: updatedProduct.price,
            description: updatedProduct.description,
            stock: updatedProduct.stock,
        });
        setSelectedProduct(null);
        router.push('/login'); 
    };

    const handleProductDelete = async (productId: string) => {
        const productRef = doc(db, "products", productId);
        await deleteDoc(productRef);
        setSelectedProduct(null);
        router.push('/login');
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
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-1/2 mx-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-1/4 mx-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    products.map(product => {
                                        const stockLevel = product.stock ? (product.stock / 200) * 100 : 0; // Assume max stock is 200 for progress bar
                                        return (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell className="text-center">${product.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">{product.stock || 0}</TableCell>
                                            <TableCell>
                                                <Progress value={stockLevel} className="w-full" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <SheetTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </SheetTrigger>
                                            </TableCell>
                                        </TableRow>
                                    )})
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
