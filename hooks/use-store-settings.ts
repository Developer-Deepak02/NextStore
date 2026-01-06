"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export function useStoreSettings() {
	const supabase = createClient();
	const [settings, setSettings] = useState({
		storeName: "ShopKart", // Default fallback
		email: "support@shopkart.com",
		phone: "",
		address: "",
		currency: "INR",
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchSettings() {
			const { data } = await supabase.from("settings").select("*");

			if (data) {
				const config: any = {};
				data.forEach((item) => {
					config[item.key] = item.value;
				});

				setSettings({
					storeName: config.store_name || "ShopKart",
					email: config.support_email || "support@shopkart.com",
					phone: config.store_phone || "",
					address: config.store_address || "",
					currency: config.store_currency || "INR",
				});
			}
			setLoading(false);
		}

		fetchSettings();
	}, []);

	return { settings, loading };
}
