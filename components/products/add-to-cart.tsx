"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight } from "lucide-react";

export default function AddToCart({ product }: { product: Product }) {
	const router = useRouter();

	const { items, addItem } = useCart((state) => ({
		items: state.items,
		addItem: state.addItem,
	}));

	const isOutOfStock = product.stock !== undefined && product.stock <= 0;

	
	const isInCart = items.some((item) => item.id === product.id);

	const handleClick = () => {
		if (isOutOfStock) return;

		if (isInCart) {
			router.push("/cart");
		} else {
			addItem(product);
		}
	};

	return (
		<Button
			size="lg"
			className="w-full md:w-auto min-w-[200px] h-12 text-base transition active:scale-95"
			onClick={handleClick}
			disabled={isOutOfStock}
			aria-label="Add product to cart"
		>
			{isOutOfStock ? (
				<span>Out of Stock</span>
			) : isInCart ? (
				<>
					Go to Cart <ArrowRight className="ml-2 h-5 w-5" />
				</>
			) : (
				<>
					<ShoppingCart className="mr-2 h-5 w-5" />
					Add to Cart
				</>
			)}
		</Button>
	);
}
