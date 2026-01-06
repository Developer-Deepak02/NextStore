"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Package, ShoppingBag } from "lucide-react";

export default function SuccessPage() {
	// Generate a random order ID for display
	const orderId =
		"ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();

	return (
		<div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-500">
			{/* Success Icon */}
			<div className="mb-8 relative">
				<div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full animate-pulse" />
				<div className="relative bg-background rounded-full p-4 shadow-2xl shadow-green-500/30">
					<CheckCircle2 className="h-20 w-20 text-green-500 animate-in zoom-in spin-in-12 duration-700" />
				</div>
			</div>

			{/* Main Heading */}
			<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
				Order Placed Successfully! 🎉
			</h1>

			<p className="text-muted-foreground max-w-md mx-auto text-lg mb-8">
				Thank you for your purchase. We've received your order and will begin
				processing it right away.
			</p>

			{/* Order Details Card */}
			<div className="w-full max-w-sm bg-secondary/10 border border-border/50 rounded-2xl p-6 mb-8 backdrop-blur-sm">
				<div className="flex justify-between items-center mb-4 pb-4 border-b border-border/50">
					<span className="text-muted-foreground text-sm">Order Number</span>
					<span className="font-mono font-bold text-primary">{orderId}</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-muted-foreground text-sm">
						Estimated Delivery
					</span>
					<span className="font-medium">3-5 Business Days</span>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
				<Link href="/orders" className="flex-1">
					<Button
						variant="outline"
						className="w-full h-12 border-primary/20 hover:border-primary hover:bg-primary/5"
					>
						<Package className="mr-2 h-4 w-4" /> View Order
					</Button>
				</Link>
				<Link href="/products" className="flex-1">
					<Button className="w-full h-12 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-semibold">
						Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</Link>
			</div>
		</div>
	);
}
