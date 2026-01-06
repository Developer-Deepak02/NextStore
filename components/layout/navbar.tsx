"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	ShoppingCart,
	Search,
	Moon,
	Sun,
	Menu,
	Package2,
	User,
	LogOut,
	Settings,
	Heart, 
	MapPin, 
	LifeBuoy, 
	LayoutDashboard, 
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useStoreSettings } from "@/hooks/use-store-settings";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const cartItems = useCart((state) => state.items);
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");

	const { settings } = useStoreSettings();

	const [user, setUser] = useState<any>(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const supabase = createClient();

	useEffect(() => {
		setMounted(true);
		checkUser();
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(() => {
			checkUser();
		});
		return () => subscription.unsubscribe();
	}, []);

	async function checkUser() {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		setUser(user);
		if (user) {
			const { data: roleData } = await supabase
				.from("users")
				.select("role")
				.eq("id", user.id)
				.single();
			setIsAdmin(roleData?.role === "admin");
		}
	}

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push("/");
		router.refresh();
	};

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
		}
	};

	const links = [
		{ name: "Home", href: "/" },
		{ name: "Products", href: "/products" },
		{ name: "Categories", href: "/category" },
	];

	return (
		<header className="sticky top-0 z-50 w-full">
			<nav className="w-full bg-background/80 backdrop-blur-md border-b border-border/40 transition-colors duration-500">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						{/* Left Side - Dynamic Store Name */}
						<div className="flex items-center gap-2">
							<Sheet>
								<SheetTrigger asChild>
									<button className="md:hidden rounded-full p-2 text-muted-foreground hover:bg-accent transition">
										<Menu className="h-5 w-5" />
									</button>
								</SheetTrigger>
								<SheetContent side="top" className="w-full h-[400px]">
									<SheetTitle className="sr-only">Mobile Menu</SheetTitle>
									<div className="flex flex-col items-center justify-center h-full gap-6">
										{links.map((link) => (
											<Link
												key={link.href}
												href={link.href}
												className="text-2xl font-medium"
											>
												{link.name}
											</Link>
										))}
									</div>
								</SheetContent>
							</Sheet>

							<Link
								href="/"
								className="flex items-center gap-2 text-lg font-bold tracking-tight group"
							>
								<div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
									<Package2 className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
								</div>
								<span>{settings.storeName}</span>
							</Link>
						</div>

						{/* Desktop Nav */}
						<div className="hidden md:flex items-center gap-8 text-sm font-medium">
							{links.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="text-muted-foreground hover:text-primary transition-colors"
								>
									{link.name}
								</Link>
							))}
						</div>

						{/* Right Actions */}
						<div className="flex items-center gap-2 sm:gap-4">
							<form
								onSubmit={handleSearch}
								className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 bg-secondary/50 text-muted-foreground focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background transition-all"
							>
								<Search size={16} />
								<input
									type="text"
									placeholder="Search..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="bg-transparent outline-none w-24 lg:w-48 text-sm text-foreground"
								/>
							</form>

							<button
								onClick={toggleTheme}
								className="rounded-full p-2 text-muted-foreground hover:bg-accent transition"
							>
								{mounted && theme === "dark" ? (
									<Sun size={20} />
								) : (
									<Moon size={20} />
								)}
							</button>

							<Link href="/cart">
								<button className="relative rounded-full p-2 text-muted-foreground hover:bg-accent transition">
									<ShoppingCart size={20} />
									{cartItems.length > 0 && (
										<span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
											{cartItems.length}
										</span>
									)}
								</button>
							</Link>

							{user ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="relative h-9 w-9 rounded-full"
										>
											<Avatar className="h-9 w-9 border border-border">
												<AvatarFallback className="bg-primary/10 text-primary font-bold">
													{user.email?.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
										</Button>
									</DropdownMenuTrigger>

									{/* UPDATED DROPDOWN CONTENT */}
									<DropdownMenuContent
										className="w-60 bg-card border-border/40 shadow-xl shadow-black/40 text-card-foreground"
										align="end"
										forceMount
									>
										<DropdownMenuLabel className="font-normal">
											<div className="flex flex-col space-y-1">
												<p className="text-sm font-medium leading-none">
													My Account
												</p>
												<p className="text-xs leading-none text-muted-foreground">
													{user.email}
												</p>
											</div>
										</DropdownMenuLabel>
										<DropdownMenuSeparator className="bg-border/40" />

										{/* Admin Links */}
										{isAdmin && (
											<>
												<DropdownMenuItem asChild>
													<Link
														href="/admin"
														className="cursor-pointer font-semibold text-primary focus:text-primary focus:bg-primary/10 hover:bg-primary/10 hover:text-primary"
													>
														<LayoutDashboard className="mr-2 h-4 w-4" /> Admin
														Dashboard
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link
														href="/admin/settings"
														className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
													>
														<Settings className="mr-2 h-4 w-4" /> Store Settings
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator className="bg-border/40" />
											</>
										)}

										{/* User Links */}
										<DropdownMenuItem asChild>
											<Link
												href="/profile"
												className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
											>
												<User className="mr-2 h-4 w-4" /> Profile
											</Link>
										</DropdownMenuItem>

										<DropdownMenuItem asChild>
											<Link
												href="/orders"
												className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
											>
												<Package2 className="mr-2 h-4 w-4" /> Order History
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												href="/profile"
												className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
											>
												<MapPin className="mr-2 h-4 w-4" /> Saved Addresses
											</Link>
										</DropdownMenuItem>

										<DropdownMenuSeparator className="bg-border/40" />

										{/* Support */}
										<DropdownMenuItem asChild>
											<Link
												href="/contact"
												className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
											>
												<LifeBuoy className="mr-2 h-4 w-4" /> Customer Support
											</Link>
										</DropdownMenuItem>

										<DropdownMenuSeparator className="bg-border/40" />

										{/* Logout */}
										<DropdownMenuItem
											onClick={handleLogout}
											className="text-red-500 focus:text-red-500 focus:bg-red-500/10 hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
										>
											<LogOut className="mr-2 h-4 w-4" /> Log out
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<Link href="/login">
									<Button
										size="sm"
										variant="default"
										className="px-6 rounded-full"
									>
										Log In
									</Button>
								</Link>
							)}
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
}
