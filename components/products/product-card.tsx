"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCurrency } from "@/hooks/use-currency";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
	product: Product;
	isNew?: boolean;
}

export default function ProductCard({ product, isNew }: ProductCardProps) {
	const { formatCurrency } = useCurrency();

	return (
		<Link
			href={`/product/${product.id}`}
			className="group relative flex flex-col h-full rounded-xl border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 overflow-hidden"
		>
			{/* Image Container */}
			<div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/20">
				{product.image_url ? (
					<Image
						src={product.image_url}
						alt={product.title}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-110"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-secondary">
						<span className="text-muted-foreground">No Image</span>
					</div>
				)}

				{/* Badges */}
				<div className="absolute left-3 top-3 flex flex-wrap gap-2 z-10">
					{isNew && (
						<Badge className="bg-blue-600 hover:bg-blue-700 shadow-sm">
							New
						</Badge>
					)}
					{product.stock <= 5 && product.stock > 0 && (
						<Badge variant="destructive" className="animate-pulse shadow-sm">
							Low Stock
						</Badge>
					)}
					{product.stock === 0 && (
						<Badge variant="secondary" className="shadow-sm">
							Out of Stock
						</Badge>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col p-5">
				{/* Hierarchy 3: Muted Category Label */}
				<div className="mb-2">
					<span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
						{product.category || "General"}
					</span>
				</div>

				{/* Hierarchy 2: Bold Title */}
				<h3 className="font-bold text-base leading-tight line-clamp-1 mb-3 group-hover:text-primary transition-colors">
					{product.title}
				</h3>

				{/* Hierarchy 1: Price Pop */}
				<div className="mt-auto flex items-center justify-between">
					<span className="text-lg md:text-xl font-extrabold text-primary tracking-tight">
						{formatCurrency(product.price)}
					</span>
				</div>
			</div>
		</Link>
	);
}
