
"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CircleDollarSign, LogOut, ShoppingCart, Users, Store, Warehouse, Package, Calendar, History } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query, where, Timestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Sale } from "@/lib/types";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlySale {
  month: string;
  total: number;
  ventas: number;
}

interface AdminDashboardProps {
  onLogout?: () => void;
}

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
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
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
    
    // Query para todas las ventas ordenadas por fecha
    const salesQuery = query(salesCol, orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("📊 Ventas encontradas:", salesData.length);

      // Agrupar ventas igual que en la app móvil
      const groupedSalesMap: { [key: string]: GroupedSale } = {};
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      
      let todayRevenue = 0;
      let todaySalesCount = 0;

      salesData.forEach(sale => {
        const ventaId = sale.saleId || sale.id;
        
        if (!groupedSalesMap[ventaId]) {
          groupedSalesMap[ventaId] = {
            ventaId: ventaId,
            date: sale.date,
            tipo_pago: sale.tipo_pago || sale.paymentMethod || 'efectivo',
            productos: [],
            totalVenta: 0,
            localId: sale.localId
          };
        }
        
        // Agregar producto individual
        if (sale.products && Array.isArray(sale.products)) {
          sale.products.forEach(prod => {
            groupedSalesMap[ventaId].productos.push({
              producto: prod.producto || prod.productName || 'Producto',
              quantity: prod.quantity || 1,
              total: prod.total || 0
            });
            groupedSalesMap[ventaId].totalVenta += prod.total || 0;
          });
        } else if (sale.producto) {
          groupedSalesMap[ventaId].productos.push({
            producto: sale.producto || sale.productName || 'Producto',
            quantity: sale.quantity || 1,
            total: sale.total || 0
          });
          groupedSalesMap[ventaId].totalVenta += sale.total || 0;
        }

        // Calcular estadísticas de hoy
        if (sale.date && sale.date.toDate) {
          const saleDate = sale.date.toDate();
          if (saleDate >= startOfToday) {
            todayRevenue += sale.total || 0;
            // Solo contar una vez por venta agrupada
            if (ventaId === (sale.ventaId || sale.id)) {
              todaySalesCount++;
            }
          }
        }
      });
      
      const groupedSalesArray = Object.values(groupedSalesMap);
      
      // Estadísticas generales
      const totalRevenue = groupedSalesArray.reduce((sum, venta) => sum + venta.totalVenta, 0);
      const totalSalesCount = groupedSalesArray.length;

      setTotalRevenue(totalRevenue);
      setTotalSales(totalSalesCount);
      setTodayRevenue(todayRevenue);
      setTodaySales(todaySalesCount);
      setRecentSales(groupedSalesArray.slice(0, 5)); // Últimas 5 ventas

      // Calcular ventas mensuales
      const monthly = groupedSalesArray.reduce((acc, venta) => {
        if (venta.date && venta.date.toDate) {
          const date = venta.date.toDate();
          const month = date.toLocaleString('es-ES', { month: 'short' });
          const existing = acc.find(d => d.month === month);
          if (existing) {
            existing.total += venta.totalVenta;
            existing.ventas += 1;
          } else {
            acc.push({ month, total: venta.totalVenta, ventas: 1 });
          }
        }
        return acc;
      }, [] as MonthlySale[]);
      
      // Ordenar meses y asegurar todos estén presentes
      const monthOrder = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      const completeMonthlySales = monthOrder.map(monthName => {
        const found = monthly.find(m => m.month.toLowerCase() === monthName);
        return found || { month: monthName, total: 0, ventas: 0 };
      });
      
      setMonthlySales(completeMonthlySales);
      setLoading(false);
    });

    // Obtener total de locales
    const usersCol = collection(db, "Usuarios");
    const localsQuery = query(usersCol, where("rol", "==", "local"));
    getDocs(localsQuery).then(snapshot => setTotalLocals(snapshot.size));

    return () => unsubscribe();
  }, []);

  const formatNumber = (number: number) => {
    if (number === 0) return '0';
    const integerNumber = Math.round(number);
    return integerNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatTimestamp = (timestamp: Timestamp) => {
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
    return tipoPago === 'efectivo' ? '💵' : '💳';
  };

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-8 mt-8">
      {/* Sidebar Menu */}
      <aside className="hidden lg:flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Panel Admin</CardTitle>
            <CardDescription>Gestión completa del sistema</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/new-local">
                <Store className="mr-2 h-4 w-4" />
                Gestión de Locales
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/inventory">
                <Warehouse className="mr-2 h-4 w-4" />
                Gestión de Inventario
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/new-product">
                <Package className="mr-2 h-4 w-4" />
                Gestión de Productos
              </Link>
            </Button>
             <Button variant="outline" className="justify-start" asChild>
              <Link href="/sales-history">
                <History className="mr-2 h-4 w-4" />
                Historial de Ventas
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        {onLogout && (
          <Card>
            <CardHeader>
              <CardTitle>Sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </CardContent>
          </Card>
        )}
      </aside>

      {/* Main Content */}
      <main className="grid gap-8">
        {/* Estadísticas Principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-pink-200" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-3/4 bg-pink-400" />
              ) : (
                <div className="text-2xl font-bold">${formatNumber(totalRevenue)}</div>
              )}
              <p className="text-xs text-pink-200">Todos los locales</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-fuchsia-200" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-1/2 bg-fuchsia-400" />
              ) : (
                <div className="text-2xl font-bold">{formatNumber(totalSales)}</div>
              )}
              <p className="text-xs text-fuchsia-200">Transacciones totales</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locales Activos</CardTitle>
              <Store className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-1/4 bg-purple-400" />
              ) : (
                <div className="text-2xl font-bold">{formatNumber(totalLocals)}</div>
              )}
              <p className="text-xs text-purple-200">Cuentas de locales</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-3/4 bg-blue-400" />
              ) : (
                <>
                  <div className="text-2xl font-bold">${formatNumber(todayRevenue)}</div>
                  <p className="text-xs text-blue-200">{todaySales} ventas hoy</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Gráfico de Ventas Mensuales */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Resumen de Ventas</CardTitle>
              <CardDescription>Ventas mensuales del año actual</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ChartContainer config={{
                  total: {
                    label: "Total",
                    color: "hsl(var(--primary))",
                  },
                }} className="h-[250px] w-full">
                  <BarChart data={monthlySales} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Ventas Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Ventas Recientes</CardTitle>
              <CardDescription>Últimas transacciones registradas</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentSales.length > 0 ? (
                <div className="space-y-3">
                  {recentSales.map((venta) => (
                    <div key={venta.ventaId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          venta.tipo_pago === 'efectivo' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {getPaymentIcon(venta.tipo_pago)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            Venta {formatTimestamp(venta.date)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {venta.productos.length} productos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ${formatNumber(venta.totalVenta)}
                        </p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {venta.tipo_pago}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay ventas recientes</p>
                </div>
              )}
              
              {!loading && recentSales.length > 0 && (
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/sales-history">
                    Ver Historial Completo
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

    