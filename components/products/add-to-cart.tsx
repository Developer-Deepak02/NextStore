"use client";

import { useState } from "react";
import { useCart } from "@/lib/store";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";

export default function AddToCart({ product }: { product: Product }) {
	const addItem = useCart((state) => state.addItem);
	const [isAdded, setIsAdded] = useState(false);

	const handleAdd = () => {
		addItem(product);
		setIsAdded(true);
		setTimeout(() => setIsAdded(false), 2000); // Reset button after 2s
	};

	return (
		<Button
			size="lg"
			className="w-full md:w-auto min-w-[200px] text-lg h-12"
			onClick={handleAdd}
			disabled={isAdded}
		>
			{isAdded ? (
				<>
					<Check className="mr-2 h-5 w-5" /> Added to Cart
				</>
			) : (
				<>
					<ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
				</>
			)}
		</Button>
	);
}
