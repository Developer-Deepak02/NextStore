"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCurrency } from "@/hooks/use-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, DollarSign, ShoppingBag, Package, 
  ArrowUpRight, Activity, Download, 
  IndianRupee, Euro, PoundSterling, JapaneseYen 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { subDays, format, startOfDay, isSameDay } from "date-fns";

export default function AdminDashboard() {
  const { formatCurrency, currencyCode } = useCurrency();
  
  const [stats, setStats] = useState({
    users: 0,
    revenue: 0,
    orders: 0,
    products: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Icon Logic
  const getCurrencyIcon = () => {
    switch (currencyCode) {
        case 'INR': return <IndianRupee className="h-4 w-4 text-primary" />;
        case 'EUR': return <Euro className="h-4 w-4 text-primary" />;
        case 'GBP': return <PoundSterling className="h-4 w-4 text-primary" />;
        case 'JPY': return <JapaneseYen className="h-4 w-4 text-primary" />;
        default: return <DollarSign className="h-4 w-4 text-primary" />;
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    setLoading(true);

    // 1. Fetch Counts
    const { count: userCount } = await supabase.from("users").select("*", { count: 'exact', head: true });
    const { count: productCount } = await supabase.from("products").select("*", { count: 'exact', head: true });
    
    // 2. Fetch Orders (Last 30 days for flexibility, but we chart 7)
    const { data: orders } = await supabase
      .from("orders")
      .select("id, total_amount, created_at")
      .order("created_at", { ascending: true }); // Important for chart order

    const orderCount = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // 3. Process Chart Data (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        return {
            date: d,
            name: format(d, "EEE"), // "Mon", "Tue"
            total: 0
        };
    });

    // Aggregate totals per day
    orders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        const dayStat = last7Days.find(d => isSameDay(d.date, orderDate));
        if (dayStat) {
            dayStat.total += (order.total_amount || 0);
        }
    });

    setStats({
      users: userCount || 0,
      products: productCount || 0,
      orders: orderCount,
      revenue: totalRevenue
    });
    setChartData(last7Days);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg border-none text-white">
           <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Revenue - DYNAMIC ICON & VALUE */}
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
                {/* Dynamic Icon Here */}
                {getCurrencyIcon()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
                {loading ? "..." : formatCurrency(stats.revenue)}
            </div>
            <p className="text-xs text-emerald-500 font-medium flex items-center pt-2">
               <ArrowUpRight className="h-3 w-3 mr-1" /> +20.1% from last month
            </p>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
                <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.orders}</div>
            <p className="text-xs text-emerald-500 font-medium flex items-center pt-2"><ArrowUpRight className="h-3 w-3 mr-1" /> +180.1%</p>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
                <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.products}</div>
            <p className="text-xs text-muted-foreground pt-2">+12 new this week</p>
          </CardContent>
        </Card>

        {/* Users */}
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.users}</div>
            <p className="text-xs text-emerald-500 font-medium flex items-center pt-2"><Activity className="h-3 w-3 mr-1" /> +2 since last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* FULL WIDTH CHART - REAL DATA */}
      <div className="grid gap-4 grid-cols-1">
        <Card className="col-span-1 border-none shadow-2xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Sales Overview (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                />
                <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => formatCurrency(value)} 
                />
                <Tooltip 
                    cursor={{fill: 'var(--accent)', opacity: 0.1}}
                    contentStyle={{ 
                        borderRadius: '12px', border: 'none', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)'
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Bar 
                    dataKey="total" 
                    fill="currentColor" 
                    radius={[6, 6, 0, 0]} 
                    className="fill-primary" 
                    barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}