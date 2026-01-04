import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { Star, ArrowLeft } from "lucide-react";
import ProductCard from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AddToCart from "@/components/products/add-to-cart";


// Revalidate every 60 seconds
export const revalidate = 60;

// Helper to render stars
function StarRating({ rating }: { rating: number }) {
	return (
		<div className="flex text-yellow-500">
			{[1, 2, 3, 4, 5].map((star) => (
				<Star
					key={star}
					className={`h-5 w-5 ${
						star <= Math.round(rating) ? "fill-current" : "text-muted"
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
	// Await params for Next.js 15 compatibility
	const { id } = await params;

	// 1. Fetch Current Product
	const { data: product, error } = await supabase
		.from("products")
		.select("*, categories(*)") // Join category to get name if needed
		.eq("id", id)
		.single();

	if (error || !product) {
		notFound();
	}

	// 2. Fetch Related Products (Same Category, excluding current)
	const { data: relatedProducts } = await supabase
		.from("products")
		.select("*")
		.eq("category_id", product.category_id)
		.neq("id", id) // Exclude current
		.limit(4);

	return (
		<div className="container py-10 md:py-20 animate-in fade-in duration-500">
			{/* Back Button */}
			<Link href="/products">
				<Button
					variant="ghost"
					className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
				>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
				</Button>
			</Link>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
				{/* Left: Product Image */}
				<div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary/30 border border-border/50">
					{product.image_url ? (
						<Image
							src={product.image_url}
							alt={product.title}
							fill
							className="object-cover"
							sizes="(max-width: 768px) 100vw, 50vw"
							priority
						/>
					) : (
						<div className="flex h-full items-center justify-center text-muted-foreground">
							No Image
						</div>
					)}
				</div>

				{/* Right: Product Details */}
				<div className="flex flex-col justify-center space-y-6">
					<div>
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
							{product.title}
						</h1>
						<div className="mt-4 flex items-center gap-4">
							<StarRating rating={product.rating || 0} />
							<span className="text-sm text-muted-foreground">
								({product.rating || 0} / 5.0)
							</span>
						</div>
					</div>

					<div className="flex items-baseline gap-4">
						<span className="text-4xl font-bold text-primary">
							${product.price}
						</span>
						{product.original_price && (
							<span className="text-xl text-muted-foreground line-through">
								${product.original_price}
							</span>
						)}
					</div>

					<Separator />

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
							Description
						</h3>
						<p className="text-base leading-relaxed text-foreground/80">
							{product.description ||
								"No description available for this product."}
						</p>
					</div>

					<div className="pt-6">
						<AddToCart product={product as Product} />
					</div>

					{/* Trust Badges */}
					<div className="grid grid-cols-2 gap-4 pt-6 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<span className="h-2 w-2 rounded-full bg-green-500" /> In Stock &
							Ready to Ship
						</div>
						<div className="flex items-center gap-2">
							<span className="h-2 w-2 rounded-full bg-primary" /> Free Shipping
						</div>
					</div>
				</div>
			</div>

			{/* Related Products Section */}
			{relatedProducts && relatedProducts.length > 0 && (
				<div className="mt-20">
					<h2 className="text-2xl font-bold tracking-tight mb-8">
						Related Products
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{relatedProducts.map((p) => (
							<ProductCard key={p.id} product={p as Product} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
