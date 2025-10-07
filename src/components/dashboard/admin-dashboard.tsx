"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CircleDollarSign, ShoppingCart, Store, Calendar, History } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query, where, Timestamp, orderBy, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlySale {
  month: string;
  total: number;
}

interface SaleProduct {
  producto?: string;
  productName?: string;
  quantity?: number;
  total?: number;
  price?: number;
}

interface FirebaseSale extends DocumentData {
  id: string;
  ventaId?: string;
  date?: Timestamp;
  tipo_pago?: string;
  paymentMethod?: string;
  producto?: string;
  productName?: string;
  quantity?: number;
  total?: number;
  products?: SaleProduct[];
  localId?: string;
}

interface GroupedSale {
  ventaId: string;
  date: Timestamp | null;
  tipo_pago: string;
  productos: Array<{
    producto: string;
    quantity: number;
    total: number;
  }>;
  totalVenta: number;
  localId?: string;
}

export function AdminDashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalLocals, setTotalLocals] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);
  const [recentSales, setRecentSales] = useState<GroupedSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const salesCol = collection(db, "sales");
    const salesQuery = query(salesCol, orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseSale));

      console.log("📊 Ventas encontradas:", salesData.length);

      // Agrupar ventas
      const groupedSalesMap: { [key: string]: GroupedSale } = {};
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const currentYear = today.getFullYear();

      let todayRevenue = 0;
      const todaySalesSet = new Set();

      salesData.forEach((sale: FirebaseSale) => {
        const ventaId = sale.ventaId || sale.id;
        
        if (!groupedSalesMap[ventaId]) {
          groupedSalesMap[ventaId] = {
            ventaId: ventaId,
            date: sale.date || null,
            tipo_pago: sale.tipo_pago || sale.paymentMethod || 'efectivo',
            productos: [],
            totalVenta: 0,
            localId: sale.localId
          };
        }

        // Agregar productos
        if (sale.products && Array.isArray(sale.products)) {
          sale.products.forEach((prod: SaleProduct) => {
            const productName = prod.producto || prod.productName || 'Producto';
            const quantity = prod.quantity || 1;
            const total = prod.total || 0;
            
            groupedSalesMap[ventaId].productos.push({
              producto: productName,
              quantity: quantity,
              total: total
            });
            groupedSalesMap[ventaId].totalVenta += total;
          });
        } else {
          // Si no hay array de products, usar los campos directos
          const productName = sale.producto || sale.productName || 'Producto';
          const quantity = sale.quantity || 1;
          const total = sale.total || 0;
          
          groupedSalesMap[ventaId].productos.push({
            producto: productName,
            quantity: quantity,
            total: total
          });
          groupedSalesMap[ventaId].totalVenta += total;
        }

        // Verificar si es venta de hoy
        if (sale.date && sale.date.toDate) {
          const saleDate = sale.date.toDate();
          if (saleDate >= startOfToday) {
            todayRevenue += sale.total || 0;
            todaySalesSet.add(ventaId);
          }
        }
      });

      const groupedSalesArray = Object.values(groupedSalesMap);
      
      // Calcular estadísticas
      const totalRevenue = groupedSalesArray.reduce((sum, venta) => sum + venta.totalVenta, 0);
      const totalSalesCount = groupedSalesArray.length;

      setTotalRevenue(totalRevenue);
      setTotalSales(totalSalesCount);
      setTodayRevenue(todayRevenue);
      setTodaySales(todaySalesSet.size);
      setRecentSales(groupedSalesArray.slice(0, 5));

      // Calcular ventas mensuales
      const monthlyTotals: { [key: string]: number } = {};
      
      groupedSalesArray.forEach((venta: GroupedSale) => {
        if (venta.date && venta.date.toDate) {
          const saleDate = venta.date.toDate();
          if (saleDate.getFullYear() === currentYear) {
            const monthName = saleDate.toLocaleString('es-ES', { month: 'short' });
            
            if (!monthlyTotals[monthName]) {
              monthlyTotals[monthName] = 0;
            }
            monthlyTotals[monthName] += venta.totalVenta;
          }
        }
      });

      // Crear array completo de meses
      const monthOrder = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      const completeMonthlySales = monthOrder.map(monthName => ({
        month: monthName,
        total: monthlyTotals[monthName] || 0,
      }));

      setMonthlySales(completeMonthlySales);
      setLoading(false);
    });

    // Obtener total de locales
    const usersCol = collection(db, "Usuarios");
    const localsQuery = query(usersCol, where("rol", "==", "local"));
    getDocs(localsQuery).then(snapshot => {
      setTotalLocals(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  const formatNumber = (number: number) => {
    if (number === 0) return '0';
    return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatTimestamp = (timestamp: Timestamp | null) => {
    try {
      if (!timestamp) return 'Fecha no disponible';
      if (timestamp.toDate) {
        const date = timestamp.toDate();
        return date.toLocaleString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        });
      }
      return 'Formato inválido';
    } catch (error) {
      return 'Error en fecha';
    }
  };

  const getPaymentIcon = (tipoPago: string) => {
    const method = tipoPago?.toLowerCase();
    return method === 'efectivo' || method === 'cash' ? '💵' : '💳';
  };

  const getPaymentText = (tipoPago: string) => {
    const method = tipoPago?.toLowerCase();
    return method === 'efectivo' || method === 'cash' ? 'Efectivo' : 'Transferencia';
  };

  return (
    <div className="space-y-8">
      {/* Estadísticas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-2xl font-bold">${formatNumber(totalRevenue)}</div>
            )}
            <p className="text-xs text-muted-foreground">Todos los locales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{formatNumber(totalSales)}</div>
            )}
            <p className="text-xs text-muted-foreground">Transacciones totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locales Activos</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-1/4" />
            ) : (
              <div className="text-2xl font-bold">{formatNumber(totalLocals)}</div>
            )}
            <p className="text-xs text-muted-foreground">Cuentas de locales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <>
                <div className="text-2xl font-bold">${formatNumber(todayRevenue)}</div>
                <p className="text-xs text-muted-foreground">{todaySales} ventas hoy</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Gráfico de Ventas Mensuales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Resumen de Ventas</CardTitle>
            <CardDescription>Ventas mensuales del año actual</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : monthlySales.some(sale => sale.total > 0) ? (
              <ChartContainer config={{
                total: {
                  label: "Total",
                  color: "hsl(var(--primary))",
                },
              }} className="h-[250px] w-full">
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8} 
                    tickFormatter={(value) => `$${formatNumber(value)}`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mb-3 opacity-50" />
                <p>No hay datos de ventas</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ventas Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Ventas Recientes</CardTitle>
            <CardDescription>Últimas transacciones registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentSales.length > 0 ? (
              <div className="space-y-3">
                {recentSales.map((venta) => (
                  <div key={venta.ventaId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        getPaymentIcon(venta.tipo_pago) === '💵' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {getPaymentIcon(venta.tipo_pago)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          Venta {formatTimestamp(venta.date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {venta.productos.length} productos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ${formatNumber(venta.totalVenta)}
                      </p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {getPaymentText(venta.tipo_pago)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay ventas recientes</p>
              </div>
            )}
            
            {!loading && recentSales.length > 0 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/sales-history">
                  <History className="mr-2 h-4 w-4" />
                  Ver Historial Completo
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}