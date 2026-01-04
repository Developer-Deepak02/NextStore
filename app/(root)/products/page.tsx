import ProductCard from "@/components/products/product-card";
import ProductFilters from "@/components/products/product-filters";
import { supabase } from "@/lib/supabase";
import { Product, Category } from "@/types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

// Revalidate data every 60 seconds
export const revalidate = 60;

interface SearchParams {
	categories?: string;
	min?: string;
	max?: string;
	search?: string;
}

export default async function ProductsPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const params = await searchParams; // Await params in Next.js 15

	// 1. Fetch Categories for Filter Sidebar
	const { data: categories } = await supabase.from("categories").select("*");

	// 2. Build Query for Products
	let query = supabase.from("products").select("*");

	// Apply Category Filter
	if (params.categories) {
		const catIds = params.categories.split(",");
		query = query.in("category_id", catIds);
	}

	// Apply Price Filter
	if (params.min) query = query.gte("price", Number(params.min));
	if (params.max) query = query.lte("price", Number(params.max));

	// Apply Search
	if (params.search) query = query.ilike("title", `%${params.search}%`);

	const { data: products } = await query;

	return (
		<div className="container py-10">
			<div className="flex flex-col md:flex-row gap-8">
				{/* Sidebar (Desktop) */}
				<aside className="hidden md:block w-64 flex-shrink-0">
					<ProductFilters categories={(categories as Category[]) || []} />
				</aside>

				{/* Sidebar (Mobile - Drawer) */}
				<div className="md:hidden mb-6">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" className="w-full">
								<Filter className="mr-2 h-4 w-4" /> Filters
							</Button>
						</SheetTrigger>
						<SheetContent side="left">
							<div className="mt-6">
								<ProductFilters categories={(categories as Category[]) || []} />
							</div>
						</SheetContent>
					</Sheet>
				</div>

				{/* Main Product Grid */}
				<main className="flex-1">
					<div className="mb-6">
						<h1 className="text-3xl font-bold tracking-tight">All Products</h1>
						<p className="text-muted-foreground mt-2">
							Showing {products?.length || 0} result(s)
						</p>
					</div>

					{products && products.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{products.map((product) => (
								<ProductCard key={product.id} product={product as Product} />
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-secondary/20">
							<h2 className="text-lg font-semibold">No products found</h2>
							<p className="text-muted-foreground">
								Try changing your filters or search terms.
							</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
