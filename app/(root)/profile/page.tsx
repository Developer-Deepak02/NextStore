"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
	User,
	Mail,
	Phone,
	MapPin,
	Save,
	Loader2,
	Pencil,
	Building2,
	Globe,
	Star,
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ProfilePage() {
	const router = useRouter();
	const supabase = createClient();
	const [isPending, startTransition] = useTransition();
	const [loading, setLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);

	// User State
	const [user, setUser] = useState<any>(null);
	const [formData, setFormData] = useState({
		full_name: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		zip_code: "",
		country: "India",
	});

	useEffect(() => {
		async function getUser() {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				router.push("/login");
				return;
			}

			setUser(user);

			const { data: profile } = await supabase
				.from("users")
				.select("*")
				.eq("id", user.id)
				.single();

			if (profile) {
				setFormData({
					full_name: profile.full_name || "",
					email: user.email || "",
					phone: profile.phone || "",
					address: profile.address || "",
					city: profile.city || "",
					zip_code: profile.zip_code || "",
					country: profile.country || "India",
				});
			} else {
				setFormData((prev) => ({ ...prev, email: user.email || "" }));
			}

			setLoading(false);
		}

		getUser();
	}, [router]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSave = async () => {
		if (!user) return;

		startTransition(async () => {
			const { error } = await supabase.from("users").upsert({
				id: user.id,
				full_name: formData.full_name,
				phone: formData.phone,
				address: formData.address,
				city: formData.city,
				zip_code: formData.zip_code,
				country: formData.country,
			});

			if (error) {
				console.error(error);
				toast.error("Failed to update profile.");
			} else {
				toast.success("Profile updated successfully!");
				setIsEditing(false);
				router.refresh();
			}
		});
	};

	if (loading) {
		return (
			<div className="flex h-[80vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="container max-w-5xl py-10 px-4 md:px-6">
			{/* Page Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Account Settings
					</h1>
					<p className="text-muted-foreground mt-1">
						Manage your profile and default shipping preferences.
					</p>
				</div>
				<Button
					variant={isEditing ? "secondary" : "default"}
					onClick={() => (isEditing ? setIsEditing(false) : setIsEditing(true))}
				>
					{isEditing ? (
						"Cancel"
					) : (
						<>
							<Pencil className="mr-2 h-4 w-4" /> Edit Profile
						</>
					)}
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-12 gap-8">
				{/* LEFT COLUMN: Identity Card (Span 4) */}
				<div className="md:col-span-4 space-y-6">
					<Card className="border-border/50 bg-card shadow-lg shadow-black/5 overflow-hidden">
						<div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
						<CardContent className="text-center relative pt-0">
							<div className="mx-auto -mt-16 mb-4 relative h-32 w-32">
								<Avatar className="h-32 w-32 border-4 border-card shadow-lg">
									<AvatarImage src="" />
									<AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
										{formData.full_name
											? formData.full_name.charAt(0).toUpperCase()
											: "U"}
									</AvatarFallback>
								</Avatar>
							</div>
							<h2 className="text-xl font-bold">
								{formData.full_name || "Guest User"}
							</h2>
							<p className="text-sm text-muted-foreground mb-4">
								{formData.email}
							</p>

							<div className="flex justify-center gap-2">
								<Badge variant="secondary" className="font-normal">
									Customer
								</Badge>
								<Badge
									variant="outline"
									className="border-green-500/30 text-green-500 bg-green-500/5"
								>
									Verified
								</Badge>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* RIGHT COLUMN: Details Form (Span 8) */}
				<div className="md:col-span-8">
					<Card className="border-border/50 bg-card shadow-lg shadow-black/5">
						<CardHeader>
							<CardTitle>Profile Details</CardTitle>
							<CardDescription>
								Update your personal information to streamline your checkout
								experience.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-8">
							{/* SECTION 1: Personal & Contact */}
							<section className="space-y-4">
								<h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
									<User className="h-4 w-4" /> Personal Information
								</h3>
								<Separator />

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label htmlFor="full_name">Full Name</Label>
										<Input
											id="full_name"
											name="full_name"
											value={formData.full_name}
											onChange={handleChange}
											disabled={!isEditing}
											className={
												!isEditing ? "bg-muted/50 border-transparent" : ""
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email Address</Label>
										<div className="relative">
											<Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
											<Input
												id="email"
												value={formData.email}
												disabled
												className="pl-9 bg-muted/50 border-transparent cursor-not-allowed"
											/>
										</div>
									</div>
									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="phone">Phone Number</Label>
										<div className="relative">
											<Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
											<Input
												id="phone"
												name="phone"
												placeholder="+91 98765 43210"
												value={formData.phone}
												onChange={handleChange}
												disabled={!isEditing}
												className={`pl-9 ${
													!isEditing ? "bg-muted/50 border-transparent" : ""
												}`}
											/>
										</div>
									</div>
								</div>
							</section>

							{/* SECTION 2: Shipping Address */}
							<section className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
										<MapPin className="h-4 w-4" /> Shipping Address
									</h3>
									{/* DEFAULT BADGE INDICATOR */}
									{!isEditing && formData.address && (
										<Badge
											variant="secondary"
											className="flex items-center gap-1 text-xs"
										>
											<Star className="h-3 w-3 fill-primary text-primary" />{" "}
											Default
										</Badge>
									)}
								</div>
								<Separator />

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="address">Street Address</Label>
										<Input
											id="address"
											name="address"
											placeholder="123 Main St, Apt 4B"
											value={formData.address}
											onChange={handleChange}
											disabled={!isEditing}
											className={
												!isEditing ? "bg-muted/50 border-transparent" : ""
											}
										/>
									</div>

									<div className="grid grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label htmlFor="city">City</Label>
											<div className="relative">
												<Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
												<Input
													id="city"
													name="city"
													value={formData.city}
													onChange={handleChange}
													disabled={!isEditing}
													className={`pl-9 ${
														!isEditing ? "bg-muted/50 border-transparent" : ""
													}`}
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="zip_code">Zip Code</Label>
											<Input
												id="zip_code"
												name="zip_code"
												value={formData.zip_code}
												onChange={handleChange}
												disabled={!isEditing}
												className={
													!isEditing ? "bg-muted/50 border-transparent" : ""
												}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="country">Country</Label>
										<div className="relative">
											<Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
											<Input
												id="country"
												name="country"
												value={formData.country}
												onChange={handleChange}
												disabled={!isEditing}
												className={`pl-9 ${
													!isEditing ? "bg-muted/50 border-transparent" : ""
												}`}
											/>
										</div>
									</div>
								</div>
							</section>

							{/* Action Buttons */}
							{isEditing && (
								<div className="flex justify-end gap-3 pt-4 border-t border-border/50">
									<Button variant="ghost" onClick={() => setIsEditing(false)}>
										Cancel
									</Button>
									<Button
										onClick={handleSave}
										disabled={isPending}
										className="px-8"
									>
										{isPending ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<Save className="mr-2 h-4 w-4" />
										)}
										Save Changes
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
