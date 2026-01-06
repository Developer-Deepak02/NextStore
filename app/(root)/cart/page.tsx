"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Trash2,
	Plus,
	Minus,
	ArrowRight,
	ShoppingBag,
	Truck,
	Tag,
	CheckCircle2,
	XCircle,
	AlertCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { validateCoupon } from "@/actions/validate-coupon";

export default function CartPage() {
	const { items, removeItem, updateQuantity } = useCart();
	const { formatCurrency } = useCurrency();

	const [couponCode, setCouponCode] = useState("");
	const [appliedCoupon, setAppliedCoupon] = useState<{
		code: string;
		discount: number;
	} | null>(null);

	const [couponMessage, setCouponMessage] = useState<{
		text: string;
		type: "success" | "error";
	} | null>(null);

	const [isPending, startTransition] = useTransition();

	// 1. Calculate Base Totals
	const subtotal = items.reduce(
		(total, item) => total + item.price * item.quantity,
		0
	);

	// 2. Free Shipping Logic
	const FREE_SHIPPING_THRESHOLD = 1000;
	const progressPercentage = Math.min(
		(subtotal / FREE_SHIPPING_THRESHOLD) * 100,
		100
	);
	const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
	const amountNeeded = FREE_SHIPPING_THRESHOLD - subtotal;
	const shippingCost = isFreeShipping ? 0 : 50;

	// 3. Coupon Handler
	const handleApplyCoupon = () => {
		if (!couponCode) return;
		setCouponMessage(null);

		startTransition(async () => {
			const result = await validateCoupon(couponCode, subtotal);

			if (result.error) {
				setCouponMessage({ text: result.error, type: "error" });
				setAppliedCoupon(null);
			} else {
				setCouponMessage(null);

				// --- 🛡️ SAFETY CHECK: Ensure discount is a valid number ---
				const safeDiscount =
					typeof result.discount === "number" && !isNaN(result.discount)
						? result.discount
						: 0;

				setAppliedCoupon({ code: result.code, discount: safeDiscount });
			}
		});
	};

	const removeCoupon = () => {
		setAppliedCoupon(null);
		setCouponCode("");
		setCouponMessage(null);
	};

	// 4. Final Total Calculation (with NaN Safeguard)
	// Ensure we don't subtract NaN
	const discountAmount =
		appliedCoupon && !isNaN(appliedCoupon.discount)
			? appliedCoupon.discount
			: 0;

	const finalTotal = subtotal - discountAmount + shippingCost;

	if (items.length === 0) {
		return (
			<div className="container flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
				<div className="bg-secondary/20 p-8 rounded-full">
					<ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
				</div>
				<div className="space-y-2">
					<h2 className="text-2xl font-bold tracking-tight">
						Your cart is empty
					</h2>
					<p className="text-muted-foreground">
						Looks like you haven't added anything yet.
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
			<h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
				{/* LEFT COLUMN */}
				<div className="lg:col-span-2 space-y-6">
					{/* Free Shipping Bar */}
					<div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
						<div className="flex items-center gap-3 mb-3">
							<div
								className={`p-2 rounded-full ${
									isFreeShipping
										? "bg-green-500/20 text-green-600"
										: "bg-primary/20 text-primary"
								}`}
							>
								<Truck className="h-5 w-5" />
							</div>
							<div className="flex-1">
								{isFreeShipping ? (
									<p className="text-sm font-semibold text-green-600">
										🎉 You've unlocked{" "}
										<span className="underline">Free Shipping!</span>
									</p>
								) : (
									<p className="text-sm font-medium">
										Add{" "}
										<span className="font-bold text-primary">
											{formatCurrency(amountNeeded)}
										</span>{" "}
										more for{" "}
										<span className="text-primary font-bold">
											Free Shipping 🚚
										</span>
									</p>
								)}
							</div>
						</div>

						<div className="relative h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
							<div
								className={`h-full transition-all duration-1000 ease-out rounded-full ${
									isFreeShipping
										? "bg-green-500"
										: "bg-gradient-to-r from-primary/60 to-primary"
								}`}
								style={{ width: `${progressPercentage}%` }}
							/>
						</div>
					</div>

					{/* Cart Items */}
					<div className="space-y-4">
						{items.map((item) => (
							<div
								key={item.id}
								className="flex gap-4 p-4 rounded-2xl bg-secondary/10 hover:bg-secondary/20 transition-colors"
							>
								<div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-secondary/20">
									{item.image_url && (
										<Image
											src={item.image_url}
											alt={item.title}
											fill
											className="object-cover"
										/>
									)}
								</div>

								<div className="flex flex-1 flex-col justify-between py-1">
									<div className="flex justify-between items-start gap-4">
										<div>
											<h3 className="font-bold text-lg leading-tight">
												{item.title}
											</h3>
											<p className="text-sm text-muted-foreground mt-1">
												Unit Price: {formatCurrency(item.price)}
											</p>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 -mt-2 -mr-2"
											onClick={() => removeItem(item.id)}
										>
											<Trash2 className="h-5 w-5" />
										</Button>
									</div>

									<div className="flex items-end justify-between mt-4">
										<div className="flex items-center bg-background/50 rounded-lg p-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 rounded-md hover:bg-background shadow-sm"
												onClick={() =>
													updateQuantity(item.id, item.quantity - 1)
												}
												disabled={item.quantity <= 1}
											>
												<Minus className="h-3 w-3" />
											</Button>
											<span className="w-8 text-center text-sm font-semibold">
												{item.quantity}
											</span>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 rounded-md hover:bg-background shadow-sm"
												onClick={() =>
													updateQuantity(item.id, item.quantity + 1)
												}
											>
												<Plus className="h-3 w-3" />
											</Button>
										</div>

										<div className="font-bold text-xl text-primary">
											{formatCurrency(item.price * item.quantity)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* RIGHT COLUMN: Summary */}
				<div className="space-y-6">
					<div className="h-fit rounded-2xl bg-secondary/10 p-8">
						<h2 className="text-xl font-bold mb-6">Order Summary</h2>

						<div className="space-y-4 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Subtotal</span>
								<span className="font-medium">{formatCurrency(subtotal)}</span>
							</div>

							{/* Discount Row (Safe Render) */}
							{appliedCoupon && (
								<div className="flex justify-between text-green-500 animate-in fade-in slide-in-from-right-4">
									<span className="flex items-center gap-1 font-medium">
										<Tag className="h-3 w-3" /> Coupon ({appliedCoupon.code})
									</span>
									<span className="font-bold">
										-{formatCurrency(discountAmount)}
									</span>
								</div>
							)}

							<div className="flex justify-between">
								<span className="text-muted-foreground">Shipping</span>
								<span
									className={
										isFreeShipping ? "font-bold text-green-500" : "font-medium"
									}
								>
									{isFreeShipping ? "Free" : formatCurrency(shippingCost)}
								</span>
							</div>
						</div>

						<Separator className="my-6 bg-border/50" />

						<div className="flex justify-between items-end mb-8">
							<span className="text-base font-medium text-muted-foreground">
								Total
							</span>
							<span className="text-3xl font-bold text-primary">
								{formatCurrency(finalTotal)}
							</span>
						</div>

						<Link href="/checkout" className="w-full block">
							<Button
								className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25"
								size="lg"
							>
								Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
							</Button>
						</Link>
					</div>

					{/* Coupon Input */}
					{/* <div className="rounded-2xl border border-border/50 bg-card p-6">
						<h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
							<Tag className="h-4 w-4 text-primary" /> Have a coupon?
						</h3>

						{appliedCoupon ? (
							<div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-lg animate-in fade-in zoom-in-95">
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-green-600" />
									<div>
										<span className="text-sm font-bold text-green-700 block">
											{appliedCoupon.code} Applied!
										</span>
										<span className="text-xs text-green-600/80">
											You saved {formatCurrency(discountAmount)}
										</span>
									</div>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={removeCoupon}
									className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
								>
									<XCircle className="h-5 w-5" />
								</Button>
							</div>
						) : (
							<div className="space-y-3">
								<div className="flex gap-2">
									<Input
										placeholder="ENTER CODE"
										value={couponCode}
										onChange={(e) => {
											const upperValue = e.target.value.toUpperCase();
											setCouponCode(upperValue);
											if (couponMessage) setCouponMessage(null);
										}}
										className="bg-background font-mono uppercase placeholder:normal-case"
										onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
									/>
									<Button
										variant="secondary"
										onClick={handleApplyCoupon}
										disabled={isPending || !couponCode}
									>
										{isPending ? "..." : "Apply"}
									</Button>
								</div>

								{couponMessage?.type === "error" && (
									<div className="flex items-center gap-2 text-xs text-red-500 animate-in slide-in-from-top-1">
										<AlertCircle className="h-3 w-3" />
										<span>{couponMessage.text}</span>
									</div>
								)}
							</div>
						)}
					</div> */}
				</div>
			</div>
		</div>
	);
}
