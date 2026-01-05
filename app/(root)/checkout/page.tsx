"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useCart } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react"; // Added Lock icon

const checkoutSchema = z.object({
	name: z.string().min(2, "Name is required"),
	email: z.string().email("Invalid email address"),
	address: z.string().min(5, "Address is required"),
	city: z.string().min(2, "City is required"),
	zip: z.string().min(4, "ZIP code is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
	const router = useRouter();
	const { items, clearCart } = useCart();
	const [loading, setLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	// NEW: Maintenance State
	const [isMaintenance, setIsMaintenance] = useState(false);
	const [checkingMaintenance, setCheckingMaintenance] = useState(true);

	// Calculate Total
	const subtotal = items.reduce(
		(total, item) => total + item.price * item.quantity,
		0
	);
	const shipping = subtotal > 100 ? 0 : 15;
	const total = subtotal + shipping;

	const form = useForm<CheckoutFormValues>({
		resolver: zodResolver(checkoutSchema),
	});

	// 1. Check Maintenance Mode & Cart Status
	useEffect(() => {
		async function checkSettings() {
			const { data } = await supabase
				.from("settings")
				.select("value")
				.eq("key", "maintenance_mode")
				.single();

			if (data && data.value === "true") {
				setIsMaintenance(true);
			}
			setCheckingMaintenance(false);
		}
		checkSettings();

		if (items.length === 0 && !isSuccess) {
			router.push("/cart");
		}
	}, [items, isSuccess, router]);

	const onSubmit = async (data: CheckoutFormValues) => {
		if (items.length === 0) return;
		setLoading(true);

		try {
			// 1. Create Order
			const { data: order, error: orderError } = await supabase
				.from("orders")
				.insert({
					user_name: data.name,
					email: data.email,
					address: data.address,
					city: data.city,
					zip_code: data.zip,
					total_amount: total,
					status: "Pending",
				})
				.select()
				.single();

			if (orderError) throw orderError;

			// 2. Create Items
			const orderItems = items.map((item) => ({
				order_id: order.id,
				product_id: item.id,
				quantity: item.quantity,
				price_at_purchase: item.price,
			}));

			const { error: itemsError } = await supabase
				.from("order_items")
				.insert(orderItems);

			if (itemsError) throw itemsError;

			// 3. Success Sequence
			setIsSuccess(true);
			clearCart();
			router.push(`/order-confirmed?orderId=${order.id}`);
		} catch (error: any) {
			console.error("Checkout Error:", error);
			alert("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// 2. Render Loading State
	if (checkingMaintenance) {
		return (
			<div className="h-[60vh] flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	// 3. Render Maintenance Block (If Enabled)
	if (isMaintenance) {
		return (
			<div className="container py-20 flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto">
				<div className="h-24 w-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
					<Lock className="h-10 w-10 text-red-600" />
				</div>
				<h1 className="text-3xl font-bold tracking-tight">
					Checkout is Disabled
				</h1>
				<p className="text-muted-foreground text-lg">
					Our store is currently undergoing scheduled maintenance. We are not
					accepting new orders at this moment. Please check back in a few
					minutes!
				</p>
				<Button variant="outline" onClick={() => router.push("/")}>
					Return Home
				</Button>
			</div>
		);
	}

	if (items.length === 0 && !isSuccess) {
		return null;
	}

	return (
		<div className="container py-10 max-w-4xl">
			<h1 className="text-3xl font-bold mb-8">Checkout</h1>
			{/* ... (Rest of your checkout UI remains exactly the same) ... */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
				<div className="space-y-6">
					<h2 className="text-xl font-semibold">Shipping Information</h2>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								{...form.register("name")}
								placeholder="John Doe"
							/>
							{form.formState.errors.name && (
								<p className="text-sm text-destructive">
									{form.formState.errors.name.message}
								</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								{...form.register("email")}
								placeholder="john@example.com"
							/>
							{form.formState.errors.email && (
								<p className="text-sm text-destructive">
									{form.formState.errors.email.message}
								</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="address">Address</Label>
							<Input
								id="address"
								{...form.register("address")}
								placeholder="123 Main St"
							/>
							{form.formState.errors.address && (
								<p className="text-sm text-destructive">
									{form.formState.errors.address.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="city">City</Label>
								<Input
									id="city"
									{...form.register("city")}
									placeholder="New York"
								/>
								{form.formState.errors.city && (
									<p className="text-sm text-destructive">
										{form.formState.errors.city.message}
									</p>
								)}
							</div>
							<div className="grid gap-2">
								<Label htmlFor="zip">ZIP Code</Label>
								<Input id="zip" {...form.register("zip")} placeholder="10001" />
								{form.formState.errors.zip && (
									<p className="text-sm text-destructive">
										{form.formState.errors.zip.message}
									</p>
								)}
							</div>
						</div>

						<Button
							type="submit"
							className="w-full mt-6"
							size="lg"
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
									Processing...
								</>
							) : (
								`Place Order ($${total.toFixed(2)})`
							)}
						</Button>
					</form>
				</div>

				{/* Order Summary */}
				<div className="bg-secondary/20 p-6 rounded-lg h-fit border">
					<h2 className="text-xl font-semibold mb-4">Your Order</h2>
					<div className="space-y-4 max-h-[400px] overflow-auto pr-2">
						{items.map((item) => (
							<div key={item.id} className="flex gap-4 text-sm">
								<div className="h-12 w-12 bg-white rounded border overflow-hidden relative flex-shrink-0">
									{item.image_url && (
										<Image
											src={item.image_url}
											alt={item.title}
											fill
											className="object-cover"
										/>
									)}
								</div>
								<div className="flex-1">
									<p className="font-medium">{item.title}</p>
									<p className="text-muted-foreground">Qty: {item.quantity}</p>
								</div>
								<div className="font-medium">
									${(item.price * item.quantity).toFixed(2)}
								</div>
							</div>
						))}
					</div>
					<div className="border-t border-border mt-6 pt-4 space-y-2">
						<div className="flex justify-between font-bold text-lg">
							<span>Total</span>
							<span>${total.toFixed(2)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
