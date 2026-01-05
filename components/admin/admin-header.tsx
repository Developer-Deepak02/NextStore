"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminHeader() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="sticky top-0 z-40 flex h-16 items-center justify-end gap-4 bg-transparent px-6 py-4">
			{/* Simple One-Click Theme Toggle */}
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
				className="rounded-full bg-background shadow-sm hover:bg-secondary"
			>
				{mounted && theme === "dark" ? (
					<Sun className="h-5 w-5 text-yellow-500" />
				) : (
					<Moon className="h-5 w-5 text-indigo-500" />
				)}
			</Button>

			{/* Notification Bell (Optional Polish) */}
			<Button
				variant="ghost"
				size="icon"
				className="rounded-full bg-background shadow-sm hover:bg-secondary"
			>
				<Bell className="h-5 w-5" />
			</Button>

			{/* Admin Profile */}
			<div className="flex items-center gap-3 pl-2">
				<div className="text-right hidden sm:block">
					<p className="text-sm font-medium leading-none">Admin User</p>
					<p className="text-xs text-muted-foreground">admin@nextstore.com</p>
				</div>
				<Avatar className="h-9 w-9 border-2 border-primary/10">
					<AvatarImage src="https://github.com/shadcn.png" />
					<AvatarFallback>AD</AvatarFallback>
				</Avatar>
			</div>
		</div>
	);
}
