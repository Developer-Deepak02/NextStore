"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Plus,
	Trash2,
	TicketPercent,
	MoreVertical,
	Search,
	Wand2,
	Power,
	Download,
	AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format, isPast } from "date-fns";

type Coupon = {
	id: string;
	code: string;
	discount_percent: number;
	discount_type: "percent" | "fixed";
	min_order_value: number;
	max_discount: number | null;
	valid_until: string;
	is_active: boolean;
	usage_limit: number | null;
	times_used: number;
	created_at: string;
};

export default function AdminCouponsPage() {
	const supabase = createClient();

	const [coupons, setCoupons] = useState<Coupon[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [search, setSearch] = useState("");
	const [showAdvanced, setShowAdvanced] = useState(false);

	const [formData, setFormData] = useState({
		code: "",
		discount: 10,
		type: "percent" as "percent" | "fixed",
		validUntil: "",
		minOrder: 0,
		maxDiscount: "",
		usageLimit: "",
	});

	useEffect(() => {
		fetchCoupons();
	}, []);

	async function fetchCoupons() {
		setLoading(true);

		const { data: couponsData, error: couponErr } = await supabase
			.from("coupons")
			.select("*")
			.order("created_at", { ascending: false });

		if (couponErr) {
			toast.error(couponErr.message || "Failed to load coupons");
			setLoading(false);
			return;
		}

		const { data: ordersData, error: orderErr } = await supabase
			.from("orders")
			.select("coupon_code, status")
			.not("coupon_code", "is", null);

		if (orderErr) {
			console.warn("Orders fetch failed:", orderErr.message);
		}

		const enrichedCoupons = (couponsData || []).map((coupon: any) => {
			const timesUsed = ordersData
				? ordersData.filter(
						(order: any) =>
							order.coupon_code &&
							order.coupon_code.trim().toUpperCase() ===
								coupon.code.trim().toUpperCase() &&
							order.status !== "cancelled"
				  ).length
				: 0;

			return {
				...coupon,
				times_used: timesUsed,
			};
		});

		setCoupons(enrichedCoupons);
		setLoading(false);
	}

	const generateCode = () => {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		let result = "";
		for (let i = 0; i < 8; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		setFormData({ ...formData, code: result });
	};

	const handleCreate = async () => {
		if (!formData.code || !formData.validUntil) {
			toast.error("Code and expiry date are required");
			return;
		}

		if (new Date(formData.validUntil) < new Date()) {
			toast.error("Expiry date cannot be in the past");
			return;
		}

		setCreating(true);

		const { error } = await supabase.from("coupons").insert({
			code: formData.code.trim().toUpperCase(),
			discount_percent: formData.discount,
			discount_type: formData.type,
			valid_until: new Date(formData.validUntil).toISOString(),
			min_order_value: formData.minOrder,
			max_discount: formData.maxDiscount
				? parseFloat(formData.maxDiscount)
				: null,
			usage_limit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
			is_active: true,
		});

		if (error) {
			toast.error(error.message);
		} else {
			toast.success("Coupon created successfully");
			setIsModalOpen(false);
			resetForm();
			fetchCoupons();
		}

		setCreating(false);
	};

	const resetForm = () => {
		setFormData({
			code: "",
			discount: 10,
			type: "percent",
			validUntil: "",
			minOrder: 0,
			maxDiscount: "",
			usageLimit: "",
		});
		setShowAdvanced(false);
	};

	const toggleStatus = async (id: string, currentStatus: boolean) => {
		const { error } = await supabase
			.from("coupons")
			.update({ is_active: !currentStatus })
			.eq("id", id);

		if (!error) {
			setCoupons((prev) =>
				prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
			);
			toast.success(currentStatus ? "Coupon disabled" : "Coupon enabled");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this coupon?")) return;

		const { error } = await supabase.from("coupons").delete().eq("id", id);

		if (!error) {
			setCoupons((prev) => prev.filter((c) => c.id !== id));
			toast.success("Coupon deleted");
		}
	};

	const filteredCoupons = coupons.filter((c) =>
		c.code.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="space-y-6">
			{/* HEADER */}
			<div className="flex flex-col sm:flex-row justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Coupons</h1>
					<p className="text-muted-foreground">
						Manage discount codes and promotions.
					</p>
				</div>

				<div className="flex gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search code..."
							className="pl-9"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Create Coupon
							</Button>
						</DialogTrigger>

						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create Coupon</DialogTitle>
							</DialogHeader>

							<div className="grid gap-4">
								<Label>Code</Label>
								<div className="flex gap-2">
									<Input
										value={formData.code}
										onChange={(e) =>
											setFormData({ ...formData, code: e.target.value })
										}
									/>
									<Button variant="ghost" onClick={generateCode}>
										<Wand2 className="h-4 w-4" />
									</Button>
								</div>

								<Label>Discount</Label>
								<Input
									type="number"
									value={formData.discount}
									onChange={(e) =>
										setFormData({
											...formData,
											discount: Number(e.target.value),
										})
									}
								/>

								<Label>Expiry</Label>
								<Input
									type="datetime-local"
									value={formData.validUntil}
									onChange={(e) =>
										setFormData({ ...formData, validUntil: e.target.value })
									}
								/>
							</div>

							<DialogFooter>
								<Button onClick={handleCreate} disabled={creating}>
									{creating ? "Creating..." : "Create"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
			<div className="rounded-xl overflow-hidden bg-card/60 backdrop-blur-sm">
				<Table className="w-full border-separate border-spacing-0">
					{/* HEADER */}
					<TableHeader>
						<TableRow className="bg-secondary/30 hover:bg-secondary/30">
							<TableHead className="pl-4">Coupon</TableHead>
							<TableHead>Value</TableHead>
							<TableHead>Usage</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right pr-4">Actions</TableHead>
						</TableRow>
					</TableHeader>

					{/* BODY */}
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="py-10 text-center text-muted-foreground"
								>
									Loading...
								</TableCell>
							</TableRow>
						) : filteredCoupons.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="py-10 text-center text-muted-foreground"
								>
									No coupons found
								</TableCell>
							</TableRow>
						) : (
							filteredCoupons.map((coupon) => {
								const expired = isPast(new Date(coupon.valid_until));
								const percentUsed = coupon.usage_limit
									? Math.min(
											100,
											(coupon.times_used / coupon.usage_limit) * 100
									  )
									: 0;

								return (
									<TableRow
										key={coupon.id}
										className="hover:bg-secondary/20 transition-colors"
									>
										{/* COUPON */}
										<TableCell className="pl-4">
											<div className="flex items-center gap-3">
												<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
													%
												</div>
												<div className="flex flex-col">
													<span className="font-medium">{coupon.code}</span>
													<span className="text-xs text-muted-foreground">
														Expires{" "}
														{format(
															new Date(coupon.valid_until),
															"dd MMM yyyy"
														)}
													</span>
												</div>
											</div>
										</TableCell>

										{/* VALUE */}
										<TableCell>
											<Badge className="bg-primary/10 text-primary">
												{coupon.discount_type === "percent"
													? `${coupon.discount_percent}% OFF`
													: `₹${coupon.discount_percent} OFF`}
											</Badge>
										</TableCell>

										{/* USAGE */}
										<TableCell className="w-[220px]">
											<div className="flex justify-between text-xs mb-1">
												<span>
													{coupon.times_used}
													{coupon.usage_limit
														? ` / ${coupon.usage_limit}`
														: " / ∞"}
												</span>
												{coupon.usage_limit && (
													<span className="text-muted-foreground">
														{percentUsed.toFixed(0)}%
													</span>
												)}
											</div>

											<div className="h-2 w-full rounded-full bg-secondary/40 overflow-hidden">
												<div
													className={`h-full transition-all ${
														coupon.usage_limit &&
														coupon.times_used >= coupon.usage_limit
															? "bg-red-500"
															: "bg-primary"
													}`}
													style={{
														width: coupon.usage_limit
															? `${percentUsed}%`
															: "100%",
													}}
												/>
											</div>
										</TableCell>

										{/* STATUS */}
										<TableCell>
											{expired ? (
												<Badge className="bg-red-500/10 text-red-600">
													Expired
												</Badge>
											) : coupon.is_active ? (
												<Badge className="bg-green-500/10 text-green-600">
													Active
												</Badge>
											) : (
												<Badge className="bg-yellow-500/10 text-yellow-600">
													Disabled
												</Badge>
											)}
										</TableCell>

										{/* ACTIONS — ALWAYS VISIBLE */}
										<TableCell className="text-right pr-4">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="hover:bg-secondary"
													>
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>

												<DropdownMenuContent align="end">
													{!expired && (
														<DropdownMenuItem
															onClick={() =>
																toggleStatus(coupon.id, coupon.is_active)
															}
														>
															<Power className="mr-2 h-4 w-4" />
															{coupon.is_active ? "Disable" : "Enable"}
														</DropdownMenuItem>
													)}
													<DropdownMenuItem
														className="text-red-500"
														onClick={() => handleDelete(coupon.id)}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
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
