"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight } from "lucide-react";

export default function AddToCart({ product }: { product: Product }) {
	const router = useRouter();

	const items = useCart((state) => state.items);
	const addItem = useCart((state) => state.addItem);

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
			variant="outline"
			size="lg"
			className="
      w-full h-14 
      border-primary/40 
      text-primary 
      hover:bg-primary/10 
      hover:border-primary 
      transition-all 
      active:scale-[0.98] 
      hover:cursor-pointer
    "
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
