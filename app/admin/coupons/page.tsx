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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, TicketPercent, Calendar } from "lucide-react";
import { toast } from "sonner";

type Coupon = {
	id: string;
	code: string;
	discount_percent: number;
	valid_until: string;
	is_active: boolean;
};

export default function AdminCouponsPage() {
	const [coupons, setCoupons] = useState<Coupon[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [creating, setCreating] = useState(false);

	// Form State
	const [newCoupon, setNewCoupon] = useState({
		code: "",
		discount: 10,
		validUntil: "",
	});

	useEffect(() => {
		fetchCoupons();
	}, []);

	async function fetchCoupons() {
		setLoading(true);
		const { data } = await supabase
			.from("coupons")
			.select("*")
			.order("created_at", { ascending: false });

		if (data) setCoupons(data);
		setLoading(false);
	}

	// Create Coupon Logic
	const handleCreate = async () => {
		if (!newCoupon.code || !newCoupon.validUntil) {
			toast.error("Please fill in all fields");
			return;
		}

		setCreating(true);
		const { data, error } = await supabase
			.from("coupons")
			.insert({
				code: newCoupon.code.toUpperCase(),
				discount_percent: newCoupon.discount,
				valid_until: new Date(newCoupon.validUntil).toISOString(),
			})
			.select()
			.single();

		if (error) {
			toast.error(error.message);
		} else {
			setCoupons([data, ...coupons]);
			toast.success("Coupon created successfully");
			setIsModalOpen(false);
			setNewCoupon({ code: "", discount: 10, validUntil: "" });
		}
		setCreating(false);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this coupon?")) return;

		const { error } = await supabase.from("coupons").delete().eq("id", id);
		if (!error) {
			setCoupons(coupons.filter((c) => c.id !== id));
			toast.success("Coupon deleted");
		} else {
			toast.error("Failed to delete");
		}
	};

	// Safe Date Formatter to prevent Hydration Errors
	const formatDate = (dateString: string) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
					<p className="text-muted-foreground">
						Manage discount codes for your store.
					</p>
				</div>

				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogTrigger asChild>
						<Button className="bg-primary hover:bg-primary/90 shadow-md border-none">
							<Plus className="mr-2 h-4 w-4" /> Create Coupon
						</Button>
					</DialogTrigger>
					<DialogContent className="border-none shadow-2xl bg-card">
						<DialogHeader>
							<DialogTitle>Create New Coupon</DialogTitle>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label>Coupon Code</Label>
								<Input
									placeholder="e.g. SUMMER25"
									value={newCoupon.code}
									onChange={(e) =>
										setNewCoupon({ ...newCoupon, code: e.target.value })
									}
									className="uppercase"
								/>
							</div>
							<div className="grid gap-2">
								<Label>Discount Percentage (%)</Label>
								<Input
									type="number"
									min="1"
									max="100"
									value={newCoupon.discount}
									onChange={(e) =>
										setNewCoupon({
											...newCoupon,
											discount: parseInt(e.target.value),
										})
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label>Valid Until</Label>
								<Input
									type="datetime-local"
									value={newCoupon.validUntil}
									onChange={(e) =>
										setNewCoupon({ ...newCoupon, validUntil: e.target.value })
									}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button onClick={handleCreate} disabled={creating}>
								{creating ? "Creating..." : "Create Coupon"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<div className="rounded-xl bg-card/50 backdrop-blur-sm shadow-md overflow-hidden border-none">
				<Table>
					<TableHeader>
						<TableRow className="bg-secondary/50 hover:bg-secondary/50 border-none">
							<TableHead>Code</TableHead>
							<TableHead>Discount</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Expires</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							[...Array(3)].map((_, i) => (
								<TableRow key={i} className="border-b-0">
									<TableCell>
										<div className="h-4 w-24 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-12 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-16 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell>
										<div className="h-4 w-32 bg-secondary/50 rounded animate-pulse" />
									</TableCell>
									<TableCell />
								</TableRow>
							))
						) : coupons.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="h-32 text-center text-muted-foreground"
								>
									No coupons found. Create one to get started!
								</TableCell>
							</TableRow>
						) : (
							coupons.map((coupon) => {
								const isExpired = new Date(coupon.valid_until) < new Date();
								return (
									<TableRow
										key={coupon.id}
										className="hover:bg-secondary/30 transition-colors border-b-border/30"
									>
										<TableCell className="font-mono font-bold text-lg tracking-wide text-primary">
											{coupon.code}
										</TableCell>
										<TableCell>
											<Badge
												variant="secondary"
												className="bg-primary/10 text-primary"
											>
												<TicketPercent className="w-3 h-3 mr-1" />{" "}
												{coupon.discount_percent}% OFF
											</Badge>
										</TableCell>
										<TableCell>
											{isExpired ? (
												<Badge
													variant="outline"
													className="text-red-500 border-red-500/30 bg-red-500/10"
												>
													Expired
												</Badge>
											) : (
												<Badge
													variant="outline"
													className="text-green-600 border-green-500/30 bg-green-500/10"
												>
													Active
												</Badge>
											)}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm flex items-center gap-2">
											<Calendar className="w-3 h-3" />
											{/* Safe Date Format */}
											{formatDate(coupon.valid_until)}
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="icon"
												className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
												onClick={() => handleDelete(coupon.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
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
