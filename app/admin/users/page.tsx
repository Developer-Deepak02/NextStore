"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Calendar, DollarSign, ShoppingBag } from "lucide-react";

type Customer = {
	email: string;
	name: string;
	total_orders: number;
	total_spent: number;
	last_order_date: string;
	city: string;
};

export default function AdminUsersPage() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchCustomers();
	}, []);

	async function fetchCustomers() {
		setLoading(true);
		// Fetch all orders to derive customer data
		const { data: orders } = await supabase
			.from("orders")
			.select("*")
			.order("created_at", { ascending: false });

		if (orders) {
			// Group by Email
			const customerMap = new Map<string, Customer>();

			orders.forEach((order) => {
				if (!customerMap.has(order.email)) {
					// Initialize customer
					customerMap.set(order.email, {
						email: order.email,
						name: order.user_name,
						total_orders: 0,
						total_spent: 0,
						last_order_date: order.created_at, // First one encountered is latest due to sort
						city: order.city,
					});
				}

				// Aggregate stats
				const customer = customerMap.get(order.email)!;
				customer.total_orders += 1;
				customer.total_spent += order.total_amount;
			});

			setCustomers(Array.from(customerMap.values()));
		}
		setLoading(false);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Customers</h1>
				<p className="text-muted-foreground">
					View your customer base and their purchase history.
				</p>
			</div>

			<div className="rounded-xl bg-card/50 backdrop-blur-sm shadow-md overflow-hidden border-none">
				<Table>
					<TableHeader>
						<TableRow className="bg-secondary/50 hover:bg-secondary/50 border-none">
							<TableHead>Customer</TableHead>
							<TableHead>Contact</TableHead>
							<TableHead>Location</TableHead>
							<TableHead>Orders</TableHead>
							<TableHead>Total Spent</TableHead>
							<TableHead className="text-right">Last Active</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							[...Array(5)].map((_, i) => (
								<TableRow key={i} className="border-b-0">
									<TableCell>
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-secondary/50 animate-pulse" />
											<div className="h-4 w-24 bg-secondary/50 rounded animate-pulse" />
										</div>
									</TableCell>
									<TableCell>
										<div className="h-4 w-32 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-20 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-8 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-16 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell />
								</TableRow>
							))
						) : customers.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-32 text-center text-muted-foreground"
								>
									No customers found yet.
								</TableCell>
							</TableRow>
						) : (
							customers.map((customer) => (
								<TableRow
									key={customer.email}
									className="hover:bg-secondary/30 transition-colors border-b-border/30"
								>
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar className="h-9 w-9 border border-border">
												<AvatarImage
													src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`}
												/>
												<AvatarFallback>
													{customer.name.slice(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<span className="font-medium">{customer.name}</span>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center text-muted-foreground text-sm">
											<Mail className="mr-2 h-3 w-3" />
											{customer.email}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center text-muted-foreground text-sm">
											<MapPin className="mr-2 h-3 w-3" />
											{customer.city}
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant="secondary"
											className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
										>
											<ShoppingBag className="mr-1 h-3 w-3" />{" "}
											{customer.total_orders} Orders
										</Badge>
									</TableCell>
									<TableCell className="font-mono font-medium text-green-600">
										${customer.total_spent.toFixed(2)}
									</TableCell>
									<TableCell className="text-right text-sm text-muted-foreground">
										{new Date(customer.last_order_date).toLocaleDateString()}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
