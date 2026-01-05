"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Store, Settings, User } from "lucide-react";

export default function AdminHeader() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [initials, setInitials] = useState("AD");
	const [fullName, setFullName] = useState("Admin User");

	useEffect(() => {
		const fetchUser = async () => {
			// 1. Get Session
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session?.user) {
				const user = session.user;
				setEmail(user.email || "");

				// 2. Fetch DB Profile
				const { data: profile } = await supabase
					.from("users")
					.select("full_name")
					.eq("id", user.id)
					.single();

				// 3. Determine Name (DB -> Meta -> Email)
				let name = profile?.full_name || user.user_metadata?.full_name;
				if (!name && user.email) {
					name = user.email.split("@")[0];
				}

				if (name) {
					setFullName(name);
					// Initials Logic
					const parts = name.trim().split(" ");
					if (parts.length >= 2) {
						setInitials(`${parts[0][0]}${parts[1][0]}`.toUpperCase());
					} else {
						setInitials(name.substring(0, 2).toUpperCase());
					}
				}
			}
		};

		fetchUser();

		// Listen for future auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session) fetchUser();
		});

		return () => subscription.unsubscribe();
	}, []);

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push("/login");
	};

	return (
		<header className="flex h-16 items-center justify-between bg-card px-6 border-b border-border/40">
			<div className="font-bold text-lg text-foreground tracking-tight">
				Dashboard
			</div>

			<div className="flex items-center gap-4">
				<Link href="/">
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
					>
						<Store className="h-5 w-5" />
					</Button>
				</Link>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="relative h-10 w-10 rounded-full hover:bg-transparent"
						>
							<Avatar className="h-10 w-10 border-none bg-primary/10 transition-transform hover:scale-105">
								<AvatarFallback className="bg-primary/10 text-primary font-bold">
									{initials}
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="w-56 border-none shadow-2xl bg-card rounded-xl p-2"
						align="end"
						forceMount
					>
						<DropdownMenuLabel className="font-normal p-3">
							<div className="flex flex-col space-y-1">
								<p className="text-sm font-medium leading-none">{fullName}</p>
								<p className="text-xs leading-none text-muted-foreground opacity-70">
									{email}
								</p>
							</div>
						</DropdownMenuLabel>

						<div className="h-px bg-border/40 my-1 mx-2" />

						<DropdownMenuItem
							onClick={() => router.push("/admin/settings")}
							className="cursor-pointer rounded-lg focus:bg-primary/10 focus:text-primary py-2.5 px-3"
						>
							<Settings className="mr-2 h-4 w-4" /> My Settings
						</DropdownMenuItem>

						<DropdownMenuItem
							onClick={() => router.push("/")}
							className="cursor-pointer rounded-lg focus:bg-primary/10 focus:text-primary py-2.5 px-3"
						>
							<Store className="mr-2 h-4 w-4" /> Go to Store
						</DropdownMenuItem>

						<div className="h-px bg-border/40 my-1 mx-2" />

						<DropdownMenuItem
							onClick={handleLogout}
							className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer rounded-lg py-2.5 px-3"
						>
							<LogOut className="mr-2 h-4 w-4" /> Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
