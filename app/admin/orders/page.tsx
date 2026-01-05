"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	MoreHorizontal,
	Eye,
	Truck,
	CheckCircle,
	XCircle,
	Clock,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

// Types
type Order = {
	id: string;
	user_name: string;
	email: string;
	total_amount: number;
	status: string;
	created_at: string;
	city: string;
};

type OrderItem = {
	id: string;
	quantity: number;
	price_at_purchase: number;
	product: {
		title: string;
		image_url: string;
	};
};

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);

	// Modal State
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
	const [itemsLoading, setItemsLoading] = useState(false);

	useEffect(() => {
		fetchOrders();
	}, []);

	async function fetchOrders() {
		setLoading(true);
		const { data } = await supabase
			.from("orders")
			.select("*")
			.order("created_at", { ascending: false });

		if (data) setOrders(data);
		setLoading(false);
	}

	// Fetch items for a specific order
	const fetchOrderItems = async (order: Order) => {
		setSelectedOrder(order);
		setItemsLoading(true);

		// Join with Products table to get names/images
		const { data, error } = await supabase
			.from("order_items")
			.select(
				`
        *,
        product:products (title, image_url)
      `
			)
			.eq("order_id", order.id);

		if (data) setOrderItems(data as any);
		setItemsLoading(false);
	};

	// Update Status Logic
	const updateStatus = async (id: string, newStatus: string) => {
		// Optimistic Update (Update UI immediately)
		setOrders(
			orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
		);
		toast.success(`Order marked as ${newStatus}`);

		const { error } = await supabase
			.from("orders")
			.update({ status: newStatus })
			.eq("id", id);

		if (error) {
			toast.error("Failed to update status");
			fetchOrders(); // Revert on error
		}
	};

	// Helper for Status Badge Color
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "Pending":
				return (
					<Badge
						variant="outline"
						className="bg-yellow-500/10 text-yellow-600 border-yellow-200"
					>
						<Clock className="w-3 h-3 mr-1" /> Pending
					</Badge>
				);
			case "Shipped":
				return (
					<Badge
						variant="outline"
						className="bg-blue-500/10 text-blue-600 border-blue-200"
					>
						<Truck className="w-3 h-3 mr-1" /> Shipped
					</Badge>
				);
			case "Delivered":
				return (
					<Badge
						variant="outline"
						className="bg-green-500/10 text-green-600 border-green-200"
					>
						<CheckCircle className="w-3 h-3 mr-1" /> Delivered
					</Badge>
				);
			case "Cancelled":
				return (
					<Badge
						variant="outline"
						className="bg-red-500/10 text-red-600 border-red-200"
					>
						<XCircle className="w-3 h-3 mr-1" /> Cancelled
					</Badge>
				);
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Orders</h1>
					<p className="text-muted-foreground">
						Track and manage customer orders.
					</p>
				</div>
			</div>

			<div className="rounded-xl bg-card/50 backdrop-blur-sm shadow-md overflow-hidden border-none">
				<Table>
					<TableHeader>
						<TableRow className="bg-secondary/50 hover:bg-secondary/50 border-none">
							<TableHead className="w-[100px]">Order ID</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Total</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							[...Array(5)].map((_, i) => (
								<TableRow key={i} className="border-b-0">
									<TableCell>
										<div className="h-4 w-12 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-32 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-24 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-16 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-6 w-20 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell />
								</TableRow>
							))
						) : orders.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-32 text-center text-muted-foreground"
								>
									No orders found.
								</TableCell>
							</TableRow>
						) : (
							orders.map((order) => (
								<TableRow
									key={order.id}
									className="hover:bg-secondary/30 transition-colors border-b-border/30"
								>
									<TableCell className="font-mono text-xs">
										{order.id.slice(0, 8)}...
									</TableCell>
									<TableCell>
										<div className="flex flex-col">
											<span className="font-medium">{order.user_name}</span>
											<span className="text-xs text-muted-foreground">
												{order.city}
											</span>
										</div>
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{new Date(order.created_at).toLocaleDateString()}
									</TableCell>
									<TableCell className="font-medium">
										${order.total_amount.toFixed(2)}
									</TableCell>
									<TableCell>{getStatusBadge(order.status)}</TableCell>

									{/* Actions */}
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="border-none shadow-xl bg-card"
											>
												<DropdownMenuItem
													onClick={() => fetchOrderItems(order)}
												>
													<Eye className="mr-2 h-4 w-4" /> View Details
												</DropdownMenuItem>

												<div className="h-px bg-border my-1" />

												<DropdownMenuItem
													onClick={() => updateStatus(order.id, "Pending")}
												>
													<Clock className="mr-2 h-4 w-4 text-yellow-600" />{" "}
													Mark Pending
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => updateStatus(order.id, "Shipped")}
												>
													<Truck className="mr-2 h-4 w-4 text-blue-600" /> Mark
													Shipped
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => updateStatus(order.id, "Delivered")}
												>
													<CheckCircle className="mr-2 h-4 w-4 text-green-600" />{" "}
													Mark Delivered
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => updateStatus(order.id, "Cancelled")}
													className="text-red-600 focus:text-red-600"
												>
													<XCircle className="mr-2 h-4 w-4" /> Cancel Order
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Order Details Modal */}
			<Dialog
				open={!!selectedOrder}
				onOpenChange={(open) => !open && setSelectedOrder(null)}
			>
				<DialogContent className="max-w-2xl border-none shadow-2xl bg-card">
					<DialogHeader>
						<DialogTitle>
							Order Details{" "}
							<span className="text-muted-foreground font-mono ml-2 text-sm">
								#{selectedOrder?.id.slice(0, 8)}
							</span>
						</DialogTitle>
					</DialogHeader>

					<div className="grid gap-6">
						{/* Customer Info Grid */}
						<div className="grid grid-cols-2 gap-4 p-4 bg-secondary/20 rounded-lg">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Customer
								</p>
								<p className="font-semibold">{selectedOrder?.user_name}</p>
								<p className="text-sm text-muted-foreground">
									{selectedOrder?.email}
								</p>
							</div>
							<div className="text-right">
								<p className="text-sm font-medium text-muted-foreground">
									Total
								</p>
								<p className="text-2xl font-bold text-primary">
									${selectedOrder?.total_amount.toFixed(2)}
								</p>
								<div className="flex justify-end mt-1">
									{selectedOrder && getStatusBadge(selectedOrder.status)}
								</div>
							</div>
						</div>

						{/* Items List */}
						<div className="space-y-4">
							<h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
								Items Ordered
							</h3>
							{itemsLoading ? (
								<div className="space-y-3">
									{[1, 2].map((i) => (
										<div
											key={i}
											className="h-16 bg-secondary/30 rounded-lg animate-pulse"
										/>
									))}
								</div>
							) : (
								<div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
									{orderItems.map((item) => (
										<div
											key={item.id}
											className="flex items-center gap-4 p-3 border rounded-lg hover:bg-secondary/10 transition-colors"
										>
											<div className="h-12 w-12 bg-white rounded border overflow-hidden relative flex-shrink-0">
												{item.product?.image_url && (
													<Image
														src={item.product.image_url}
														alt={item.product.title}
														fill
														className="object-cover"
													/>
												)}
											</div>
											<div className="flex-1">
												<p className="font-medium text-sm line-clamp-1">
													{item.product?.title || "Unknown Product"}
												</p>
												<p className="text-xs text-muted-foreground">
													Qty: {item.quantity} × ${item.price_at_purchase}
												</p>
											</div>
											<div className="font-medium text-sm">
												${(item.quantity * item.price_at_purchase).toFixed(2)}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
