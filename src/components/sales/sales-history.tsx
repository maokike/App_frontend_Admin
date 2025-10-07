
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, Timestamp, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Product, Sale, User, Local } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";

interface GroupedSale {
  ventaId: string;
  date: Timestamp;
  tipo_pago: string;
  productos: Array<{
    producto: string;
    quantity: number;
    total: number;
  }>;
  totalVenta: number;
  localId?: string;
  localName?: string;
}

export function SalesHistory() {
  const { user, role } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [groupedSales, setGroupedSales] = useState<GroupedSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [saleCount, setSaleCount] = useState(0);
  const [averageSale, setAverageSale] = useState(0);
  const [locals, setLocals] = useState<Local[]>([]);

  useEffect(() => {
    const fetchLocals = async () => {
        if (role === 'admin') {
            const localsCollection = collection(db, "locals");
            const localsSnapshot = await getDocs(localsCollection);
            const localsList = localsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Local));
            setLocals(localsList);
        }
    };
    fetchLocals();
  }, [role]);

  useEffect(() => {
    if (!selectedDate) {
      setGroupedSales([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1, 0, 0, 0);

    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    let salesQuery;
    const salesCol = collection(db, "sales");

    if (role === 'admin') {
      salesQuery = query(
        salesCol,
        where('date', '>=', startTimestamp), 
        where('date', '<', endTimestamp),
        orderBy('date', 'desc')
      );
    } else if (role === 'local' && user?.localId) {
       salesQuery = query(
        salesCol, 
        where('localId', '==', user.localId),
        where('date', '>=', startTimestamp), 
        where('date', '<', endTimestamp),
        orderBy('date', 'desc')
      );
    } else {
      setGroupedSales([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Sale));

      const groupedSalesMap: { [key: string]: GroupedSale } = {};
      
      salesData.forEach(sale => {
        const ventaId = sale.saleId || sale.id;
        
        if (!groupedSalesMap[ventaId]) {
          groupedSalesMap[ventaId] = {
            ventaId: ventaId,
            date: sale.date as Timestamp,
            tipo_pago: sale.paymentMethod || 'efectivo',
            productos: [],
            totalVenta: sale.total,
            localId: sale.localId,
            localName: locals.find(l => l.id === sale.localId)?.name || "Desconocido"
          };
        }
        
        const saleProducts = sale.products || [];

        saleProducts.forEach((prod: any) => {
            groupedSalesMap[ventaId].productos.push({
                producto: prod.productName,
                quantity: prod.quantity,
                total: prod.total || 0,
            });
        });
      });
      
      const groupedSalesArray = Object.values(groupedSalesMap);

      setGroupedSales(groupedSalesArray);

      const totalRevenue = groupedSalesArray.reduce((sum, venta) => sum + venta.totalVenta, 0);
      const saleCount = groupedSalesArray.length;
      const averageSale = saleCount > 0 ? totalRevenue / saleCount : 0;

      setTotalRevenue(totalRevenue);
      setSaleCount(saleCount);
      setAverageSale(averageSale);
      setLoading(false);

    }, (error) => {
      console.error("Error fetching sales history: ", error);
      setLoading(false);
    });

    return () => unsubscribe();

  }, [selectedDate, user, role, locals]);

  const formatNumber = (number: number) => {
    if (number === 0) return '0';
    const integerNumber = Math.round(number);
    return integerNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    try {
      if (!timestamp?.toDate) return 'Fecha no disponible';
      return format(timestamp.toDate(), 'HH:mm', { locale: es });
    } catch (error) {
      return 'Error en fecha';
    }
  };
  
  const getPaymentIcon = (tipoPago: string) => {
    return tipoPago === 'efectivo' || tipoPago === 'cash' ? '💵' : '💳';
  };

  return (
    <div className="grid md:grid-cols-[340px_1fr] gap-8">
        <aside>
            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar Fecha</CardTitle>
                    <CardDescription>Elige un día para ver las ventas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border p-0"
                        locale={es}
                    />
                </CardContent>
            </Card>
        </aside>

        <main className="grid gap-8">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-pink-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos del Día</CardTitle>
                    <span className="text-2xl">💰</span>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-3/4 bg-pink-400" /> : <div className="text-2xl font-bold">${formatNumber(totalRevenue)}</div>}
                </CardContent>
                </Card>
                <Card className="bg-fuchsia-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ventas del Día</CardTitle>
                    <span className="text-2xl">🧾</span>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-1/2 bg-fuchsia-400" /> : <div className="text-2xl font-bold">{formatNumber(saleCount)}</div>}
                </CardContent>
                </Card>
                <Card className="bg-pink-700 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promedio/Venta</CardTitle>
                    <span className="text-2xl">📈</span>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-3/4 bg-pink-600" /> : <div className="text-2xl font-bold">${formatNumber(averageSale)}</div>}
                </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                <CardTitle className="font-headline flex justify-between items-center">
                    <span>Ventas de {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : 'Hoy'}</span>
                </CardTitle>
                <CardDescription>
                    Resumen detallado de todas las ventas del día seleccionado.
                </CardDescription>
                </CardHeader>
                <CardContent>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 mb-4 space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    ))
                ) : groupedSales.length > 0 ? (
                    <div className="space-y-4">
                    {groupedSales.map((venta) => (
                        <div key={venta.ventaId} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                            <h3 className="font-semibold text-lg">Venta {formatTimestamp(venta.date)}</h3>
                            {role === 'admin' && <Badge variant="secondary" className="mt-1">{venta.localName}</Badge>}
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-pink-600">${formatNumber(venta.totalVenta)}</div>
                            </div>
                        </div>
                        <div className="space-y-2 mb-3">
                            {venta.productos.map((producto, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span>{producto.quantity}x {producto.producto}</span>
                                <span className="text-gray-600">${formatNumber(producto.total)}</span>
                            </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 border-t pt-3">
                            <div className="flex items-center gap-1">
                                <span>📦 {venta.productos.length} productos</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>{getPaymentIcon(venta.tipo_pago)}</span>
                                <span className="capitalize">{venta.tipo_pago === 'cash' ? 'Efectivo' : 'Transferencia'}</span>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-lg font-semibold mb-2">No hay ventas en esta fecha</h3>
                    <p>Las ventas del día seleccionado aparecerán aquí.</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </main>
    </div>
  );
}

    