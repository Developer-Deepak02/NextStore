"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
	Save,
	Loader2,
	Moon,
	Sun,
	Monitor,
	AlertTriangle,
	Store,
	Globe,
	Phone,
	MapPin,
	Receipt,
	ShieldAlert,
	Info,
	CheckCircle2,
	XCircle,
	Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
	const { setTheme, theme } = useTheme();
	const [loading, setLoading] = useState(true);

	// Save States
	const [saving, setSaving] = useState(false);
	const [justSaved, setJustSaved] = useState(false); // New state for "Saved ✓"

	const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
	const [activeSection, setActiveSection] = useState("profile");

	const [formData, setFormData] = useState({
		storeName: "",
		supportEmail: "",
		phone: "",
		currency: "USD",
		taxId: "",
		address: "",
		maintenanceMode: false,
	});

	// Validation State
	const [errors, setErrors] = useState({ email: "", phone: "" });

	const [originalData, setOriginalData] = useState(formData);
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		fetchSettings();
		const handleScroll = () => {
			const sections = ["profile", "business", "appearance", "danger"];
			for (const section of sections) {
				const element = document.getElementById(section);
				if (element) {
					const rect = element.getBoundingClientRect();
					if (rect.top >= 0 && rect.top <= 300) {
						setActiveSection(section);
						break;
					}
				}
			}
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		// Only show bar if NOT currently showing "Saved!" success state
		if (!justSaved) {
			const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);
			setHasChanges(isDirty);
		}
	}, [formData, originalData, justSaved]);

	async function fetchSettings() {
		setLoading(true);
		const { data } = await supabase.from("settings").select("*");
		if (data) {
			const settingsMap: any = {};
			data.forEach((item) => (settingsMap[item.key] = item.value));

			const initialData = {
				storeName: settingsMap.store_name || "NextStore",
				supportEmail: settingsMap.support_email || "",
				phone: settingsMap.store_phone || "",
				currency: settingsMap.store_currency || "USD",
				taxId: settingsMap.store_tax_id || "",
				address: settingsMap.store_address || "",
				maintenanceMode: settingsMap.maintenance_mode === "true",
			};
			setFormData(initialData);
			setOriginalData(initialData);
		}
		setLoading(false);
	}

	// VALIDATION LOGIC
	const validateField = (field: string, value: string) => {
		let error = "";
		if (field === "email") {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (value && !emailRegex.test(value)) error = "Invalid email address";
		}
		if (field === "phone") {
			const phoneRegex = /^\+?[0-9\s-]{10,}$/;
			if (value && !phoneRegex.test(value)) error = "Invalid phone format";
		}
		setErrors((prev) => ({ ...prev, [field]: error }));
	};

	const handleSave = async () => {
		// Block save if errors exist
		if (errors.email || errors.phone) {
			toast.error("Please fix validation errors");
			return;
		}

		setSaving(true);
		const updates = [
			{ key: "store_name", value: formData.storeName },
			{ key: "support_email", value: formData.supportEmail },
			{ key: "store_phone", value: formData.phone },
			{ key: "store_currency", value: formData.currency },
			{ key: "store_tax_id", value: formData.taxId },
			{ key: "store_address", value: formData.address },
			{ key: "maintenance_mode", value: String(formData.maintenanceMode) },
		];

		const { error } = await supabase
			.from("settings")
			.upsert(updates, { onConflict: "key" });

		setSaving(false);

		if (error) {
			toast.error(`Failed: ${error.message}`);
		} else {
			// SUCCESS SEQUENCE
			setJustSaved(true); // Show "Saved!"
			toast.success("Settings saved");

			// Wait 2 seconds, then hide the bar
			setTimeout(() => {
				setOriginalData(formData); // This matches state, creating "Clean" state
				setJustSaved(false); // Hide bar
				setHasChanges(false);
			}, 2000);
		}
	};

	const handleMaintenanceToggle = (checked: boolean) => {
		if (checked) setIsMaintenanceModalOpen(true);
		else setFormData((prev) => ({ ...prev, maintenanceMode: false }));
	};

	const confirmMaintenance = () => {
		setFormData((prev) => ({ ...prev, maintenanceMode: true }));
		setIsMaintenanceModalOpen(false);
	};

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
			setActiveSection(id);
		}
	};

	if (loading)
		return (
			<div className="h-[50vh] flex items-center justify-center">
				<Loader2 className="animate-spin text-primary" />
			</div>
		);

	return (
		<div className="space-y-8 max-w-5xl pb-32 relative">
			{/* HEADER */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
					<p className="text-muted-foreground">
						Manage your store profile and configuration.
					</p>
				</div>
				<div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-lg border border-border/50">
					<span className="text-sm font-medium pl-2 text-muted-foreground">
						Store Status:
					</span>
					{formData.maintenanceMode ? (
						<Badge
							variant="destructive"
							className="px-3 py-1.5 text-sm gap-2 bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20 shadow-none"
						>
							<XCircle className="h-4 w-4" /> Maintenance Mode
						</Badge>
					) : (
						<Badge
							variant="outline"
							className="px-3 py-1.5 text-sm gap-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 shadow-sm transition-all"
						>
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
							</span>
							Store Live
						</Badge>
					)}
				</div>
			</div>

			<Separator className="bg-border/60" />

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* LEFT NAV */}
				<div className="hidden lg:block">
					<div className="sticky top-24 space-y-1">
						<h3 className="font-semibold mb-3 px-3 text-sm uppercase tracking-wider text-muted-foreground">
							Quick Nav
						</h3>
						<NavButton
							active={activeSection === "profile"}
							onClick={() => scrollToSection("profile")}
							label="Store Profile"
						/>
						<NavButton
							active={activeSection === "business"}
							onClick={() => scrollToSection("business")}
							label="Business Info"
						/>
						<NavButton
							active={activeSection === "appearance"}
							onClick={() => scrollToSection("appearance")}
							label="Appearance"
						/>
						<NavButton
							active={activeSection === "danger"}
							onClick={() => scrollToSection("danger")}
							label="Danger Zone"
							danger
						/>
					</div>
				</div>

				{/* RIGHT COLUMN */}
				<div className="lg:col-span-3 space-y-8">
					{/* 1. General Profile */}
					<div id="profile" className="scroll-mt-24">
						<Card className="border-none shadow-sm bg-card/50">
							<CardHeader>
								<div className="flex items-center gap-2">
									<Store className="h-5 w-5 text-primary" />
									<CardTitle>Store Profile</CardTitle>
								</div>
								<CardDescription>
									Basic information about your store.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid gap-2">
									<Label className="font-medium">Store Name</Label>
									<Input
										value={formData.storeName}
										onChange={(e) =>
											setFormData({ ...formData, storeName: e.target.value })
										}
									/>
								</div>
								<div className="grid md:grid-cols-2 gap-4">
									<div className="grid gap-2">
										<Label className="font-medium">Support Email</Label>
										<div className="relative">
											<Input
												value={formData.supportEmail}
												className={
													errors.email
														? "border-red-500 pr-10"
														: formData.supportEmail && !errors.email
														? "border-green-500/50 pr-10"
														: ""
												}
												onChange={(e) =>
													setFormData({
														...formData,
														supportEmail: e.target.value,
													})
												}
												onBlur={(e) => validateField("email", e.target.value)}
											/>
											{formData.supportEmail && !errors.email && (
												<CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500 animate-in zoom-in" />
											)}
										</div>
										{errors.email && (
											<p className="text-xs text-red-500 font-medium">
												{errors.email}
											</p>
										)}
									</div>
									<div className="grid gap-2">
										<Label className="font-medium">Phone Number</Label>
										<div className="relative">
											<Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
											<Input
												className={`pl-9 ${
													errors.phone
														? "border-red-500"
														: formData.phone && !errors.phone
														? "border-green-500/50"
														: ""
												}`}
												placeholder="+91 98765 43210"
												value={formData.phone}
												onChange={(e) =>
													setFormData({ ...formData, phone: e.target.value })
												}
												onBlur={(e) => validateField("phone", e.target.value)}
											/>
											{formData.phone && !errors.phone && (
												<CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500 animate-in zoom-in" />
											)}
										</div>
										{errors.phone && (
											<p className="text-xs text-red-500 font-medium">
												{errors.phone}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* 2. Business Details */}
					<div id="business" className="scroll-mt-24">
						<Card className="border-none shadow-sm bg-card/50">
							<CardHeader>
								<div className="flex items-center gap-2">
									<Receipt className="h-5 w-5 text-primary" />
									<CardTitle>Business Details</CardTitle>
								</div>
								<CardDescription>
									Legal and location information for invoices.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid md:grid-cols-2 gap-4">
									<div className="grid gap-2">
										<div className="flex items-center gap-2">
											<Label className="font-medium">Currency</Label>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger>
														<Info className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors cursor-help" />
													</TooltipTrigger>
													<TooltipContent>
														<p>Used for all prices. e.g., USD, INR</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
										<div className="relative">
											<Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
											<Input
												className="pl-9 uppercase"
												placeholder="USD, INR"
												maxLength={3}
												value={formData.currency}
												onChange={(e) =>
													setFormData({
														...formData,
														currency: e.target.value.toUpperCase(),
													})
												}
											/>
										</div>
									</div>
									<div className="grid gap-2">
										<div className="flex items-center gap-2">
											<Label className="font-medium">Tax / GST ID</Label>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger>
														<Info className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors cursor-help" />
													</TooltipTrigger>
													<TooltipContent>
														<p>Required for tax invoices (GSTIN/VAT)</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
										<Input
											placeholder="GSTIN123456789"
											value={formData.taxId}
											onChange={(e) =>
												setFormData({
													...formData,
													taxId: e.target.value.toUpperCase(),
												})
											}
										/>
									</div>
								</div>
								<div className="grid gap-2">
									<Label className="font-medium">Store Address</Label>
									<div className="relative">
										<MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Textarea
											className="pl-9 min-h-[80px] resize-none"
											placeholder="123 Market St, City, Country"
											value={formData.address}
											onChange={(e) =>
												setFormData({ ...formData, address: e.target.value })
											}
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* 3. Appearance */}
					<div id="appearance" className="scroll-mt-24">
						<Card className="border-none shadow-sm bg-card/50">
							<CardHeader>
								<div className="flex items-center gap-2">
									<Monitor className="h-5 w-5 text-primary" />
									<CardTitle>Appearance</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-3 gap-4">
									<ThemeCard
										label="Light"
										icon={Sun}
										active={theme === "light"}
										onClick={() => setTheme("light")}
									/>
									<ThemeCard
										label="Dark"
										icon={Moon}
										active={theme === "dark"}
										onClick={() => setTheme("dark")}
									/>
									<ThemeCard
										label="System"
										icon={Monitor}
										active={theme === "system"}
										onClick={() => setTheme("system")}
									/>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* 4. Danger Zone */}
					<div id="danger" className="scroll-mt-24">
						<Card className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
							<CardHeader>
								<div className="flex items-center gap-2 text-red-600 dark:text-red-400">
									<ShieldAlert className="h-5 w-5" />
									<CardTitle>Danger Zone</CardTitle>
								</div>
								<CardDescription>
									Manage access and critical store functions.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between rounded-lg border border-red-200 bg-background p-4 shadow-sm dark:border-red-900/50">
									<div className="space-y-0.5">
										<Label className="text-base font-semibold">
											Maintenance Mode
										</Label>
										<p className="text-sm text-muted-foreground">
											Disable checkout temporarily. Useful for inventory
											updates.
										</p>
									</div>
									<Switch
										checked={formData.maintenanceMode}
										onCheckedChange={handleMaintenanceToggle}
										className="data-[state=checked]:bg-red-600"
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* STICKY SAVE BAR */}
			<div
				className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 transition-all duration-500 transform ${
					hasChanges || justSaved
						? "translate-y-0 opacity-100"
						: "translate-y-20 opacity-0 pointer-events-none"
				}`}
			>
				<div className="bg-foreground text-background rounded-full shadow-2xl px-6 py-3 flex items-center justify-between border border-border/20 overflow-hidden relative">
					{/* SAVED OVERLAY (Animation) */}
					<div
						className={`absolute inset-0 bg-green-600 flex items-center justify-center gap-2 text-white font-bold transition-transform duration-300 ${
							justSaved ? "translate-y-0" : "translate-y-full"
						}`}
					>
						<Check className="h-5 w-5" /> Saved Successfully
					</div>

					<span className="font-medium flex items-center gap-2 text-sm">
						<AlertTriangle className="h-4 w-4 text-orange-400" />
						Unsaved changes
					</span>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							className="h-8 px-4 text-background hover:text-background/80 hover:bg-white/10 rounded-full"
							onClick={() => setFormData(originalData)}
						>
							Reset
						</Button>
						<Button
							size="sm"
							onClick={handleSave}
							disabled={saving}
							className="h-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 transition-transform active:scale-95"
						>
							{saving ? (
								<Loader2 className="mr-2 h-3 w-3 animate-spin" />
							) : (
								<Save className="mr-2 h-3 w-3" />
							)}
							Save Changes
						</Button>
					</div>
				</div>
			</div>

			<Dialog
				open={isMaintenanceModalOpen}
				onOpenChange={setIsMaintenanceModalOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-red-600">
							<AlertTriangle className="h-5 w-5" />
							Enable Maintenance Mode?
						</DialogTitle>
						<DialogDescription className="pt-2">
							This will disable checkout for all customers. Your store will
							basically be "closed" until you turn this off.
							<br />
							<br />
							Are you sure you want to proceed?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="ghost"
							onClick={() => setIsMaintenanceModalOpen(false)}
						>
							Cancel
						</Button>
						<Button variant="destructive" onClick={confirmMaintenance}>
							Yes, Enable Maintenance
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function ThemeCard({ label, icon: Icon, active, onClick }: any) {
	return (
		<div
			onClick={onClick}
			className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all hover:bg-accent ${
				active
					? "border-primary bg-primary/5"
					: "border-transparent bg-secondary/50"
			}`}
		>
			<Icon
				className={`h-6 w-6 ${
					active ? "text-primary" : "text-muted-foreground"
				}`}
			/>
			<span
				className={`text-sm font-medium ${
					active ? "text-primary" : "text-muted-foreground"
				}`}
			>
				{label}
			</span>
		</div>
	);
}

function NavButton({ active, onClick, label, danger }: any) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border-l-2",
				active
					? "bg-secondary text-primary border-primary"
					: "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50",
				danger &&
					"text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
			)}
		>
			{label}
		</button>
	);
}
