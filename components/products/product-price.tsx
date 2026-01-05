"use client";

import { useCurrency } from "@/hooks/use-currency";

export default function ProductPrice({
	price,
	className,
}: {
	price: number;
	className?: string;
}) {
	const { formatCurrency } = useCurrency();

	return <span className={className}>{formatCurrency(price)}</span>;
}
