import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

export interface CartItem {
	id: string;
	title: string;
	price: number;
	image_url?: string;
	quantity: number;
}

interface Coupon {
	code: string;
	discount: number;
}

interface CartStore {
	items: CartItem[];
	coupon: Coupon | null;
	addItem: (data: CartItem) => void;
	removeItem: (id: string) => void;
	clearCart: () => void;
	updateQuantity: (id: string, quantity: number) => void;
	applyCoupon: (coupon: Coupon) => void;
	removeCoupon: () => void;
}

export const useCart = create(
	persist<CartStore>(
		(set, get) => ({
			items: [],
			coupon: null,

			addItem: (data: CartItem) => {
				const currentItems = get().items;
				const existingItem = currentItems.find((item) => item.id === data.id);
				if (existingItem) {
					return toast.info("Item already in cart.");
				}
				set({ items: [...get().items, { ...data, quantity: 1 }] });
				toast.success("Item added to cart.");
			},

			removeItem: (id: string) => {
				set({ items: get().items.filter((item) => item.id !== id) });
				toast.success("Item removed from cart.");
			},

			// --- ADDED THIS FUNCTION TO FIX THE ERROR ---
			updateQuantity: (id: string, quantity: number) => {
				const currentItems = get().items;
				const updatedItems = currentItems.map((item) =>
					item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
				);
				set({ items: updatedItems });
			},
			// --------------------------------------------

			clearCart: () => set({ items: [], coupon: null }),

			applyCoupon: (coupon: Coupon) => {
				set({ coupon });
				toast.success(`Coupon ${coupon.code} applied!`);
			},

			removeCoupon: () => {
				set({ coupon: null });
				toast.info("Coupon removed.");
			},
		}),
		{
			name: "cart-storage-v2",
			storage: createJSONStorage(() => localStorage),
		}
	)
);
