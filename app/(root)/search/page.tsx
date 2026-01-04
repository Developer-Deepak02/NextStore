import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/products/product-card";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SearchX } from "lucide-react";

export const revalidate = 0; // Dynamic fetch

export default async function SearchPage({
	searchParams,
}: {
	searchParams: Promise<{ query?: string }>;
}) {
	const { query } = await searchParams; // Await params for Next.js 15
	const searchTerm = query || "";

	// Fetch items matching title OR description
	const { data: products } = await supabase
		.from("products")
		.select("*")
		.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

	return (
		<div className="container py-10">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
				<p className="text-muted-foreground mt-2">
					Searching for:{" "}
					<span className="font-semibold text-foreground">"{searchTerm}"</span>
				</p>
			</div>

			{products && products.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{products.map((product) => (
						<ProductCard key={product.id} product={product as Product} />
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4 border rounded-xl bg-secondary/10 border-dashed">
					<div className="bg-secondary/30 p-4 rounded-full">
						<SearchX className="h-10 w-10 text-muted-foreground" />
					</div>
					<h2 className="text-xl font-semibold">No results found</h2>
					<p className="text-muted-foreground max-w-md">
						We couldn't find any products matching "{searchTerm}". Try checking
						for typos or using different keywords.
					</p>
					<Link href="/products">
						<Button variant="outline" className="mt-4">
							Browse All Products
						</Button>
					</Link>
				</div>
			)}
		</div>
	);
}
