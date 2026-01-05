import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import ProductCard from "@/components/products/product-card";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, TrendingUp, Star } from "lucide-react";

// Ensure fresh data on every visit so randomization works
export const revalidate = 0;

// 1. Fetch Newest Items
async function getLatestProducts() {
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.eq("status", "active")
		.order("created_at", { ascending: false })
		.limit(4);

	if (error) {
		console.error("Error fetching latest products:", error);
		return [];
	}
	return data as Product[];
}

// 2. Fetch Random "Top" Items
async function getRandomTopProducts() {
	// Fetch a pool of active products (e.g., 20)
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.eq("status", "active")
		.limit(20);

	if (error) {
		console.error("Error fetching top products:", error);
		return [];
	}

	// Shuffle array using Fisher-Yates or simple sort
	const shuffled = (data as Product[]).sort(() => 0.5 - Math.random());

	// Return first 4
	return shuffled.slice(0, 4);
}

export default async function Home() {
	const latestProducts = await getLatestProducts();
	const topProducts = await getRandomTopProducts();

	return (
		<div className="flex flex-col min-h-screen">
			<Hero />
			<Features />

			{/* --- SECTION 1: LATEST ARRIVALS --- */}
			<section className="py-20 bg-background">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
						<div className="max-w-xl">
							<div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 mb-3">
								<Star className="mr-1 h-3 w-3 fill-current" /> New Drops
							</div>
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
								Latest Arrivals
							</h2>
							<p className="text-muted-foreground mt-2 text-lg">
								Fresh from the factory to your doorstep.
							</p>
						</div>

						<Link href="/products">
							<Button
								variant="ghost"
								className="group text-primary hover:bg-primary/5"
							>
								View All Products
								<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
							</Button>
						</Link>
					</div>

					{latestProducts.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
							{latestProducts.map((product) => (
								<ProductCard key={product.id} product={product} isNew={true} />
							))}
						</div>
					) : (
						<div className="text-center py-20 border-2 border-dashed rounded-xl">
							<p className="text-muted-foreground">No latest products found.</p>
						</div>
					)}
				</div>
			</section>

			{/* --- SECTION 2: CUSTOMER FAVORITES (Random) --- */}
			<section className="py-24 bg-secondary/30 border-t border-border/50">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center justify-center text-center gap-4 mb-12">
						<div className="inline-flex items-center justify-center rounded-full bg-orange-100 p-3 text-orange-600 shadow-sm">
							<TrendingUp className="h-6 w-6" />
						</div>
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Customer Favorites
						</h2>
						<p className="text-muted-foreground max-w-[600px] text-lg">
							Our selection of must-have items. Refresh the page to see more!
						</p>
					</div>

					{topProducts.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
							{topProducts.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<p className="text-muted-foreground">
								Check back soon for top picks.
							</p>
						</div>
					)}

					<div className="mt-16 flex justify-center">
						<Button
							size="lg"
							className="px-8 h-12 rounded-full shadow-lg hover:shadow-primary/25 transition-all text-base font-semibold"
							asChild
						>
							<Link href="/products">Explore More</Link>
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
