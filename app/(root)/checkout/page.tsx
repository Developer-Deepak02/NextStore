"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/hooks/use-currency";
import { validateCoupon } from "@/actions/validate-coupon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase";
import {
	ArrowLeft,
	ShieldCheck,
	Lock,
	CreditCard,
	Wallet,
	Banknote,
	Loader2,
	Tag,
	CheckCircle2,
	AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
	const router = useRouter();

	// 1. Hook Declarations
	const cart = useCart();
	const clearCart =
		cart.clearCart ||
		cart.removeAll ||
		(() => console.warn("No clear function"));

	const { items, coupon, applyCoupon, removeCoupon } = cart;
	const { formatCurrency } = useCurrency();
	const [isPending, startTransition] = useTransition();
	const [isMounted, setIsMounted] = useState(false);

	// Form State
	const [formData, setFormData] = useState({
		email: "",
		firstName: "",
		lastName: "",
		address: "",
		city: "",
		zip: "",
		country: "India",
	});

	const [paymentMethod, setPaymentMethod] = useState("card");
	const [couponInput, setCouponInput] = useState("");
	const [couponMessage, setCouponMessage] = useState<{
		text: string;
		type: "success" | "error";
	} | null>(null);

	// 2. Effects
	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (coupon) {
			setCouponInput(coupon.code);
		}
	}, [coupon]);

	// ---  FETCH USER PROFILE DATA ---
	useEffect(() => {
		const fetchUserProfile = async () => {
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				// 1. Fetch from 'users' table
				const { data: profile } = await supabase
					.from("users")
					.select("*")
					.eq("id", user.id)
					.single();

				if (profile) {
					// Split full name into First/Last for the checkout form
					const nameParts = (profile.full_name || "").split(" ");
					const firstName = nameParts[0] || "";
					const lastName = nameParts.slice(1).join(" ") || "";

					setFormData((prev) => ({
						...prev,
						email: user.email || "",
						firstName: firstName,
						lastName: lastName,
						address: profile.address || "",
						city: profile.city || "",
						zip: profile.zip_code || "",
						country: profile.country || "India",
					}));

					
				} else {
					// Fallback: just pre-fill email if profile is empty
					setFormData((prev) => ({ ...prev, email: user.email || "" }));
				}
			}
		};

		fetchUserProfile();
	}, []);
	// -------------------------------------

	// Calculations
	const subtotal = items.reduce(
		(total, item) => total + Number(item.price) * (item.quantity || 1),
		0
	);
	const FREE_SHIPPING_THRESHOLD = 1000;
	const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
	const shippingCost = isFreeShipping ? 0 : 50;

	const discountAmount =
		coupon && !isNaN(coupon.discount) ? coupon.discount : 0;
	const total = Math.max(0, subtotal - discountAmount + shippingCost);

	// Handlers
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleApplyCoupon = () => {
		if (!couponInput) return;
		setCouponMessage(null);

		startTransition(async () => {
			// Safety check for store updates
			if (!applyCoupon) {
				toast.error("Please update hooks/use-cart.ts to enable coupons.");
				return;
			}

			const result = await validateCoupon(couponInput, subtotal);
			if (result.error) {
				setCouponMessage({ text: result.error, type: "error" });
				clearCart();
				if (removeCoupon) removeCoupon();
			} else {
				setCouponMessage(null);
				applyCoupon({
					code: result.code,
					discount: typeof result.discount === "number" ? result.discount : 0,
				});
			}
		});
	};

	const handlePlaceOrder = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.email || !formData.address || !formData.firstName) {
			toast.error("Please fill in all required fields.");
			return;
		}

		startTransition(async () => {
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				toast.error("You must be logged in to place an order.");
				return;
			}

			// 1. Insert Order
			const { data: orderData, error: orderError } = await supabase
				.from("orders")
				.insert({
					user_id: user.id,
					email: formData.email,
					user_name: `${formData.firstName} ${formData.lastName}`,
					address: formData.address,
					city: formData.city,
					zip_code: formData.zip,
					total_amount: total,
					status: "processing",
					payment_method: paymentMethod,
					coupon_code: coupon?.code ?? null,
				})

				.select()
				.single();

			if (orderError || !orderData) {
				console.error("Order insertion error:", orderError);
				toast.error(`Failed to place order: ${orderError.message}`);
				return;
			}

			// 2. Insert Items
			const orderItemsData = items.map((item) => ({
				order_id: orderData.id,
				product_id: item.id,
				quantity: item.quantity,
				price_at_purchase: item.price,
			}));

			const { error: itemsError } = await supabase
				.from("order_items")
				.insert(orderItemsData);

			if (itemsError) {
				console.error("FULL ERROR:", JSON.stringify(itemsError, null, 2));
				toast.error(`Error saving items: ${itemsError.message}`);
				return;
			}

			toast.success("Order placed successfully! 🎉");
			clearCart();
			router.refresh();
			router.push(`/orders/${orderData.id}`);
		});
	};

	if (!isMounted) return null;

	if (items.length === 0) {
		return (
			<div className="container flex flex-col items-center justify-center min-h-[60vh] text-center">
				<h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
				<Link href="/products">
					<Button>Continue Shopping</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background pb-20">
			<div className="border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-10">
				<div className="container flex h-16 items-center justify-between px-4 md:px-6">
					<Link
						href="/cart"
						className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
					>
						<ArrowLeft className="h-4 w-4" /> Back to Cart
					</Link>
					<div className="flex items-center gap-2 font-semibold">
						<ShieldCheck className="h-5 w-5 text-green-500" /> Secure Checkout
					</div>
				</div>
			</div>

			<div className="container px-4 md:px-6 py-10">
				<form
					onSubmit={handlePlaceOrder}
					className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16"
				>
					{/* LEFT COLUMN: Forms */}
					<div className="lg:col-span-7 space-y-10">
						{/* Contact Info */}
						<section>
							<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
								<span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
									1
								</span>
								Contact Information
							</h2>
							<div className="grid gap-4">
								<div className="space-y-2">
									<Label htmlFor="email">Email Address</Label>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="john@example.com"
										required
										value={formData.email}
										onChange={handleInputChange}
										className="bg-secondary/10 border-border/50 h-11"
									/>
								</div>
							</div>
						</section>

						{/* Shipping Address */}
						<section>
							<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
								<span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
									2
								</span>
								Shipping Address
							</h2>
							<div className="grid gap-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="firstName">First Name</Label>
										<Input
											id="firstName"
											name="firstName"
											placeholder="John"
											required
											value={formData.firstName}
											onChange={handleInputChange}
											className="bg-secondary/10 border-border/50 h-11"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="lastName">Last Name</Label>
										<Input
											id="lastName"
											name="lastName"
											placeholder="Doe"
											required
											value={formData.lastName}
											onChange={handleInputChange}
											className="bg-secondary/10 border-border/50 h-11"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="address">Address</Label>
									<Input
										id="address"
										name="address"
										placeholder="123 Main St"
										required
										value={formData.address}
										onChange={handleInputChange}
										className="bg-secondary/10 border-border/50 h-11"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="city">City</Label>
										<Input
											id="city"
											name="city"
											placeholder="New York"
											required
											value={formData.city}
											onChange={handleInputChange}
											className="bg-secondary/10 border-border/50 h-11"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="zip">ZIP Code</Label>
										<Input
											id="zip"
											name="zip"
											placeholder="10001"
											required
											value={formData.zip}
											onChange={handleInputChange}
											className="bg-secondary/10 border-border/50 h-11"
										/>
									</div>
								</div>
							</div>
						</section>

						{/* Payment Method */}
						<section>
							<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
								<span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
									3
								</span>
								Payment Method
							</h2>
							<RadioGroup
								defaultValue="card"
								onValueChange={setPaymentMethod}
								className="grid grid-cols-1 gap-4"
							>
								<div
									className={`relative flex items-center justify-between rounded-xl border-2 p-4 transition-all cursor-pointer ${
										paymentMethod === "card"
											? "border-primary bg-primary/5"
											: "border-border/50 hover:border-primary/50"
									}`}
								>
									<RadioGroupItem
										value="card"
										id="card"
										className="absolute left-4 top-1/2 -translate-y-1/2"
									/>
									<Label
										htmlFor="card"
										className="flex flex-1 items-center justify-between pl-8 cursor-pointer"
									>
										<span className="flex items-center gap-3 font-medium">
											<CreditCard className="h-5 w-5 text-primary" /> Credit /
											Debit Card
										</span>
									</Label>
								</div>
								{/* UPI Option */}
								<div
									className={`relative flex items-center justify-between rounded-xl border-2 p-4 transition-all cursor-pointer ${
										paymentMethod === "upi"
											? "border-primary bg-primary/5"
											: "border-border/50 hover:border-primary/50"
									}`}
								>
									<RadioGroupItem
										value="upi"
										id="upi"
										className="absolute left-4 top-1/2 -translate-y-1/2"
									/>
									<Label
										htmlFor="upi"
										className="flex flex-1 items-center justify-between pl-8 cursor-pointer"
									>
										<span className="flex items-center gap-3 font-medium">
											<Wallet className="h-5 w-5 text-primary" /> UPI / Wallet
										</span>
										<Image
											src="/payments/upi.svg"
											alt="UPI"
											width={32}
											height={20}
											className="h-6 w-auto"
										/>
									</Label>
								</div>
								{/* COD Option */}
								<div
									className={`relative flex items-center justify-between rounded-xl border-2 p-4 transition-all cursor-pointer ${
										paymentMethod === "cod"
											? "border-primary bg-primary/5"
											: "border-border/50 hover:border-primary/50"
									}`}
								>
									<RadioGroupItem
										value="cod"
										id="cod"
										className="absolute left-4 top-1/2 -translate-y-1/2"
									/>
									<Label
										htmlFor="cod"
										className="flex flex-1 items-center justify-between pl-8 cursor-pointer"
									>
										<span className="flex items-center gap-3 font-medium">
											<Banknote className="h-5 w-5 text-primary" /> Cash on
											Delivery
										</span>
									</Label>
								</div>
							</RadioGroup>
						</section>
					</div>

					{/* RIGHT COLUMN: Order Summary */}
					<div className="lg:col-span-5 sticky">
						<div className="sticky top-24 rounded-2xl border border-border/50 bg-card p-6 shadow-xl shadow-black/5">
							<h3 className="text-lg font-bold mb-4">Order Summary</h3>

							<div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-6 scrollbar-thin scrollbar-thumb-secondary">
								{items.map((item) => (
									<div key={item.id} className="flex gap-4">
										<div className="relative h-16 w-16 overflow-hidden rounded-md border bg-secondary/20 shrink-0">
											{item.image_url && (
												<Image
													src={item.image_url}
													alt={item.title}
													fill
													className="object-cover"
												/>
											)}
											<div className="absolute right-0 bottom-0 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-tl-md">
												x{item.quantity}
											</div>
										</div>
										<div className="flex-1 min-w-0 flex flex-col justify-center">
											<h4 className="text-sm font-medium truncate">
												{item.title}
											</h4>
											<p className="text-sm text-muted-foreground">
												{formatCurrency(item.price)}
											</p>
										</div>
										<div className="text-sm font-semibold self-center">
											{formatCurrency(item.price * item.quantity)}
										</div>
									</div>
								))}
							</div>

							<Separator className="my-4" />

							<div className="mb-6">
								{coupon ? (
									<div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-2.5 rounded-lg">
										<div className="flex items-center gap-2">
											<CheckCircle2 className="h-4 w-4 text-green-600" />
											<span className="text-sm font-bold text-green-700">
												{coupon.code}
											</span>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => {
												clearCart();
												if (removeCoupon) removeCoupon();
												setCouponInput("");
											}}
											className="h-6 text-xs text-muted-foreground hover:text-destructive"
										>
											Remove
										</Button>
									</div>
								) : (
									<div className="flex gap-2">
										<Input
											placeholder="Discount Code"
											value={couponInput}
											onChange={(e) => {
												setCouponInput(e.target.value.toUpperCase());
												setCouponMessage(null);
											}}
											className="bg-background font-mono uppercase h-10"
										/>
										<Button
											type="button"
											variant="outline"
											onClick={handleApplyCoupon}
											disabled={!couponInput || isPending}
										>
											Apply
										</Button>
									</div>
								)}
								{couponMessage?.type === "error" && (
									<p className="text-xs text-red-500 mt-2 flex items-center gap-1">
										<AlertCircle className="h-3 w-3" /> {couponMessage.text}
									</p>
								)}
							</div>

							<div className="space-y-3 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Subtotal</span>
									<span>{formatCurrency(subtotal)}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Shipping</span>
									<span
										className={
											isFreeShipping ? "text-green-500 font-medium" : ""
										}
									>
										{isFreeShipping ? "Free" : formatCurrency(shippingCost)}
									</span>
								</div>
								{coupon && (
									<div className="flex justify-between text-green-500">
										<span className="font-medium flex items-center gap-1">
											<Tag className="h-3 w-3" /> Discount
										</span>
										<span>-{formatCurrency(discountAmount)}</span>
									</div>
								)}
								<Separator className="my-2" />
								<div className="flex justify-between text-lg font-bold">
									<span>Total</span>
									<span className="text-primary">{formatCurrency(total)}</span>
								</div>
							</div>

							<Button
								type="submit"
								size="lg"
								className="w-full mt-6 h-12 text-base font-bold shadow-lg shadow-primary/20"
								disabled={isPending}
							>
								{isPending ? (
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
								) : (
									`Complete Payment ${formatCurrency(total)}`
								)}
							</Button>
							<div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
								<Lock className="h-3 w-3" /> Payments are secure and encrypted
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
