"use client";

import { useStoreSettings } from "./use-store-settings";

export function useCurrency() {
  const { settings, loading } = useStoreSettings();

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "";
    
    // Default to INR if loading or missing
    const currencyCode = settings.currency || "INR";

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
      }).format(amount);
    } catch (error) {
      // Fallback if currency code is invalid
      return `$${amount.toFixed(2)}`;
    }
  };

  return { formatCurrency, currencyCode: settings.currency, loading };
}