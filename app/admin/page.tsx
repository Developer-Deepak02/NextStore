"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Download,
	DollarSign,
	ShoppingBag,
	Users,
	Package,
} from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";

export default function AdminDashboard() {
	const [stats, setStats] = useState({
		totalRevenue: 0,
		totalOrders: 0,
		totalUsers: 0,
		totalProducts: 0,
	});
	const [salesData, setSalesData] = useState<any[]>([]);

	useEffect(() => {
		async function fetchStats() {
			// 1. Get Orders
			const { data: orders } = await supabase.from("orders").select("*");
			const { data: products } = await supabase.from("products").select("id");

			const totalRevenue =
				orders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0;

			setStats({
				totalRevenue,
				totalOrders: orders?.length || 0,
				totalUsers: 12, // Dummy for now
				totalProducts: products?.length || 0,
			});

			// 2. Prepare Chart Data
			const chartData = [
				{ name: "Mon", total: totalRevenue * 0.1 },
				{ name: "Tue", total: totalRevenue * 0.2 },
				{ name: "Wed", total: totalRevenue * 0.15 },
				{ name: "Thu", total: totalRevenue * 0.25 },
				{ name: "Fri", total: totalRevenue * 0.3 },
			];
			setSalesData(chartData);
		}

		fetchStats();
	}, []);

	// Excel Export Function
	const exportData = async () => {
		const { data: orders } = await supabase.from("orders").select("*");
		if (!orders) return;

		const worksheet = XLSX.utils.json_to_sheet(orders);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
		XLSX.writeFile(workbook, "All_Orders_Data.xlsx");
	};

	return (
		<div className="space-y-8 animate-in fade-in">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				{/* Updated Button: No Border, Green Shadow */}
				<Button
					onClick={exportData}
					className="bg-green-600 hover:bg-green-700 border-none shadow-md transition-all active:scale-95"
				>
					<Download className="mr-2 h-4 w-4" /> Export Orders (Excel)
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatsCard
					title="Total Revenue"
					value={`$${stats.totalRevenue.toFixed(2)}`}
					icon={DollarSign}
				/>
				<StatsCard
					title="Orders"
					value={stats.totalOrders.toString()}
					icon={ShoppingBag}
				/>
				<StatsCard
					title="Products"
					value={stats.totalProducts.toString()}
					icon={Package}
				/>
				<StatsCard
					title="Active Users"
					value={stats.totalUsers.toString()}
					icon={Users}
				/>
			</div>

			{/* Charts Section: No Border, Shadow, Blur */}
			<Card className="col-span-4 border-none shadow-md bg-card/50 backdrop-blur-sm">
				<CardHeader>
					<CardTitle>Sales Overview</CardTitle>
				</CardHeader>
				<CardContent className="pl-2">
					<div className="h-[350px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={salesData}>
								<CartesianGrid
									strokeDasharray="3 3"
									className="stroke-muted/30"
								/>
								<XAxis dataKey="name" className="text-sm" />
								<YAxis
									className="text-sm"
									tickFormatter={(value) => `$${value}`}
								/>
								<Tooltip
									cursor={{ fill: "var(--accent)", opacity: 0.2 }}
									contentStyle={{
										backgroundColor: "var(--card)",
										border: "none",
										borderRadius: "8px",
										boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
									}}
									itemStyle={{ color: "var(--foreground)" }}
								/>
								<Bar
									dataKey="total"
									fill="hsl(var(--primary))"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Updated StatsCard: No Border, Primary Icon Color, Hover Effect
function StatsCard({ title, value, icon: Icon }: any) {
	return (
		<Card className="border-none shadow-md bg-card hover:bg-accent/5 transition-colors">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{title}
				</CardTitle>
				{/* Icon color changed to Primary to match theme */}
				<Icon className="h-4 w-4 text-primary" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
			</CardContent>
		</Card>
	);
}
