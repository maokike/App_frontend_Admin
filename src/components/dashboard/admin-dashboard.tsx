
"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CircleDollarSign, LogOut, ShoppingCart, Users, Store, Warehouse, Package, Calendar, History } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query, where, Timestamp, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type { Sale } from "@/lib/types";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface MonthlySale {
  month: string;
  total: number;
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
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Sesión Cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const salesCol = collection(db, "sales");
    const salesQuery = query(salesCol, orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("📊 Ventas encontradas:", salesData.length);

      // Agrupar ventas correctamente
      const groupedSalesMap: { [key: string]: GroupedSale } = {};
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const currentYear = today.getFullYear();

      let todayRevenue = 0;
      const todaySalesSet = new Set();
      const monthlyTotals: { [key: string]: number } = {};

      salesData.forEach(sale => {
        // Determinar ventaId para agrupación de ventas recientes
        const ventaId = sale.ventaId || sale.id;
        
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

        const saleTotal = sale.total || 0;
        groupedSalesMap[ventaId].totalVenta = saleTotal;
        
        // Agregar productos según la estructura
        if (sale.products && Array.isArray(sale.products)) {
          sale.products.forEach(prod => {
            groupedSalesMap[ventaId].productos.push({
              producto: prod.producto || prod.productName || 'Producto',
              quantity: prod.quantity || 1,
              total: prod.total || 0
            });
          });
        } else {
          groupedSalesMap[ventaId].productos.push({
            producto: sale.producto || sale.productName || 'Producto',
            quantity: sale.quantity || 1,
            total: sale.total || 0
          });
        }

        // Cálculos para estadísticas
        if (sale.date && sale.date.toDate) {
          const saleDate = sale.date.toDate();
          
          // Ventas de hoy
          if (saleDate >= startOfToday) {
            todayRevenue += saleTotal;
            todaySalesSet.add(ventaId);
          }

          // Ventas mensuales del año actual
          if (saleDate.getFullYear() === currentYear) {
            const monthName = saleDate.toLocaleString('es-ES', { month: 'short' });
            if (!monthlyTotals[monthName]) {
              monthlyTotals[monthName] = 0;
            }
            monthlyTotals[monthName] += saleTotal;
          }
        }
      });

      const groupedSalesArray = Object.values(groupedSalesMap);
      
      console.log("📦 Ventas agrupadas:", groupedSalesArray.length);
      console.log("💰 Ingresos hoy:", todayRevenue);
      console.log("🛒 Ventas hoy:", todaySalesSet.size);

      // Calcular estadísticas generales
      const totalRevenue = groupedSalesArray.reduce((sum, venta) => sum + venta.totalVenta, 0);
      const totalSalesCount = groupedSalesArray.length;

      setTotalRevenue(totalRevenue);
      setTotalSales(totalSalesCount);
      setTodayRevenue(todayRevenue);
      setTodaySales(todaySalesSet.size);
      setRecentSales(groupedSalesArray.slice(0, 5));

      // Crear array completo de meses para el gráfico
      const monthOrder = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      const completeMonthlySales = monthOrder.map(monthName => ({
        month: monthName,
        total: monthlyTotals[monthName] || 0,
      }));

      console.log("📈 Ventas mensuales:", completeMonthlySales);
      
      setMonthlySales(completeMonthlySales);
      setLoading(false);
    });

    // Obtener total de locales
    const usersCol = collection(db, "Usuarios");
    const localsQuery = query(usersCol, where("rol", "==", "local"));
    getDocs(localsQuery).then(snapshot => {
      console.log("🏪 Locales encontrados:", snapshot.size);
      setTotalLocals(snapshot.size);
    });

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
    const method = tipoPago?.toLowerCase();
    return method === 'efectivo' || method === 'cash' ? '💵' : '💳';
  };

  const getPaymentText = (tipoPago: string) => {
    const method = tipoPago?.toLowerCase();
    return method === 'efectivo' || method === 'cash' ? 'Efectivo' : 'Transferencia';
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
        
        {/* Botón de Cerrar Sesión */}
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
          {/* Gráfico de Ventas Mensuales CORREGIDO */}
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
              ) : monthlySales.some(sale => sale.total > 0) ? (
                <ChartContainer config={{
                  total: {
                    label: "Total",
                    color: "hsl(var(--primary))",
                  },
                }} className="h-[250px] w-full">
                  <BarChart 
                    data={monthlySales} 
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
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
                      width={60}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-semibold">{`${payload[0].payload.month.charAt(0).toUpperCase() + payload[0].payload.month.slice(1)}`}</p>
                              <p className="text-green-600 font-bold">{`$${formatNumber(payload[0].value as number)}`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-gray-500">
                  <ShoppingCart className="h-12 w-12 mb-3 opacity-50" />
                  <p>No hay datos de ventas para el año actual</p>
                  <p className="text-sm">Las ventas aparecerán aquí cuando se registren</p>
                </div>
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
                          getPaymentIcon(venta.tipo_pago) === '💵' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
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
                          {getPaymentText(venta.tipo_pago)}
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
