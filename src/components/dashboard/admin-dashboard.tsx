"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CircleDollarSign, ShoppingCart, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Sale } from "@/lib/types";

interface MonthlySale {
  month: string;
  total: number;
}

export function AdminDashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0); // Assuming this is calculated elsewhere for now
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);

  useEffect(() => {
    const salesCol = collection(db, "sales");
    const unsubscribe = onSnapshot(salesCol, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Sale));
      
      const revenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
      setTotalRevenue(revenue);
      setTotalSales(salesData.length);

      const monthly = salesData.reduce((acc, sale) => {
          const date = (sale.date as Timestamp).toDate();
          const month = date.toLocaleString('default', { month: 'short' });
          const existing = acc.find(d => d.month === month);
          if (existing) {
            existing.total += sale.total;
          } else {
            acc.push({ month, total: sale.total });
          }
          return acc;
        }, [] as MonthlySale[]);
      
      // Ensure all months are present for the chart
      const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const completeMonthlySales = allMonths.map(monthName => {
        const found = monthly.find(m => m.month === monthName);
        return found || { month: monthName, total: 0 };
      });
      
      setMonthlySales(completeMonthlySales);
    });

    // Fetch new customers (placeholder)
    const usersCol = collection(db, "Usuarios");
    const q = query(usersCol, where("rol", "==", "local"));
    getDocs(q).then(snapshot => setNewCustomers(snapshot.size));

    return () => unsubscribe();
  }, []);

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all locals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSales}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newCustomers}</div>
            <p className="text-xs text-muted-foreground">Local user accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Sales Overview</CardTitle>
          <CardDescription>An overview of sales throughout the year.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            total: {
              label: "Total",
              color: "hsl(var(--primary))",
            },
          }} className="h-[300px] w-full">
            <BarChart data={monthlySales} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value}`} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
