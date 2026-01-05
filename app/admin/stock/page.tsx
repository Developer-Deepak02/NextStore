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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Save, AlertTriangle, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

type InventoryItem = {
	id: string;
	title: string;
	image_url: string;
	stock_quantity: number; // We will simulate this column for now if it doesn't exist
};

export default function AdminStockPage() {
	const [products, setProducts] = useState<InventoryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	// State to track unsaved changes: { [productId]: newQuantity }
	const [edits, setEdits] = useState<Record<string, number>>({});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		fetchInventory();
	}, []);

	async function fetchInventory() {
		setLoading(true);
		const { data } = await supabase
			.from("products")
			.select("id, title, image_url, price"); // Fetching basic info

		// MOCK STOCK: Since we haven't added a 'stock' column to DB yet,
		// we will simulate random stock numbers for this demo.
		// In a real app, you would select 'stock_quantity' from DB.
		if (data) {
			const productsWithStock = data.map((p) => ({
				...p,
				stock_quantity: Math.floor(Math.random() * 50), // Random 0-50
			}));
			setProducts(productsWithStock as any);
		}
		setLoading(false);
	}

	// Handle Input Change
	const handleStockChange = (id: string, value: string) => {
		const qty = parseInt(value);
		if (isNaN(qty) || qty < 0) return;
		setEdits((prev) => ({ ...prev, [id]: qty }));
	};

	// Save All Changes
	const saveChanges = async () => {
		setSaving(true);
		// In a real app, you would loop through 'edits' and update Supabase
		// await supabase.from('products').update({ stock_quantity: qty }).eq('id', id)

		// Simulating API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Update local state
		setProducts(
			products.map((p) =>
				edits[p.id] !== undefined ? { ...p, stock_quantity: edits[p.id] } : p
			)
		);

		setEdits({});
		setSaving(false);
		toast.success("Inventory updated successfully");
	};

	const filteredProducts = products.filter((p) =>
		p.title.toLowerCase().includes(search.toLowerCase())
	);

	const lowStockCount = products.filter(
		(p) => (edits[p.id] ?? p.stock_quantity) < 10
	).length;

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
					<p className="text-muted-foreground">
						Manage stock levels and availability.
					</p>
				</div>

				{/* Actions Bar */}
				<div className="flex items-center gap-3 w-full sm:w-auto">
					{Object.keys(edits).length > 0 && (
						<Button
							onClick={saveChanges}
							disabled={saving}
							className="bg-green-600 hover:bg-green-700 animate-in fade-in zoom-in"
						>
							{saving ? (
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Save className="mr-2 h-4 w-4" />
							)}
							Save Changes ({Object.keys(edits).length})
						</Button>
					)}

					<div className="relative flex-1 sm:w-64">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search product..."
							className="pl-8 bg-card border-none shadow-sm"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* Low Stock Alert */}
			{lowStockCount > 0 && (
				<div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-center gap-3 text-orange-700 dark:text-orange-400">
					<AlertTriangle className="h-5 w-5" />
					<p className="font-medium">
						Attention needed: {lowStockCount} products are low on stock.
					</p>
				</div>
			)}

			{/* Inventory Table */}
			<div className="rounded-xl bg-card/50 backdrop-blur-sm shadow-md overflow-hidden border-none">
				<Table>
					<TableHeader>
						<TableRow className="bg-secondary/50 hover:bg-secondary/50 border-none">
							<TableHead className="w-[80px]">Image</TableHead>
							<TableHead>Product Name</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="w-[150px]">Quantity</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							[...Array(5)].map((_, i) => (
								<TableRow key={i} className="border-b-0">
									<TableCell>
										<div className="h-10 w-10 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-32 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-16 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-8 w-24 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
								</TableRow>
							))
						) : filteredProducts.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={4}
									className="h-24 text-center text-muted-foreground"
								>
									No products found.
								</TableCell>
							</TableRow>
						) : (
							filteredProducts.map((product) => {
								const currentStock =
									edits[product.id] ?? product.stock_quantity;
								const isLow = currentStock < 10;
								const isChanged = edits[product.id] !== undefined;

								return (
									<TableRow
										key={product.id}
										className="hover:bg-secondary/30 transition-colors border-b-border/30"
									>
										<TableCell>
											<div className="relative h-10 w-10 overflow-hidden rounded-lg bg-secondary">
												{product.image_url && (
													<Image
														src={product.image_url}
														alt={product.title}
														fill
														className="object-cover"
													/>
												)}
											</div>
										</TableCell>
										<TableCell className="font-medium">
											{product.title}
										</TableCell>
										<TableCell>
											{currentStock === 0 ? (
												<Badge
													variant="outline"
													className="bg-red-500/10 text-red-600 border-red-200"
												>
													Out of Stock
												</Badge>
											) : isLow ? (
												<Badge
													variant="outline"
													className="bg-orange-500/10 text-orange-600 border-orange-200"
												>
													Low Stock
												</Badge>
											) : (
												<Badge
													variant="outline"
													className="bg-green-500/10 text-green-600 border-green-200"
												>
													In Stock
												</Badge>
											)}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Input
													type="number"
													min="0"
													value={currentStock}
													onChange={(e) =>
														handleStockChange(product.id, e.target.value)
													}
													className={`w-24 text-center font-mono ${
														isChanged
															? "border-green-500 ring-1 ring-green-500/50 bg-green-500/5"
															: ""
													}`}
												/>
												{isChanged && (
													<Check className="h-4 w-4 text-green-500 animate-in zoom-in" />
												)}
											</div>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
