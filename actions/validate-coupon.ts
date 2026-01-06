"use server";

import { createClient } from "@/lib/supabase";

const supabase = createClient();


export async function validateCoupon(code: string, cartTotal: number) {
	if (!code) return { error: "Please enter a coupon code." };

	// 1. Fetch Coupon
	const { data: coupon, error } = await supabase
		.from("coupons")
		.select("*")
		.eq("code", code.toUpperCase())
		.single();

	if (error || !coupon) {
		return { error: `Coupon '${code}' is invalid.` };
	}

	// 2. CHECK ACTIVE STATUS
	if (coupon.is_active === false) {
		return { error: `Coupon '${code}' is inactive.` };
	}

	if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
		return { error: `Coupon '${code}' has expired.` };
	}

	// 3. EXTRACT VALUE
	const rawValue =
		coupon.discount_amount ??
		coupon.discount_value ??
		coupon.discount_percent ??
		coupon.value ??
		coupon.amount ??
		0;

	const discountValue = Number(rawValue);

	// 4. DETECT TYPE
	const rawType = (coupon.discount_type || "fixed").toLowerCase();
	const isPercentage = rawType.includes("cent") || rawType.includes("%");

	// 5. CHECK MINIMUM ORDER
	const minOrder = Number(coupon.min_order_value || 0);
	if (cartTotal < minOrder) {
		return {
			error: `This coupon requires a minimum order of ${minOrder}`,
		};
	}

	// 6. CALCULATE DISCOUNT
	let discountAmount = 0;

	if (isPercentage) {
		discountAmount = (cartTotal * discountValue) / 100;
	} else {
		discountAmount = discountValue;
	}

	// 7. Safety & Capping
	if (isNaN(discountAmount)) discountAmount = 0;

	if (coupon.max_discount && discountAmount > coupon.max_discount) {
		discountAmount = coupon.max_discount;
	}

	discountAmount = Math.min(discountAmount, cartTotal);

	return {
		success: true,
		discount: discountAmount,
		code: coupon.code,
		type: isPercentage ? "percentage" : "fixed",
	};
}
