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
		(set) => ({
			items: [],

			addItem: (product) =>
				set((state) => {
					const existing = state.items.find((item) => item.id === product.id);

					if (existing) {
						return {
							items: state.items.map((item) =>
								item.id === product.id
									? { ...item, quantity: item.quantity + 1 }
									: item
							),
						};
					}

					return {
						items: [...state.items, { ...product, quantity: 1 }],
					};
				}),

			removeItem: (id) =>
				set((state) => ({
					items: state.items.filter((item) => item.id !== id),
				})),

			updateQuantity: (id, quantity) =>
				set((state) => {
					if (quantity <= 0) {
						return {
							items: state.items.filter((item) => item.id !== id),
						};
					}

					return {
						items: state.items.map((item) =>
							item.id === id ? { ...item, quantity } : item
						),
					};
				}),

			clearCart: () => set({ items: [] }),
		}),
		{
			name: "cart-storage",
		}
	)
);
