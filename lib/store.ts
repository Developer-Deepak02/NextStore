import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";

interface CartState {
	items: CartItem[];
	addItem: (product: Product) => void;
	removeItem: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;
}

export const useCart = create<CartState>()(
	persist(
		(set, get) => ({
			items: [],
			addItem: (product) => {
				const currentItems = get().items;
				const existingItem = currentItems.find(
					(item) => item.id === product.id
				);

				if (existingItem) {
					set({
						items: currentItems.map((item) =>
							item.id === product.id
								? { ...item, quantity: item.quantity + 1 }
								: item
						),
					});
				} else {
					set({ items: [...currentItems, { ...product, quantity: 1 }] });
				}
			},
			removeItem: (id) => {
				set({ items: get().items.filter((item) => item.id !== id) });
			},
			updateQuantity: (id, quantity) => {
				set({
					items: get().items.map((item) =>
						item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
					),
				});
			},
			clearCart: () => set({ items: [] }),
		}),
		{
			name: "cart-storage", // unique name for localStorage
		}
	)
);
