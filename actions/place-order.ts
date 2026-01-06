"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function placeOrder(
	formData: FormData,
	cartItems: any[],
	totalAmount: number
) {
	const supabase = await createClient();

	// 1. Get current user
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		throw new Error("You must be logged in to place an order");
	}

	// 2. Extract Data from Form
	const rawData = {
		user_name: formData.get("user_name") as string,
		email: formData.get("email") as string,
		address: formData.get("address") as string,
		city: formData.get("city") as string,
		zip_code: formData.get("zip_code") as string,
		user_id: user.id,
		total_amount: totalAmount,
		status: "pending", // Default status
	};

	// 3. Insert Order into 'orders' table
	const { data: order, error: orderError } = await supabase
		.from("orders")
		.insert(rawData)
		.select()
		.single();

	if (orderError) {
		console.error("Order Insert Error:", orderError);
		throw new Error("Failed to create order");
	}

	// 4. Prepare Order Items
	// We map your cart items to match the 'order_items' table structure
	const orderItemsData = cartItems.map((item) => ({
		order_id: order.id, // Link to the order we just created
		product_id: item.id, // Assuming your cart item has 'id'
		quantity: item.quantity,
		price: item.price,
	}));

	// 5. Insert Order Items into 'order_items' table
	const { error: itemsError } = await supabase
		.from("order_items")
		.insert(orderItemsData);

	if (itemsError) {
		console.error("Items Insert Error:", itemsError);
		// Optional: You might want to delete the order if items fail, or log it for manual fix
		throw new Error("Failed to save order items");
	}

	// 6. Success! Redirect to the new order details page
	redirect(`/orders/${order.id}`);
}
