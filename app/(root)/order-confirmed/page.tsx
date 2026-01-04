"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

// Helper component to read search params safely
function ConfirmationContent() {
	const searchParams = useSearchParams();
	const orderId = searchParams.get("orderId");

	return (
		<div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-20">
			<div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
				<CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
			</div>

			<h1 className="text-3xl font-bold tracking-tight mb-2">
				Order Confirmed!
			</h1>
			<p className="text-muted-foreground mb-6">
				Thank you for your purchase. Your order has been placed successfully.
			</p>

			{orderId && (
				<div className="bg-secondary/50 p-4 rounded-lg w-full mb-8 border border-border">
					<p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
						Order ID
					</p>
					<p className="font-mono text-lg mt-1 select-all">{orderId}</p>
				</div>
			)}

			<div className="flex gap-4">
				<Link href="/products">
					<Button>Continue Shopping</Button>
				</Link>
				<Link href="/">
					<Button variant="outline">Go Home</Button>
				</Link>
			</div>
		</div>
	);
}

// Main page wrapper with Suspense
export default function OrderConfirmedPage() {
	return (
		<div className="container min-h-[60vh]">
			<Suspense
				fallback={
					<div className="py-20 text-center">Loading confirmation...</div>
				}
			>
				<ConfirmationContent />
			</Suspense>
		</div>
	);
}
