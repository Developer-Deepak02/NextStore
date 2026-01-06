"use client";

import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Package,
	Truck,
	CheckCircle2,
	Clock,
	ChevronRight,
	ShoppingBag,
	XCircle,
} from "lucide-react";

// Define the shape of the data coming from Supabase
interface OrderItem {
	id: string;
	quantity: number;
	product: {
		title: string;
		image_url: string | null;
	} | null;
}

interface Order {
	id: string;
	created_at: string;
	status: string;
	total_amount: number;
	order_items: OrderItem[];
}

export default function OrderList({ orders }: { orders: Order[] }) {
	const { formatCurrency } = useCurrency();

	// Helper for Status Colors
	const getStatusColor = (status: string) => {
		const s = status.toLowerCase();
		if (s === "delivered")
			return "bg-green-500/15 text-green-500 border-green-500/20";
		if (s === "shipped")
			return "bg-blue-500/15 text-blue-500 border-blue-500/20";
		if (s === "processing")
			return "bg-yellow-500/15 text-yellow-500 border-yellow-500/20";
		if (s === "cancelled")
			return "bg-red-500/15 text-red-500 border-red-500/20";
		return "bg-secondary text-muted-foreground";
	};

	const getStatusIcon = (status: string) => {
		const s = status.toLowerCase();
		if (s === "delivered") return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
		if (s === "shipped") return <Truck className="h-3.5 w-3.5 mr-1" />;
		if (s === "processing") return <Clock className="h-3.5 w-3.5 mr-1" />;
		if (s === "cancelled") return <XCircle className="h-3.5 w-3.5 mr-1" />;
		return null;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	if (orders.length === 0) {
		return (
			<div className="container flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
				<div className="bg-secondary/20 p-8 rounded-full">
					<Package className="h-12 w-12 text-muted-foreground/50" />
				</div>
				<div className="space-y-2">
					<h2 className="text-2xl font-bold tracking-tight">No orders yet</h2>
					<p className="text-muted-foreground">
						Start shopping to see your orders here.
					</p>
				</div>
				<Link href="/products">
					<Button size="lg" className="mt-4 px-8">
						Start Shopping
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="container px-4 md:px-6 py-12">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
				<Link href="/products">
					<Button variant="outline" size="sm" className="hidden sm:flex">
						<ShoppingBag className="mr-2 h-4 w-4" /> Continue Shopping
					</Button>
				</Link>
			</div>

			<div className="space-y-6">
				{orders.map((order) => (
					<div
						key={order.id}
						className="group rounded-2xl border border-border/40 bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
					>
						{/* Order Header */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/40">
							<div className="space-y-1">
								<div className="flex items-center gap-3">
									<span className="font-bold text-lg font-mono">
										#{order.id.slice(0, 8).toUpperCase()}
									</span>
									<Badge
										variant="outline"
										className={getStatusColor(order.status)}
									>
										{getStatusIcon(order.status)}
										{order.status.charAt(0).toUpperCase() +
											order.status.slice(1)}
									</Badge>
								</div>
								<p className="text-sm text-muted-foreground">
									Placed on {formatDate(order.created_at)}
								</p>
							</div>
							<div className="text-left sm:text-right">
								<p className="text-sm text-muted-foreground">Total Amount</p>
								<p className="text-xl font-bold text-primary">
									{formatCurrency(order.total_amount)}
								</p>
							</div>
						</div>

						{/* Order Items & Action */}
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
							{/* Item Previews */}
							<div className="flex -space-x-3 overflow-hidden">
								{order.order_items.map((item, i) => (
									<div
										key={item.id}
										className="relative h-12 w-12 rounded-full border-2 border-background bg-secondary/20 overflow-hidden ring-1 ring-border/50"
									>
										{item.product?.image_url ? (
											<Image
												src={item.product.image_url}
												alt="Product"
												fill
												className="object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center bg-secondary text-xs text-muted-foreground font-medium">
												{item.product?.title?.charAt(0) || "?"}
											</div>
										)}
									</div>
								))}
								{order.order_items.length > 0 &&
									order.order_items[0].product && (
										<div className="flex h-12 items-center px-3 text-sm font-medium text-muted-foreground">
											{order.order_items.length === 1
												? order.order_items[0].product.title
												: `${order.order_items[0].product.title} +${
														order.order_items.length - 1
												  } more`}
										</div>
									)}
							</div>

							{/* View Details Button */}
							{/* Note: Update the link if you create a specific order details page */}
							<Link href={`/orders/${order.id}`} className="w-full sm:w-auto">
								<Button
									variant="secondary"
									className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
								>
									View Details <ChevronRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
