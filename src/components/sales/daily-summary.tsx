"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, getDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Sale, Product } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/hooks/use-auth";


export function DailySummary() {
    const { user, role } = useAuth();
    const [dailySales, setDailySales] = useState<(Sale & { productName: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const salesCol = collection(db, "sales");
        
        let salesQuery = query(salesCol, where('date', '>=', Timestamp.fromDate(today)), where('date', '<', Timestamp.fromDate(tomorrow)));

        // If user is local, only show their sales
        if (role === 'local' && (user as any).localId) {
             salesQuery = query(salesCol, where('date', '>=', Timestamp.fromDate(today)), where('date', '<', Timestamp.fromDate(tomorrow)), where('localId', '==', (user as any).localId));
        }

        const unsubscribe = onSnapshot(salesQuery, async (snapshot) => {
            const salesPromises = snapshot.docs.map(async saleDoc => {
                const saleData = saleDoc.data() as Sale;
                const productRef = doc(db, "products", saleData.productId);
                const productSnap = await getDoc(productRef);
                const productName = productSnap.exists() ? (productSnap.data() as Product).name : 'N/A';
                return { ...saleData, id: saleDoc.id, productName };
            });
            const resolvedSales = await Promise.all(salesPromises);
            setDailySales(resolvedSales);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [user, role]);

    const totalRevenue = dailySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItemsSold = dailySales.reduce((sum, sale) => sum + sale.quantity, 0);

    return (
        <div className="grid gap-8">
             <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{dailySales.length}</div>}
                        <p className="text-xs text-muted-foreground">Transacciones totales hoy</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos de Hoy</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>}
                         <p className="text-xs text-muted-foreground">Total de ingresos generados hoy</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Artículos Vendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">+{totalItemsSold}</div>}
                        <p className="text-xs text-muted-foreground">Total de artículos vendidos hoy</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Resumen de Ventas Diarias</CardTitle>
                    <CardDescription>
                        Mostrando todas las ventas registradas hoy, {new Date().toLocaleDateString()}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-center">Cantidad</TableHead>
                                <TableHead className="text-center">Método de Pago</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                 Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-1/2 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-1/4 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : dailySales.length > 0 ? (
                                dailySales.map(sale => (
                                    <TableRow key={sale.id}>
                                        <TableCell className="font-medium">{sale.productName}</TableCell>
                                        <TableCell className="text-center">{sale.quantity}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={sale.paymentMethod === 'card' ? 'default' : 'secondary'} className="capitalize">
                                                {sale.paymentMethod}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        No se han registrado ventas hoy.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                         {!loading && dailySales.length > 0 && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-bold text-lg">Total de Hoy</TableCell>
                                    <TableCell className="text-right font-bold text-lg">${totalRevenue.toFixed(2)}</TableCell>
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
