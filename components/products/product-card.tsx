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
	const discount =
		product.original_price && product.original_price > product.price
			? Math.round(
					((product.original_price - product.price) / product.original_price) *
						100
			  )
			: 0;

	const isOutOfStock = product.stock !== undefined && product.stock <= 0;

	const formattedPrice = new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format(product.price);

	const formattedOriginalPrice = product.original_price
		? new Intl.NumberFormat("en-IN", {
				style: "currency",
				currency: "INR",
		  }).format(product.original_price)
		: null;

	return (
		<Card className="group overflow-hidden rounded-xl border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/50">
			{/* Image */}
			<Link
				href={`/product/${product.id}`}
				className="relative block aspect-square overflow-hidden bg-secondary/50"
			>
				{product.image_url ? (
					<Image
						src={product.image_url}
						alt={product.title}
						fill
						priority={product.is_featured}
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
						<Badge className="bg-primary/90 text-primary-foreground">
							Featured
						</Badge>
					)}
					{discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
					{isOutOfStock && <Badge variant="secondary">Out of stock</Badge>}
				</div>
			</Link>

			{/* Content */}
			<CardContent className="p-4">
				<Link
					href={`/product/${product.id}`}
					className="block transition-colors hover:text-primary"
				>
					<h3 className="line-clamp-1 text-lg font-semibold">
						{product.title}
					</h3>
				</Link>

				<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
					{product.description}
				</p>
			</CardContent>

			{/* Footer */}
			<CardFooter className="flex items-center justify-between p-4 pt-0">
				<div className="flex flex-col">
					<span className="text-lg font-bold">{formattedPrice}</span>
					{formattedOriginalPrice && (
						<span className="text-sm text-muted-foreground line-through">
							{formattedOriginalPrice}
						</span>
					)}
				</div>

				<Button
					size="icon"
					disabled={isOutOfStock}
					className="rounded-full h-9 w-9 shadow-sm transition active:scale-95"
					aria-label="Add to cart"
				>
					<ShoppingCart className="h-4 w-4" />
				</Button>
			</CardFooter>
		</Card>
	);
}
