"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function BuyNow({ product }: { product: Product }) {
	const addItem = useCart((s) => s.addItem);
	const router = useRouter();

	const handleBuyNow = () => {
		addItem(product);
		router.push("/checkout");
	};

	return (
		<Button
			size="lg"
			className="
      w-full h-14                 
      text-base                  
      bg-gradient-to-r from-primary to-indigo-500
      text-white
      font-bold
      shadow-xl shadow-indigo-500/20
      hover:shadow-2xl hover:shadow-indigo-500/40
      hover:scale-[1.01]
      active:scale-[0.98]
      transition-all duration-300
      cursor-pointer
      border-0
    "
			onClick={handleBuyNow}
		>
			<Zap className="mr-2 h-5 w-5 fill-current" />
			Buy Now
		</Button>
	);
}
