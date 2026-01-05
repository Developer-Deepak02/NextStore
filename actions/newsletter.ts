"use server";

import { supabase } from "@/lib/supabase";

export async function subscribeToNewsletter(formData: FormData) {
	const email = formData.get("email") as string;

	if (!email || !email.includes("@")) {
		return { error: "Please enter a valid email address." };
	}

	try {
		const { error } = await supabase
			.from("newsletter_subscribers")
			.insert({ email });

		if (error) {
			if (error.code === "23505") {
				// Unique violation code
				return { error: "You are already subscribed!" };
			}
			return { error: "Something went wrong. Please try again." };
		}

		return { success: "Thank you for subscribing!" };
	} catch (err) {
		return { error: "Failed to connect." };
	}
}
