"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Category } from "@/types";
import { useEffect, useState } from "react";

interface ProductFiltersProps {
	categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// State for filters
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [priceRange, setPriceRange] = useState([0, 1000]);

	// Sync state with URL on load
	useEffect(() => {
		const cats = searchParams.get("categories")?.split(",") || [];
		setSelectedCategories(cats);

		const min = Number(searchParams.get("min")) || 0;
		const max = Number(searchParams.get("max")) || 1000;
		setPriceRange([min, max]);
	}, [searchParams]);

	// Update Filters
	const applyFilters = () => {
		const params = new URLSearchParams();
		if (selectedCategories.length > 0)
			params.set("categories", selectedCategories.join(","));
		params.set("min", priceRange[0].toString());
		params.set("max", priceRange[1].toString());

		router.push(`/products?${params.toString()}`);
	};

	const toggleCategory = (catId: string) => {
		setSelectedCategories((prev) =>
			prev.includes(catId)
				? prev.filter((id) => id !== catId)
				: [...prev, catId]
		);
	};

	return (
		<div className="space-y-8">
			{/* Categories */}
			<div>
				<h3 className="text-lg font-semibold mb-4">Categories</h3>
				<div className="space-y-3">
					{categories.map((category) => (
						<div key={category.id} className="flex items-center space-x-2">
							<Checkbox
								id={category.id}
								checked={selectedCategories.includes(category.id)}
								onCheckedChange={() => toggleCategory(category.id)}
							/>
							<Label
								htmlFor={category.id}
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								{category.name}
							</Label>
						</div>
					))}
				</div>
			</div>

			{/* Price Range */}
			<div>
				<h3 className="text-lg font-semibold mb-4">Price Range</h3>
				<Slider
					defaultValue={[0, 1000]}
					value={priceRange}
					max={1000}
					step={10}
					onValueChange={setPriceRange}
					className="mb-4"
				/>
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<span>${priceRange[0]}</span>
					<span>${priceRange[1]}</span>
				</div>
			</div>

			{/* Actions */}
			<div className="flex flex-col gap-2">
				<Button onClick={applyFilters} className="w-full">
					Apply Filters
				</Button>
				<Button
					variant="outline"
					className="w-full"
					onClick={() => {
						setSelectedCategories([]);
						setPriceRange([0, 1000]);
						router.push("/products");
					}}
				>
					Reset
				</Button>
			</div>
		</div>
	);
}
