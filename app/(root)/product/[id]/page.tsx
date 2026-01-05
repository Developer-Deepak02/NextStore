import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import {
	Star,
	ArrowLeft,
	CheckCircle2,
	Package,
	ShieldCheck,
} from "lucide-react";
import ProductCard from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AddToCart from "@/components/products/add-to-cart";
import BuyNow from "@/components/products/buy-now";
import ProductPrice from "@/components/products/product-price";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

function StarRating({ rating }: { rating: number }) {
	return (
		<div className="flex text-yellow-500">
			{[1, 2, 3, 4, 5].map((star) => (
				<Star
					key={star}
					className={`h-5 w-5 ${
						star <= Math.round(rating) ? "fill-current" : "text-muted/30"
					}`}
				/>
			))}
		</div>
	);
}

export default async function ProductDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	// 1. Fetch Current Product
	const { data: product, error } = await supabase
		.from("products")
		.select("*")
		.eq("id", id)
		.single();

	if (error || !product) {
		notFound();
	}

	// 2. Fetch Related Products
	const { data: relatedRaw } = await supabase
		.from("products")
		.select("*")
		.eq("status", "active")
		.eq("category", product.category)
		.neq("id", id)
		.limit(10);

	const relatedProducts = (relatedRaw || [])
		.sort(() => 0.5 - Math.random())
		.slice(0, 4);

	return (
		<div className="container px-4 md:px-6 py-10 md:py-16 animate-in fade-in duration-500">
			{/* Back Button */}
			<div className="mb-6">
				<Button
					variant="ghost"
					asChild
					className="pl-0 hover:bg-transparent hover:text-primary transition-colors"
				>
					<Link href="/products" className="flex items-center gap-2">
						<ArrowLeft className="h-4 w-4" /> Back to Products
					</Link>
				</Button>
			</div>

			{/* Main Layout: Image (40%) - Details (60%) */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
				{/* Left: Product Image (Takes 5 columns) */}
				<div className="lg:col-span-5 relative aspect-square overflow-hidden rounded-3xl bg-secondary/20 border border-border/50 shadow-sm group">
					{product.image_url ? (
						<Image
							src={product.image_url}
							alt={product.title}
							fill
							className="object-cover transition-transform duration-500 group-hover:scale-105"
							priority
						/>
					) : (
						<div className="flex h-full flex-col items-center justify-center text-muted-foreground bg-secondary/30">
							<span className="text-4xl">📷</span>
							<p className="mt-2 text-sm">No Image Available</p>
						</div>
					)}
					<div className="absolute top-4 left-4">
						{product.stock > 0 ? (
							<Badge className="bg-green-500/90 hover:bg-green-600 backdrop-blur-md border-none px-3 py-1">
								In Stock
							</Badge>
						) : (
							<Badge variant="destructive">Out of Stock</Badge>
						)}
					</div>
				</div>

				{/* Right: Product Details (Takes 7 columns - Wider) */}
				<div className="lg:col-span-7 flex flex-col justify-center space-y-8">
					{/* Header */}
					<div className="space-y-4">
						<span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md inline-block">
							{product.category || "General"}
						</span>

						<h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight text-foreground">
							{product.title}
						</h1>

						{/* Rating only (Removed "No reviews yet") */}
						<div className="flex items-center gap-4">
							<StarRating rating={4} />
						</div>
					</div>

					{/* Price */}
					<div className="flex items-baseline gap-4">
						<ProductPrice
							price={product.price}
							className="text-5xl font-bold text-primary tracking-tight"
						/>
					</div>

					<Separator className="bg-border/60" />

					{/* BIG ACTION BUTTONS (Moved UP) */}
					<div className="pt-2 flex flex-col sm:flex-row gap-4 w-full">
						<div className="flex-1">
							<BuyNow product={product as Product} />
						</div>
						<div className="flex-1">
							<AddToCart product={product as Product} />
						</div>
					</div>

					{/* Inline Trust Indicators */}
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-green-500" />
							<span>In Stock & Ready</span>
						</div>
						<div className="flex items-center gap-2">
							<Package className="h-4 w-4 text-primary" />
							<span>Free Shipping Over ₹1000</span>
						</div>
						<div className="flex items-center gap-2">
							<ShieldCheck className="h-4 w-4 text-primary" />
							<span>Secure Payment</span>
						</div>
					</div>

					<Separator className="bg-border/60" />

					{/* Description (Moved Down) */}
					<div className="space-y-4">
						<h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
							Product Description
						</h3>
						<p className="text-base leading-relaxed text-muted-foreground/90">
							{product.description || "No description available for this item."}
						</p>
					</div>
				</div>
			</div>

			{/* --- RELATED PRODUCTS SECTION --- */}
			<div className="mt-32 border-t border-border/40 pt-16">
				<div className="flex items-center justify-between mb-10">
					<div>
						<h2 className="text-3xl font-bold tracking-tight">
							You might also like
						</h2>
						<p className="text-muted-foreground mt-2">
							More items from {product.category || "our collection"}
						</p>
					</div>
					<Button variant="ghost" asChild className="group">
						<Link href="/products">
							View all{" "}
							<span className="ml-1 transition-transform group-hover:translate-x-1">
								&rarr;
							</span>
						</Link>
					</Button>
				</div>

				{relatedProducts.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
						{relatedProducts.map((p) => (
							<ProductCard key={p.id} product={p as Product} />
						))}
					</div>
				) : (
					<div className="py-12 text-center border-2 border-dashed rounded-xl">
						<p className="text-muted-foreground">No related products found.</p>
					</div>
				)}
			</div>
		</div>
	);
}
