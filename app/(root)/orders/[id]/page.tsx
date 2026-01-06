import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
	ArrowLeft,
	Calendar,
	CreditCard,
	MapPin,
	Package,
	CheckCircle2,
	Clock,
	Truck,
	ClipboardList,
	Box,
	Banknote,
	AlertCircle,
	Wallet,
	Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Helper for currency
const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format(amount);
};

interface Props {
	params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: Props) {
	const { id } = await params;
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// Fetch Order Data
	const { data: order, error } = await supabase
		.from("orders")
		.select(
			`
      *,
      order_items (
        *,
        products ( title, image_url )
      )
    `
		)
		.eq("id", id)
		.single();

	if (error || !order) {
		console.error("Error fetching order:", error);
		return notFound();
	}

	if (order.user_id !== user.id) {
		return notFound();
	}

	// --- 1. TRACKING LOGIC ---
	const steps = [
		{ id: "placed", label: "Order Placed", icon: ClipboardList },
		{ id: "processing", label: "Processing", icon: Box },
		{ id: "shipped", label: "Shipped", icon: Truck },
		{ id: "delivered", label: "Delivered", icon: CheckCircle2 },
	];

	const getStepIndex = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return 0;
			case "processing":
				return 1;
			case "shipped":
				return 2;
			case "delivered":
				return 3;
			case "cancelled":
				return -1;
			default:
				return 0;
		}
	};

	const currentStep = getStepIndex(order.status);
	const isCancelled = order.status === "cancelled";

	// --- 2. DYNAMIC PAYMENT STATUS LOGIC ---
	// Check if the order was COD (Case insensitive check)
	const isCOD = order.payment_method?.toLowerCase() === "cod";

	return (
		<div className="min-h-screen bg-background pb-20">
			{/* Header */}
			<div className="border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-10">
				<div className="container flex h-16 items-center gap-4 px-4 md:px-6">
					<Link href="/orders">
						<Button
							variant="ghost"
							size="sm"
							className="-ml-2 text-muted-foreground hover:text-primary"
						>
							<ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
						</Button>
					</Link>
					<div className="flex-1 flex justify-end md:justify-start">
						<span className="text-sm text-muted-foreground mr-2 hidden md:inline-block">
							Order ID:
						</span>
						<span className="font-mono text-sm font-bold">
							#{order.id.slice(0, 8)}
						</span>
					</div>
				</div>
			</div>

			<div className="container px-4 md:px-6 py-10">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
						<p className="text-muted-foreground mt-1">
							View your order status and items.
						</p>
					</div>
					{isCancelled ? (
						<Badge variant="destructive" className="px-3 py-1 text-sm">
							Cancelled
						</Badge>
					) : (
						<Badge
							variant="outline"
							className="px-3 py-1 text-sm border-primary/20 bg-primary/5 text-primary"
						>
							{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
						</Badge>
					)}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* LEFT COLUMN */}
					<div className="lg:col-span-2 space-y-6">
						{/* Tracking Section */}
						{!isCancelled && (
							<div className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 p-6 md:p-8">
								<h3 className="font-bold text-lg mb-6 flex items-center gap-2">
									<Truck className="h-5 w-5 text-primary" /> Track Order
								</h3>

								<div className="relative flex justify-between">
									<div className="absolute top-5 left-0 w-full h-1 bg-secondary rounded-full -z-0" />
									<div
										className="absolute top-5 left-0 h-1 bg-primary rounded-full transition-all duration-500 -z-0"
										style={{
											width: `${(currentStep / (steps.length - 1)) * 100}%`,
										}}
									/>
									{steps.map((step, index) => {
										const isCompleted = index <= currentStep;
										const isCurrent = index === currentStep;
										const Icon = step.icon;
										return (
											<div
												key={step.id}
												className="flex flex-col items-center relative z-10"
											>
												<div
													className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${
														isCompleted
															? "bg-primary border-primary text-primary-foreground"
															: "bg-card border-secondary text-muted-foreground"
													} ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
												>
													<Icon className="h-4 w-4" />
												</div>
												<span
													className={`text-xs mt-3 font-medium ${
														isCompleted
															? "text-foreground"
															: "text-muted-foreground"
													}`}
												>
													{step.label}
												</span>
											</div>
										);
									})}
								</div>
							</div>
						)}

						{/* Items Card */}
						<div className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 overflow-hidden">
							<div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between gap-4 bg-secondary/5">
								<div className="space-y-1">
									<p className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
										<Calendar className="h-3.5 w-3.5" /> Date Placed
									</p>
									<p className="font-medium text-sm">
										{format(new Date(order.created_at), "PPP")} at{" "}
										{format(new Date(order.created_at), "p")}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
										<Package className="h-3.5 w-3.5" /> Total Items
									</p>
									<p className="font-medium text-sm">
										{order.order_items?.length || 0} Products
									</p>
								</div>
							</div>

							<div className="p-6">
								<div className="space-y-6">
									{order.order_items && order.order_items.length > 0 ? (
										order.order_items.map((item: any) => (
											<div
												key={item.id}
												className="flex flex-col sm:flex-row gap-4 items-start sm:items-center group"
											>
												<div className="relative h-20 w-20 rounded-lg border border-border/50 bg-secondary/10 overflow-hidden shrink-0">
													{item.products?.image_url ? (
														<Image
															src={item.products.image_url}
															alt={item.products.title}
															fill
															className="object-cover transition-transform group-hover:scale-105"
														/>
													) : (
														<div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
															No Image
														</div>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<h4 className="font-bold text-base truncate">
														{item.products?.title || "Unknown Product"}
													</h4>
													<p className="text-sm text-muted-foreground mt-1 font-medium">
														{formatCurrency(item.price_at_purchase)}{" "}
														<span className="text-xs text-muted-foreground mx-1">
															x
														</span>{" "}
														{item.quantity}
													</p>
												</div>
												<div className="font-bold text-lg text-right">
													{formatCurrency(
														item.price_at_purchase * item.quantity
													)}
												</div>
											</div>
										))
									) : (
										<div className="text-center py-12 text-muted-foreground">
											No items found.
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* RIGHT COLUMN */}
					<div className="space-y-6">
						{/* Shipping Card */}
						<div className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 p-6">
							<h3 className="font-bold text-lg mb-4 flex items-center gap-2">
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
									<MapPin className="h-4 w-4" />
								</span>
								Shipping Details
							</h3>
							<div className="space-y-4 text-sm">
								<div className="p-3 rounded-lg bg-secondary/10 border border-border/50">
									<p className="text-xs font-bold text-muted-foreground uppercase mb-1">
										Deliver To
									</p>
									<p className="font-semibold text-base">{order.user_name}</p>
									<p className="text-muted-foreground mt-1">{order.email}</p>
								</div>
								<div className="p-3 rounded-lg bg-secondary/10 border border-border/50">
									<p className="text-xs font-bold text-muted-foreground uppercase mb-1">
										Address
									</p>
									<p className="text-foreground">{order.address}</p>
									<p className="text-foreground">
										{order.city}, {order.zip_code}
									</p>
								</div>
							</div>
						</div>

						{/* Payment Summary Card */}
						<div className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 p-6">
							<h3 className="font-bold text-lg mb-4 flex items-center gap-2">
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
									<CreditCard className="h-4 w-4" />
								</span>
								Payment Summary
							</h3>

							<div className="space-y-3 pt-2">
								{/* Dynamic Subtotal */}
								<div className="flex justify-between items-center text-sm">
									<span className="text-muted-foreground">Subtotal</span>
									<span className="font-medium">
										{formatCurrency(
											order.order_items.reduce(
												(acc, item) =>
													acc + item.price_at_purchase * item.quantity,
												0
											)
										)}
									</span>
								</div>

								{/* Dynamic Shipping */}
								<div className="flex justify-between items-center text-sm">
									<span className="text-muted-foreground">Shipping</span>
									<span
										className={
											order.total_amount >= 1000
												? "text-green-500 font-medium"
												: "font-medium"
										}
									>
										{order.total_amount >= 1000 ? "Free" : formatCurrency(50)}
									</span>
								</div>

								{/* Dynamic Discount - Only shows if a coupon was used */}
								{order.total_amount <
									order.order_items.reduce(
										(acc, item) => acc + item.price_at_purchase * item.quantity,
										0
									) && (
									<div className="flex justify-between items-center text-sm text-green-500">
										<span className="font-medium flex items-center gap-1">
											<Tag className="h-3 w-3" /> Discount
										</span>
										<span>
											-
											{formatCurrency(
												order.order_items.reduce(
													(acc, item) =>
														acc + item.price_at_purchase * item.quantity,
													0
												) +
													(order.total_amount >= 1000 ? 0 : 50) -
													order.total_amount
											)}
										</span>
									</div>
								)}

								<Separator className="my-2 border-border/50" />

								<div className="flex justify-between items-end">
									<span className="font-bold text-base">Total Paid</span>
									<span className="font-bold text-2xl text-primary">
										{formatCurrency(order.total_amount)}
									</span>
								</div>
							</div>

							{/* Dynamic Payment Status UI */}
							{order.payment_method?.toLowerCase() === "cod" ? (
								<div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 py-2.5 rounded-md">
									<AlertCircle className="h-3.5 w-3.5" />
									Payment Pending (Cash on Delivery)
								</div>
							) : (
								<div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20 py-2.5 rounded-md">
									<CheckCircle2 className="h-3.5 w-3.5" />
									Payment Successful
								</div>
							)}

							{/* Payment Method Details */}
							<div className="mt-3 text-center">
								<p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">
									Payment Method
								</p>
								<div className="flex items-center justify-center gap-2 text-sm font-medium">
									{order.payment_method?.toLowerCase() === "cod" ? (
										<Banknote className="h-4 w-4" />
									) : (
										<Wallet className="h-4 w-4" />
									)}
									{order.payment_method === "upi"
										? "UPI / Wallet"
										: order.payment_method === "cod"
										? "Cash on Delivery"
										: "Credit / Debit Card"}
								</div>
							</div>
						</div>

						<div className="text-center">
							<p className="text-xs text-muted-foreground">
								Need help with this order?
							</p>
							<Link
								href="/contact"
								className="text-xs text-primary font-medium hover:underline"
							>
								Contact Support
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
