"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
	ShoppingBag,
	IndianRupee,
	Clock,
	AlertTriangle,
	BarChart3,
	PieChart as PieIcon,
	LineChart as LineIcon,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
} from "recharts";

export default function AdminDashboard() {
	const supabase = createClient();

	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		revenue: 0,
		orders: 0,
		pending: 0,
		lowStock: 0,
	});

	const [revenueData, setRevenueData] = useState<any[]>([]);
	const [statusData, setStatusData] = useState<any[]>([]);
	const [topProducts, setTopProducts] = useState<any[]>([]);

	useEffect(() => {
		const fetchAnalytics = async () => {
			setLoading(true);
			try {
				/* -------------------- ORDERS -------------------- */
				const { data: orders, error: ordersError } = await supabase
					.from("orders")
					.select("id, total_amount, status, created_at");

				if (ordersError) throw ordersError;

				/* -------------------- LOW STOCK -------------------- */
				const { count: lowStockCount } = await supabase
					.from("products")
					.select("*", { count: "exact", head: true })
					.lt("stock", 5);

				/* -------------------- REVENUE (LAST 7 DAYS) -------------------- */
				const today = new Date();
				const last7Days = [...Array(7)].map((_, i) => {
					const d = new Date(today);
					d.setDate(d.getDate() - (6 - i));
					return d.toISOString().slice(0, 10);
				});

				const revenueMap: Record<string, number> = {};
				last7Days.forEach((d) => (revenueMap[d] = 0));

				orders?.forEach((order) => {
					const day = order.created_at.slice(0, 10);
					if (revenueMap[day] !== undefined) {
						revenueMap[day] += order.total_amount;
					}
				});

				setRevenueData(
					last7Days.map((d) => ({
						name: new Date(d).toLocaleDateString("en-IN", {
							weekday: "short",
						}),
						revenue: revenueMap[d],
					}))
				);

				/* -------------------- ORDER STATUS -------------------- */
				const statusCount = orders?.reduce((acc: any, o) => {
					acc[o.status] = (acc[o.status] || 0) + 1;
					return acc;
				}, {});

				setStatusData([
					{ name: "Processing", value: statusCount?.processing || 0, color: "#3b82f6" },
					{ name: "Shipped", value: statusCount?.shipped || 0, color: "#8b5cf6" },
					{ name: "Delivered", value: statusCount?.delivered || 0, color: "#10b981" },
					{ name: "Cancelled", value: statusCount?.cancelled || 0, color: "#ef4444" },
				]);

				/* -------------------- TOP SELLING PRODUCTS  -------------------- */
				const { data: items, error: itemsError } = await supabase
					.from("order_items")
					.select(`
						quantity,
						product_id,
						orders!inner(status),
						products!inner(title)
					`);

				if (itemsError) throw itemsError;

				const salesMap: Record<
					string,
					{ name: string; sales: number }
				> = {};

				items?.forEach((item: any) => {
					if (item.orders.status === "cancelled") return;

					const id = item.product_id;
					const title = item.products.title;

					if (!salesMap[id]) {
						salesMap[id] = { name: title, sales: 0 };
					}

					salesMap[id].sales += item.quantity;
				});

				setTopProducts(
					Object.values(salesMap)
						.sort((a, b) => b.sales - a.sales)
						.slice(0, 5)
				);

				/* -------------------- STATS -------------------- */
				setStats({
					revenue: orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0,
					orders: orders?.length || 0,
					pending: orders?.filter((o) => o.status === "processing").length || 0,
					lowStock: lowStockCount || 0,
				});
			} catch (err) {
				console.error(err);
				toast.error("Analytics sync failed");
			} finally {
				setLoading(false);
			}
		};

		fetchAnalytics();

		/* -------- REALTIME AUTO REFRESH -------- */
		const channel = supabase
			.channel("dashboard-realtime")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "orders" },
				fetchAnalytics
			)
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "order_items" },
				fetchAnalytics
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	const statCards = [
		{
			title: "Total Revenue",
			value: `₹${stats.revenue.toLocaleString()}`,
			icon: IndianRupee,
			color: "text-green-500",
			bg: "bg-green-500/10",
		},
		{
			title: "Total Orders",
			value: stats.orders,
			icon: ShoppingBag,
			color: "text-blue-500",
			bg: "bg-blue-500/10",
		},
		{
			title: "Pending Orders",
			value: stats.pending,
			icon: Clock,
			color: "text-yellow-500",
			bg: "bg-yellow-500/10",
		},
		{
			title: "Low Stock Items",
			value: stats.lowStock,
			icon: AlertTriangle,
			color: "text-red-500",
			bg: "bg-red-500/10",
		},
	];

	return (
		<div className="p-6 lg:p-10 space-y-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Dashboard Overview
				</h1>
				<p className="text-muted-foreground mt-1">
					Actionable insights and store performance.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((stat, idx) => (
					<Card
						key={idx}
						className="border-border/20 bg-card shadow-xl shadow-black/5"
					>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
								{stat.title}
							</CardTitle>
							<div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
								<stat.icon className="h-4 w-4" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{loading ? "..." : stat.value}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* 1. Revenue Over Time (Line Chart) */}
				<Card className="lg:col-span-8 border-border/20 bg-card shadow-xl shadow-black/5">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<LineIcon className="h-4 w-4 text-primary" /> Revenue Trend
						</CardTitle>
						<CardDescription>
							Daily revenue fluctuations over the last 7 days
						</CardDescription>
					</CardHeader>
					<CardContent className="h-[350px] w-full pt-4">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={revenueData}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#334155"
									vertical={false}
								/>
								<XAxis
									dataKey="name"
									stroke="#94a3b8"
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									stroke="#94a3b8"
									fontSize={12}
									tickLine={false}
									axisLine={false}
									tickFormatter={(value) => `₹${value}`}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: "#1e293b",
										border: "1px solid #334155",
										borderRadius: "8px",
									}}
									itemStyle={{ color: "#6366f1", fontWeight: "bold" }}
								/>
								<Line
									type="monotone"
									dataKey="revenue"
									stroke="#6366f1"
									strokeWidth={3}
									dot={{ r: 4, fill: "#6366f1" }}
									activeDot={{ r: 6 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* 2. Order Status Breakdown (Donut Chart) */}
				<Card className="lg:col-span-4 border-border/20 bg-card shadow-xl shadow-black/5">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<PieIcon className="h-4 w-4 text-primary" /> Order Status
						</CardTitle>
						<CardDescription>Distribution of current orders</CardDescription>
					</CardHeader>
					<CardContent className="h-[350px] flex flex-col items-center justify-center">
						<ResponsiveContainer width="100%" height="80%">
							<PieChart>
								<Pie
									data={statusData}
									innerRadius={70}
									outerRadius={90}
									paddingAngle={5}
									dataKey="value"
								>
									{statusData.map((entry: any, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
						<div className="grid grid-cols-2 gap-2 w-full mt-4">
							{statusData.map((item: any) => (
								<div
									key={item.name}
									className="flex items-center gap-2 text-xs text-muted-foreground"
								>
									<div
										className="h-2 w-2 rounded-full"
										style={{ backgroundColor: item.color }}
									/>
									{item.name}:{" "}
									<span className="text-foreground font-bold">
										{item.value}
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* 3. Top Selling Products (Bar Chart) */}
				<Card className="lg:col-span-12 border-border/20 bg-card shadow-xl shadow-black/5">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<BarChart3 className="h-4 w-4 text-primary" /> Top Selling
							Products
						</CardTitle>
						<CardDescription>Units sold per product</CardDescription>
					</CardHeader>
					<CardContent className="h-[300px] pt-4">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={topProducts}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#334155"
									vertical={false}
								/>
								<XAxis
									dataKey="name"
									stroke="#94a3b8"
									fontSize={10}
									tickLine={false}
									axisLine={false}
									interval={0}
								/>
								<YAxis
									stroke="#94a3b8"
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<Tooltip
									cursor={{ fill: "#334155", opacity: 0.4 }}
									contentStyle={{
										backgroundColor: "#1e293b",
										border: "1px solid #334155",
									}}
								/>
								<Bar
									dataKey="sales"
									fill="#8b5cf6"
									radius={[4, 4, 0, 0]}
									barSize={40}
								/>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
