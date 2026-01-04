import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import ProductCard from "@/components/products/product-card";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// This makes the page dynamic so it fetches fresh data on every request
export const revalidate = 0;

async function getLatestProducts() {
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(4);

	if (error) {
		console.error("Error fetching products:", error);
		return [];
	}
	return data as Product[];
}

export default async function Home() {
	const latestProducts = await getLatestProducts();

	return (
		<div className="flex flex-col min-h-screen">
			<Hero />

			<Features />

			{/* Latest Products Section */}
			<section className="py-20 bg-secondary/20">
				<div className="container">
					<div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
						<div className="text-center md:text-left">
							<h2 className="text-3xl font-bold tracking-tight">
								Latest Arrivals
							</h2>
							<p className="text-muted-foreground mt-2">
								Fresh from the factory to your doorstep.
							</p>
						</div>
						<Link href="/products">
							<Button variant="ghost" className="group">
								View All Products
								<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
							</Button>
						</Link>
					</div>

					{latestProducts.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{latestProducts.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					) : (
						<div className="text-center py-20">
							<p className="text-muted-foreground">
								No products found. Please run the Supabase setup script.
							</p>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
