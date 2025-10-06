"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Sale, Product } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

interface AggregatedSale {
    productId: string;
    productName: string;
    quantity: number;
    total: number;
    paymentMethods: { [key: string]: number };
}

export function DailySummary() {
    const { user, role } = useAuth();
    const [dailySales, setDailySales] = useState<AggregatedSale[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalTransactions, setTotalTransactions] = useState(0);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const startTimestamp = Timestamp.fromDate(startOfToday);
        const endTimestamp = Timestamp.fromDate(endOfToday);

        let salesQuery;
        const salesCol = collection(db, "sales");

        if (role === 'local' && user.localId) {
             salesQuery = query(salesCol, 
                where('localId', '==', user.localId),
                where('date', '>=', startTimestamp), 
                where('date', '<=', endTimestamp)
             );
        } else if (role === 'admin') {
             salesQuery = query(salesCol,
                where('date', '>=', startTimestamp), 
                where('date', '<=', endTimestamp)
            );
        } else {
            setDailySales([]);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(salesQuery, (snapshot) => {
            setTotalTransactions(snapshot.size);
            const salesData = snapshot.docs.map(doc => doc.data() as Sale);
            
            const aggregated: { [key: string]: AggregatedSale } = {};

            // Simplified aggregation logic
            for (const sale of salesData) {
                const totalQuantityInSale = sale.products.reduce((acc, p) => acc + p.quantity, 0);
                if (totalQuantityInSale === 0) continue;

                for (const item of sale.products) {
                    if (!aggregated[item.productId]) {
                        aggregated[item.productId] = {
                            productId: item.productId,
                            productName: item.productName,
                            quantity: 0,
                            total: 0,
                            paymentMethods: {},
                        };
                    }

                    // Accumulate quantity and a proportional part of the total
                    const itemProportionalTotal = (sale.total / totalQuantityInSale) * item.quantity;
                    aggregated[item.productId].quantity += item.quantity;
                    aggregated[item.productId].total += itemProportionalTotal;

                    // Accumulate payment methods count
                    const paymentMethod = sale.paymentMethod;
                    if (!aggregated[item.productId].paymentMethods[paymentMethod]) {
                        aggregated[item.productId].paymentMethods[paymentMethod] = 0;
                    }
                    aggregated[item.productId].paymentMethods[paymentMethod] += item.quantity;
                }
            }

            setDailySales(Object.values(aggregated));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching daily summary: ", error);
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
                        {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{totalTransactions}</div>}
                        <p className="text-xs text-muted-foreground">Transacciones totales hoy</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos de Hoy</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${totalRevenue.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</div>}
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
                        Mostrando un resumen de productos vendidos hoy, {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-center">Cantidad</TableHead>
                                <TableHead className="text-center">Métodos de Pago</TableHead>
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
                                    <TableRow key={sale.productId}>
                                        <TableCell className="font-medium">{sale.productName}</TableCell>
                                        <TableCell className="text-center">{sale.quantity}</TableCell>
                                        <TableCell className="text-center flex flex-wrap justify-center items-center gap-1">
                                            {Object.entries(sale.paymentMethods).map(([method, count]) => (
                                                <Badge key={method} variant={method === 'card' ? 'default' : 'secondary'} className="capitalize">
                                                    {method} ({count})
                                                </Badge>
                                            ))}
                                        </TableCell>
                                        <TableCell className="text-right">${sale.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</TableCell>
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
                                    <TableCell className="text-right font-bold text-lg">${totalRevenue.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</TableCell>
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
