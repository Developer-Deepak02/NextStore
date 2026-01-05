"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, ChevronLeft, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

// Define Category Type
type Category = {
	id: string;
	name: string;
};

const productSchema = z.object({
	title: z.string().min(2, "Title is required"),
	description: z.string().min(10, "Description must be at least 10 chars"),
	price: z.coerce.number().min(0.01, "Price must be greater than 0"),
	category_id: z.string().min(1, "Category is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProductPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	// NEW: State to store real categories
	const [categories, setCategories] = useState<Category[]>([]);

	const form = useForm<ProductFormValues>({
		resolver: zodResolver(productSchema),
	});

	// NEW: Fetch Real Categories on Load
	useEffect(() => {
		async function fetchCategories() {
			const { data } = await supabase.from("categories").select("*");
			if (data) setCategories(data);
		}
		fetchCategories();
	}, []);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const onSubmit = async (data: ProductFormValues) => {
		if (!imageFile) {
			toast.error("Please select a product image");
			return;
		}

		setLoading(true);
		try {
			// 1. Upload Image
			const fileExt = imageFile.name.split(".").pop();
			const fileName = `${Date.now()}.${fileExt}`;
			const { error: uploadError } = await supabase.storage
				.from("products")
				.upload(fileName, imageFile);

			if (uploadError) throw uploadError;

			const {
				data: { publicUrl },
			} = supabase.storage.from("products").getPublicUrl(fileName);

			// 2. Insert Product (Using the REAL category_id from form data)
			const { error: insertError } = await supabase.from("products").insert({
				title: data.title,
				description: data.description,
				price: data.price,
				category_id: data.category_id, // <--- Now uses the selected ID
				image_url: publicUrl,
				is_featured: true,
			});

			if (insertError) throw insertError;

			toast.success("Product created successfully!");
			router.push("/admin/products");
		} catch (error: any) {
			console.error("Error adding product:", error);
			toast.error("Failed to add product: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<Link href="/admin/products">
					<Button variant="ghost" size="icon">
						<ChevronLeft className="h-5 w-5" />
					</Button>
				</Link>
				<h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
			</div>

			<Card className="border-none shadow-md bg-card">
				<CardHeader>
					<CardTitle>Product Details</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Image Upload Area */}
						<div className="space-y-2">
							<Label>Product Image</Label>
							<div className="border-2 border-dashed border-input bg-secondary/20 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary/40 transition-colors relative h-48">
								<input
									type="file"
									accept="image/*"
									className="absolute inset-0 opacity-0 cursor-pointer"
									onChange={handleImageChange}
								/>
								{previewUrl ? (
									<div className="relative h-full w-full">
										<Image
											src={previewUrl}
											alt="Preview"
											fill
											className="object-contain rounded-lg"
										/>
										<Button
											type="button"
											variant="destructive"
											size="icon"
											className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
											onClick={(e) => {
												e.preventDefault();
												setImageFile(null);
												setPreviewUrl(null);
											}}
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
								) : (
									<>
										<div className="p-3 bg-background rounded-full shadow-sm mb-3">
											<Upload className="h-6 w-6 text-muted-foreground" />
										</div>
										<p className="text-sm font-medium">Click to upload image</p>
										<p className="text-xs text-muted-foreground mt-1">
											PNG, JPG up to 5MB
										</p>
									</>
								)}
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="title">Product Name</Label>
							<Input
								id="title"
								placeholder="e.g. Premium Wireless Headset"
								{...form.register("title")}
							/>
							{form.formState.errors.title && (
								<p className="text-sm text-red-500">
									{form.formState.errors.title.message}
								</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Describe the product features..."
								className="min-h-[100px]"
								{...form.register("description")}
							/>
							{form.formState.errors.description && (
								<p className="text-sm text-red-500">
									{form.formState.errors.description.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="price">Price ($)</Label>
								<Input
									id="price"
									type="number"
									step="0.01"
									placeholder="99.99"
									{...form.register("price")}
								/>
								{form.formState.errors.price && (
									<p className="text-sm text-red-500">
										{form.formState.errors.price.message}
									</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="category">Category</Label>
								{/* NEW: Dynamic Category Dropdown */}
								<select
									{...form.register("category_id")}
									className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<option value="">Select a category</option>
									{categories.map((cat) => (
										<option key={cat.id} value={cat.id}>
											{cat.name}
										</option>
									))}
								</select>
								{form.formState.errors.category_id && (
									<p className="text-sm text-red-500">
										{form.formState.errors.category_id.message}
									</p>
								)}
							</div>
						</div>

						<Button
							type="submit"
							className="w-full h-12 text-lg font-medium"
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
									Product...
								</>
							) : (
								"Create Product"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
