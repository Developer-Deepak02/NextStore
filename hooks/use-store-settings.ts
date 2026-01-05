"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useStoreSettings() {
	const [settings, setSettings] = useState({
		storeName: "NextStore", // Default fallback
		email: "support@nextstore.com",
		phone: "",
		address: "",
		currency: "USD",
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
					storeName: config.store_name || "NextStore",
					email: config.support_email || "support@nextstore.com",
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
