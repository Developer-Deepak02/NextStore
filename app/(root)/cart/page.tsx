"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
	const { items, removeItem, updateQuantity } = useCart();

	// Calculate Subtotal
	const subtotal = items.reduce(
		(total, item) => total + item.price * item.quantity,
		0
	);
	const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
	const total = subtotal + shipping;

	if (items.length === 0) {
		return (
			<div className="container flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
				<div className="bg-secondary/30 p-6 rounded-full">
					<Trash2 className="h-12 w-12 text-muted-foreground" />
				</div>
				<h2 className="text-2xl font-bold tracking-tight">
					Your cart is empty
				</h2>
				<p className="text-muted-foreground">
					Looks like you haven't added anything yet.
				</p>
				<Link href="/products">
					<Button size="lg" className="mt-4">
						Start Shopping
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="container py-10">
			<h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
				{/* Cart Items List */}
				<div className="lg:col-span-2 space-y-6">
					{items.map((item) => (
						<div
							key={item.id}
							className="flex gap-4 p-4 border rounded-lg bg-card shadow-sm transition-all hover:border-primary/20"
						>
							{/* Image */}
							<div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-secondary/20">
								{item.image_url && (
									<Image
										src={item.image_url}
										alt={item.title}
										fill
										className="object-cover"
									/>
								)}
							</div>

							{/* Details */}
							<div className="flex flex-1 flex-col justify-between">
								<div className="flex justify-between">
									<div>
										<h3 className="font-semibold">{item.title}</h3>
										<p className="text-sm text-muted-foreground">
											Unit Price: ${item.price}
										</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => removeItem(item.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>

								{/* Quantity Controls */}
								<div className="flex items-center gap-3">
									<div className="flex items-center border rounded-md">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-none"
											onClick={() => updateQuantity(item.id, item.quantity - 1)}
											disabled={item.quantity <= 1}
										>
											<Minus className="h-3 w-3" />
										</Button>
										<span className="w-8 text-center text-sm font-medium">
											{item.quantity}
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-none"
											onClick={() => updateQuantity(item.id, item.quantity + 1)}
										>
											<Plus className="h-3 w-3" />
										</Button>
									</div>
									<div className="ml-auto font-bold text-lg">
										${(item.price * item.quantity).toFixed(2)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Order Summary */}
				<div className="h-fit rounded-lg border bg-card p-6 shadow-sm">
					<h2 className="text-lg font-semibold mb-4">Order Summary</h2>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Subtotal</span>
							<span>${subtotal.toFixed(2)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Shipping</span>
							<span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
						</div>
					</div>
					<Separator className="my-4" />
					<div className="flex justify-between font-bold text-lg">
						<span>Total</span>
						<span className="text-primary">${total.toFixed(2)}</span>
					</div>
					<Link href="/checkout" className="w-full block mt-6">
						<Button className="w-full" size="lg">
							Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
