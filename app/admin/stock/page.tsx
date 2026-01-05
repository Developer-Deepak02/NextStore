"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, AlertTriangle, Save, RefreshCw, Image as ImageIcon, 
  PackagePlus, PackageX, PackageCheck 
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Product = {
  id: string;
  title: string;
  stock: number;
  image_url: string;
  category: string;
};

export default function AdminStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Bulk Selection State
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkAction, setBulkAction] = useState<'add' | 'set' | 'clear'>('add');

  useEffect(() => {
    fetchStock();
  }, []);

  async function fetchStock() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, title, stock, image_url, category")
      .order("stock", { ascending: true });

    if (error) toast.error("Failed to load inventory");
    else setProducts(data as any);
    setLoading(false);
  }

  // --- SINGLE UPDATE ---
  const handleStockChange = (id: string, newVal: string) => {
    // Constraint: Numbers only, no negatives
    if (parseInt(newVal) < 0) return;
    const val = newVal === "" ? 0 : parseInt(newVal);
    setProducts(products.map(p => p.id === id ? { ...p, stock: val } : p));
  };

  const saveStock = async (id: string, currentStock: number) => {
    setUpdating(id);
    const { error } = await supabase.from("products").update({ stock: currentStock }).eq("id", id);
    if (error) toast.error("Update failed");
    else toast.success("Stock updated");
    setUpdating(null);
  };

  // --- BULK ACTIONS ---
  const toggleSelectAll = (checked: boolean) => {
      if (checked) setSelectedProducts(filteredProducts.map(p => p.id));
      else setSelectedProducts([]);
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
      if (checked) setSelectedProducts([...selectedProducts, id]);
      else setSelectedProducts(selectedProducts.filter(pid => pid !== id));
  };

  const executeBulkUpdate = async () => {
      if (selectedProducts.length === 0) return;
      
      const amount = parseInt(bulkAmount) || 0;
      let updates = [];

      // Calculate new values locally
      const updatedProducts = products.map(p => {
          if (!selectedProducts.includes(p.id)) return p;
          
          let newStock = p.stock;
          if (bulkAction === 'set') newStock = amount;
          if (bulkAction === 'add') newStock = p.stock + amount;
          if (bulkAction === 'clear') newStock = 0;
          
          // Constraint: Prevent negative from bulk subtraction
          if (newStock < 0) newStock = 0;

          updates.push({ id: p.id, stock: newStock });
          return { ...p, stock: newStock };
      });

      // Optimistic Update
      setProducts(updatedProducts);
      setIsBulkOpen(false);
      setSelectedProducts([]);
      toast.info("Processing bulk update...");

      // Send to DB
      for (const update of updates) {
          await supabase.from("products").update({ stock: update.stock }).eq("id", update.id);
      }
      toast.success("Bulk update complete");
  };

  const filteredProducts = products.filter(p => 
      (p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter(p => p.stock < 10).length;

  return (
		<div className="space-y-6 relative">
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
					<p className="text-muted-foreground">
						Manage stock levels and availability.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={fetchStock}
						title="Refresh"
					>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
					</Button>
					<div className="relative w-64">
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

			{/* --- BULK ACTION BAR --- */}
			{selectedProducts.length > 0 && (
				<div className="sticky top-4 z-50 flex items-center justify-between gap-4 p-4 bg-primary text-primary-foreground rounded-lg shadow-xl animate-in fade-in slide-in-from-top-4">
					<span className="font-medium">
						{selectedProducts.length} items selected
					</span>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="secondary"
							onClick={() => {
								setBulkAction("add");
								setIsBulkOpen(true);
							}}
						>
							<PackagePlus className="mr-2 h-4 w-4" /> Add Stock
						</Button>
						<Button
							size="sm"
							variant="secondary"
							onClick={() => {
								setBulkAction("set");
								setIsBulkOpen(true);
							}}
						>
							<PackageCheck className="mr-2 h-4 w-4" /> Set Quantity
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => {
								setBulkAction("clear");
								setIsBulkOpen(true);
							}}
						>
							<PackageX className="mr-2 h-4 w-4" /> Mark Out of Stock
						</Button>
						<Button
							size="sm"
							variant="ghost"
							className="hover:bg-primary-foreground/20"
							onClick={() => setSelectedProducts([])}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Low Stock Alert */}
			{lowStockCount > 0 && selectedProducts.length === 0 && (
				<div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-600 animate-in fade-in slide-in-from-top-2">
					<AlertTriangle className="h-5 w-5" />
					<span className="font-medium">
						Attention needed: {lowStockCount} products are low on stock.
					</span>
				</div>
			)}

			<div className="rounded-xl bg-card/50 backdrop-blur-sm shadow-xl border-none overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-secondary/50 hover:bg-secondary/50 border-none">
							<TableHead className="w-[50px]">
								{/* Checkbox Header */}
							</TableHead>
							<TableHead className="w-[80px]">Image</TableHead>
							<TableHead>Product Name</TableHead>
							<TableHead className="w-[140px]">Status</TableHead>

							<TableHead className="w-[150px] text-right">Quantity</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							[...Array(5)].map((_, i) => (
								<TableRow key={i}>
									<TableCell
										colSpan={5}
										className="h-16 animate-pulse bg-secondary/10 border-none"
									/>
								</TableRow>
							))
						) : filteredProducts.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="h-32 text-center text-muted-foreground border-none"
								>
									No products found.
								</TableCell>
							</TableRow>
						) : (
							filteredProducts.map((product) => (
								<TableRow
									key={product.id}
									className="hover:bg-secondary/30 border-b border-border/5"
								>
									<TableCell>
										<Checkbox
											checked={selectedProducts.includes(product.id)}
											onCheckedChange={(checked) =>
												toggleSelectOne(product.id, !!checked)
											}
										/>
									</TableCell>
									<TableCell>
										<div className="h-10 w-10 rounded-md bg-secondary overflow-hidden flex items-center justify-center border border-border/50">
											{product.image_url ? (
												<img
													src={product.image_url}
													alt=""
													className="h-full w-full object-cover"
												/>
											) : (
												<ImageIcon className="h-4 w-4 text-muted-foreground" />
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="font-medium">
											{product.title || "Unnamed Product"}
										</div>
										<div className="text-xs text-muted-foreground">
											{product.category}
										</div>
									</TableCell>
									<TableCell>
										<div className="w-[120px] flex justify-center">
											{" "}
											{/* Wrap badge in fixed div */}
											{product.stock === 0 ? (
												<Badge
													variant="destructive"
													className="bg-red-500/15 text-red-600 border-none w-full justify-center"
												>
													Out of Stock
												</Badge>
											) : product.stock < 10 ? (
												<Badge
													variant="outline"
													className="bg-orange-500/15 text-orange-600 border-orange-500/20 w-full justify-center"
												>
													Low Stock
												</Badge>
											) : (
												<Badge
													variant="outline"
													className="bg-green-500/15 text-green-600 border-green-500/20 w-full justify-center"
												>
													In Stock
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-2">
											<Input
												type="number"
												min="0"
												className="w-24 text-right bg-background border-border/50 focus:ring-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
												value={product.stock.toString()}
												onChange={(e) =>
													handleStockChange(product.id, e.target.value)
												}
												onBlur={() => saveStock(product.id, product.stock)}
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														e.currentTarget.blur();
													}
												}}
											/>
											{updating === product.id && (
												<Save className="h-4 w-4 text-muted-foreground animate-pulse" />
											)}
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* --- BULK ACTION MODAL --- */}
			<Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{bulkAction === "add" && "Add Stock to Selected"}
							{bulkAction === "set" && "Set Stock for Selected"}
							{bulkAction === "clear" && "Mark Selected as Out of Stock"}
						</DialogTitle>
					</DialogHeader>

					{bulkAction !== "clear" && (
						<div className="py-4">
							<Input
								type="number"
								placeholder="Enter quantity..."
								value={bulkAmount}
								min="0"
								className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								onChange={(e) => {
									if (parseInt(e.target.value) < 0) return;
									setBulkAmount(e.target.value);
								}}
								onKeyDown={(e) => {
									if (e.key === "-" || e.key === "e") {
										e.preventDefault();
									}
								}}
								autoFocus
							/>
							<p className="text-xs text-muted-foreground mt-2">
								This will{" "}
								{bulkAction === "add"
									? "add this amount to"
									: "set this amount for"}{" "}
								{selectedProducts.length} products.
							</p>
						</div>
					)}

					{bulkAction === "clear" && (
						<p className="text-muted-foreground">
							Are you sure? This will set the stock to 0 for{" "}
							{selectedProducts.length} products.
						</p>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsBulkOpen(false)}>
							Cancel
						</Button>
						<Button onClick={executeBulkUpdate}>Confirm Update</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}