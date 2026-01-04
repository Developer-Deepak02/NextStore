import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
	product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
	// Calculate discount percentage if original price exists
	const discount = product.original_price
		? Math.round(
				((product.original_price - product.price) / product.original_price) *
					100
		  )
		: 0;

	return (
		<Card className="group overflow-hidden rounded-xl border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/50">
			{/* Image Section */}
			<div className="relative aspect-square overflow-hidden bg-secondary/50">
				{product.image_url ? (
					<Image
						src={product.image_url}
						alt={product.title}
						fill
						className="object-cover transition-transform duration-500 group-hover:scale-110"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				) : (
					<div className="flex h-full items-center justify-center text-muted-foreground">
						No Image
					</div>
				)}

				{/* Badges */}
				<div className="absolute left-3 top-3 flex flex-col gap-2">
					{product.is_featured && (
						<Badge className="bg-primary/90 text-primary-foreground hover:bg-primary">
							Featured
						</Badge>
					)}
					{discount > 0 && (
						<Badge variant="destructive" className="animate-pulse">
							-{discount}%
						</Badge>
					)}
				</div>
			</div>

			{/* Details Section */}
			<CardContent className="p-4">
				<Link
					href={`/product/${product.id}`}
					className="group-hover:text-primary transition-colors"
				>
					<h3 className="line-clamp-1 text-lg font-semibold">
						{product.title}
					</h3>
				</Link>
				<p className="mt-1 line-clamp-2 text-sm text-muted-foreground h-10">
					{product.description}
				</p>
			</CardContent>

			{/* Price & Action Section */}
			<CardFooter className="flex items-center justify-between p-4 pt-0">
				<div className="flex flex-col">
					<div className="flex items-baseline gap-2">
						<span className="text-lg font-bold text-foreground">
							${product.price}
						</span>
						{product.original_price && (
							<span className="text-sm text-muted-foreground line-through">
								${product.original_price}
							</span>
						)}
					</div>
				</div>

				<Button
					size="icon"
					className="rounded-full h-8 w-8 shadow-sm transition-transform active:scale-95"
				>
					<ShoppingCart className="h-4 w-4" />
					<span className="sr-only">Add to cart</span>
				</Button>
			</CardFooter>
		</Card>
	);
}
