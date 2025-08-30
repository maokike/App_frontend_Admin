"use client";

import { sales, products } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function DailySummary() {
    const today = new Date();
    const dailySales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getDate() === today.getDate() &&
               saleDate.getMonth() === today.getMonth() &&
               saleDate.getFullYear() === today.getFullYear();
    });

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
                        <div className="text-2xl font-bold">{dailySales.length}</div>
                        <p className="text-xs text-muted-foreground">Transacciones totales hoy</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos de Hoy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                         <p className="text-xs text-muted-foreground">Total de ingresos generados hoy</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Artículos Vendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalItemsSold}</div>
                        <p className="text-xs text-muted-foreground">Total de artículos vendidos hoy</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Resumen de Ventas Diarias</CardTitle>
                    <CardDescription>
                        Mostrando todas las ventas registradas hoy, {today.toLocaleDateString()}.
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
                            {dailySales.length > 0 ? (
                                dailySales.map(sale => {
                                    const product = products.find(p => p.id === sale.productId);
                                    return (
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-medium">{product?.name || 'N/A'}</TableCell>
                                            <TableCell className="text-center">{sale.quantity}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={sale.paymentMethod === 'card' ? 'default' : 'secondary'} className="capitalize">
                                                    {sale.paymentMethod}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        No se han registrado ventas hoy.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                         {dailySales.length > 0 && (
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