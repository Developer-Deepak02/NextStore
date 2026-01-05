"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase"; // Import Supabase
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, Moon, Sun, Monitor, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
	const { setTheme, theme } = useTheme();
	const [loading, setLoading] = useState(false);

	// Settings State
	const [storeName, setStoreName] = useState("NextStore");
	const [supportEmail, setSupportEmail] = useState("support@nextstore.com");
	const [maintenanceMode, setMaintenanceMode] = useState(false);

	// 1. Fetch Real Settings on Load
	useEffect(() => {
		async function fetchSettings() {
			const { data } = await supabase
				.from("settings")
				.select("value")
				.eq("key", "maintenance_mode")
				.single();

			if (data) {
				setMaintenanceMode(data.value === "true");
			}
		}
		fetchSettings();
	}, []);

	// 2. Save Settings to Database
	const handleSave = async () => {
		setLoading(true);

		// Save Maintenance Mode
		const { error } = await supabase
			.from("settings")
			.update({ value: String(maintenanceMode) }) // Convert boolean to string
			.eq("key", "maintenance_mode");

		if (error) {
			toast.error("Failed to save settings");
		} else {
			toast.success("Settings saved successfully");
		}

		setLoading(false);
	};

	return (
		<div className="space-y-6 max-w-4xl">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground">Manage your store preferences.</p>
			</div>

			{/* General Store Settings (Visual Only for now) */}
			<Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
				<CardHeader>
					<CardTitle>Store Profile</CardTitle>
					<CardDescription>
						This information will be displayed publicly.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="storeName">Store Name</Label>
						<Input
							id="storeName"
							value={storeName}
							onChange={(e) => setStoreName(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="email">Support Email</Label>
						<Input
							id="email"
							type="email"
							value={supportEmail}
							onChange={(e) => setSupportEmail(e.target.value)}
						/>
					</div>
					<div className="flex items-center justify-end">
						<Button
							onClick={handleSave}
							disabled={loading}
							className="bg-primary shadow-sm border-none"
						>
							{loading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Save className="mr-2 h-4 w-4" />
							)}
							Save Changes
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Appearance */}
			<Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
				<CardHeader>
					<CardTitle>Appearance</CardTitle>
					<CardDescription>
						Customize how your admin panel looks.
					</CardDescription>
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

			{/* Danger Zone (Maintenance) */}
			<Card className="border-none shadow-md border-l-4 border-l-red-500 bg-red-500/5">
				<CardHeader>
					<div className="flex items-center gap-2 text-red-600">
						<AlertTriangle className="h-5 w-5" />
						<CardTitle>Danger Zone</CardTitle>
					</div>
					<CardDescription>Disable checkout for all customers.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between rounded-lg border border-red-200 bg-background p-4 shadow-sm dark:border-red-900/50">
						<div className="space-y-0.5">
							<Label className="text-base font-semibold">
								Maintenance Mode
							</Label>
							<p className="text-sm text-muted-foreground">
								When enabled, customers cannot place new orders.
							</p>
						</div>
						<Switch
							checked={maintenanceMode}
							onCheckedChange={setMaintenanceMode}
							className="data-[state=checked]:bg-red-600"
						/>
					</div>
				</CardContent>
			</Card>
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
