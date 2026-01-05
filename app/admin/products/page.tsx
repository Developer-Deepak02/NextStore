"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // For nice notifications

export default function AdminProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	// State for Delete Modal
	const [deleteId, setDeleteId] = useState<string | null>(null);

	useEffect(() => {
		fetchProducts();
	}, []);

	async function fetchProducts() {
		setLoading(true);
		const { data } = await supabase
			.from("products")
			.select("*")
			.order("created_at", { ascending: false });

		if (data) setProducts(data as Product[]);
		setLoading(false);
	}

	// Handle Delete Confirmation
	const confirmDelete = async () => {
		if (!deleteId) return;

		const { error } = await supabase
			.from("products")
			.delete()
			.eq("id", deleteId);

		if (!error) {
			setProducts(products.filter((p) => p.id !== deleteId));
			toast.success("Product deleted successfully");
		} else {
			// Check for foreign key constraint (Code 23503)
			if (error.code === "23503") {
				toast.error("Cannot delete product: It is part of an existing order.");
			} else {
				toast.error("Failed to delete product");
			}
		}
		setDeleteId(null); // Close modal
	};

	// Filter products based on search
	const filteredProducts = products.filter((p) =>
		p.title.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Products</h1>
					<p className="text-muted-foreground">Manage your product catalog.</p>
				</div>
				<div className="flex items-center gap-2 w-full sm:w-auto">
					{/* Search Bar */}
					<div className="relative flex-1 sm:w-64">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search products..."
							className="pl-8 bg-card border-none shadow-sm"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<Link href="/admin/products/new">
						<Button className="bg-primary hover:bg-primary/90 shadow-md border-none">
							<Plus className="mr-2 h-4 w-4" /> Add Product
						</Button>
					</Link>
				</div>
			</div>

			{/* Table Section - NO BORDERS, SHADOW ONLY */}
			<div className="rounded-xl bg-card/50 backdrop-blur-sm shadow-md overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-secondary/50 hover:bg-secondary/50 border-b-0">
							<TableHead className="w-[80px]">Image</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Stock</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							// Loading Skeleton
							[...Array(5)].map((_, i) => (
								<TableRow key={i} className="border-b-0">
									<TableCell>
										<div className="h-10 w-10 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-32 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-20 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-12 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-8 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell />
								</TableRow>
							))
						) : filteredProducts.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-32 text-center text-muted-foreground"
								>
									No products found.
								</TableCell>
							</TableRow>
						) : (
							filteredProducts.map((product) => (
								<TableRow
									key={product.id}
									className="hover:bg-secondary/30 transition-colors border-b-border/30"
								>
									{/* Image */}
									<TableCell>
										<div className="relative h-10 w-10 overflow-hidden rounded-lg bg-secondary">
											{product.image_url ? (
												<Image
													src={product.image_url}
													alt={product.title}
													fill
													className="object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
													Img
												</div>
											)}
										</div>
									</TableCell>

									{/* Title */}
									<TableCell className="font-medium">
										{product.title}
										{product.is_featured && (
											<Badge
												variant="secondary"
												className="ml-2 text-[10px] h-5 bg-primary/10 text-primary hover:bg-primary/20"
											>
												Featured
											</Badge>
										)}
									</TableCell>

									{/* Category */}
									<TableCell className="text-muted-foreground">
										Electronics
									</TableCell>

									{/* Price */}
									<TableCell>${product.price}</TableCell>

									{/* Stock Status */}
									<TableCell>
										<Badge
											variant="outline"
											className="bg-green-500/10 text-green-600 border-none"
										>
											In Stock
										</Badge>
									</TableCell>

									{/* Actions Menu */}
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<span className="sr-only">Open menu</span>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="border-none shadow-xl bg-card"
											>
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuItem
													onClick={() => toast.info("Edit coming soon!")}
												>
													<Pencil className="mr-2 h-4 w-4" /> Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
													onClick={() => setDeleteId(product.id)} // Open Modal
												>
													<Trash2 className="mr-2 h-4 w-4" /> Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Delete Confirmation Modal */}
			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent className="border-none shadow-2xl">
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							product from your store.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="border-none bg-secondary/50">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							Delete Product
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
