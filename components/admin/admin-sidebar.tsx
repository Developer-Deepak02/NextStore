"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/lib/admin-store"; 
import {
	LayoutDashboard,
	ShoppingBag,
	Users,
	Package,
	TicketPercent,
	Settings,
	Menu,
	X,
	LogOut,
	ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminSidebar() {
	const pathname = usePathname();

	// Replace local state with Global Store
	const { isCollapsed, toggleCollapsed } = useAdminStore();
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	const routes = [
		{ label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
		{ label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
		{ label: "Products", icon: Package, href: "/admin/products" },
		{ label: "Stock", icon: Package, href: "/admin/stock" },
		{ label: "Users", icon: Users, href: "/admin/users" },
		{ label: "Coupons", icon: TicketPercent, href: "/admin/coupons" },
		{ label: "Settings", icon: Settings, href: "/admin/settings" },
	];

	return (
		<>
			{/* Mobile Trigger */}
			<div className="md:hidden flex items-center p-4 bg-background border-b">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setIsMobileOpen(!isMobileOpen)}
				>
					<Menu />
				</Button>
				<span className="ml-2 font-bold text-lg">Admin Panel</span>
			</div>

			{/* Sidebar Container */}
			<div
				className={cn(
					"fixed inset-y-0 left-0 z-50 flex-col bg-card shadow-xl transition-all duration-300 ease-in-out md:flex",
					isCollapsed ? "w-[80px]" : "w-72",
					isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
				)}
			>
				{/* Header */}
				<div
					className={cn(
						"h-16 flex items-center px-6 mb-4",
						isCollapsed ? "justify-center px-2" : "justify-between"
					)}
				>
					{!isCollapsed && (
						<span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
							Admin
						</span>
					)}

					<Button
						variant="ghost"
						size="icon"
						className="hidden md:flex"
						onClick={toggleCollapsed}
					>
						<ChevronLeft
							className={cn(
								"h-5 w-5 transition-transform",
								isCollapsed && "rotate-180"
							)}
						/>
					</Button>

					<Button
						variant="ghost"
						size="icon"
						className="md:hidden ml-auto"
						onClick={() => setIsMobileOpen(false)}
					>
						<X />
					</Button>
				</div>

				{/* Navigation */}
				<div className="flex-1 overflow-y-auto py-2">
					<nav className="grid gap-2 px-3">
						{routes.map((route) => (
							<Link
								key={route.href}
								href={route.href}
								className={cn(
									"flex items-center rounded-xl transition-all duration-200 group",
									isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3",
									pathname === route.href
										? "bg-primary text-primary-foreground shadow-md"
										: "text-muted-foreground hover:bg-secondary/80 hover:text-primary"
								)}
							>
								<route.icon className={cn("h-5 w-5 flex-shrink-0")} />
								{!isCollapsed && (
									<span className="font-medium whitespace-nowrap">
										{route.label}
									</span>
								)}

								{isCollapsed && (
									<div className="absolute left-full ml-2 hidden rounded-md bg-foreground px-2 py-1 text-xs text-background group-hover:block z-50 whitespace-nowrap">
										{route.label}
									</div>
								)}
							</Link>
						))}
					</nav>
				</div>

				{/* Footer / Logout */}
				<div className="p-4 mt-auto border-t border-border/50">
					<Link href="/">
						<button
							className={cn(
								"flex items-center w-full rounded-xl transition-all duration-200 group border border-transparent",
								"hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400",
								isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3"
							)}
						>
							<LogOut className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
							{!isCollapsed && <span className="font-medium">Log Out</span>}
						</button>
					</Link>
				</div>
			</div>

			{/* Mobile Overlay */}
			{isMobileOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 md:hidden"
					onClick={() => setIsMobileOpen(false)}
				/>
			)}
		</>
	);
}
