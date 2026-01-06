import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import OrderList from "@/components/orders/order-list";

export default async function OrdersPage() {
	const supabase = await createClient();

	// 1. Check User Auth
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// 2. Fetch Orders for User
	// We join 'order_items' and then nested join 'products' to get images/titles
	const { data: orders, error } = await supabase
		.from("orders")
		.select(
			`
      id,
      created_at,
      status,
      total_amount,
      order_items (
        id,
        quantity,
        product: products (
          title,
          image_url
        )
      )
    `
		)
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching orders:", error);
		return (
			<div className="p-8 text-center text-red-500">Failed to load orders.</div>
		);
	}

	// 3. Pass Data to Client Component
	return <OrderList orders={orders || []} />;
}
