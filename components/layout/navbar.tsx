"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Moon, Sun, Menu, Package2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/store";
import { useEffect, useState } from "react";

export default function Navbar() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const cartItems = useCart((state) => state.items);
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	// Handle Search Submit
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
		{ name: "About", href: "/about" },
		{ name: "Contact", href: "/contact" },
	];

	return (
		<header className="sticky top-0 z-50 w-full">
			<nav className="w-full bg-background/80 backdrop-blur-md border-b border-border/40 transition-colors duration-500">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						{/* Left Side: Mobile Menu & Logo */}
						<div className="flex items-center gap-2">
							{/* MOBILE MENU */}
							<Sheet>
								<SheetTrigger asChild>
									<button className="md:hidden rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition">
										<Menu className="h-5 w-5" />
									</button>
								</SheetTrigger>
								<SheetContent
									side="top"
									className="w-full h-[400px] rounded-b-2xl border-b border-border/40"
								>
									<SheetTitle className="sr-only">Mobile Menu</SheetTitle>
									<div className="flex flex-col items-center justify-center h-full gap-6">
										{links.map((link) => (
											<Link
												key={link.href}
												href={link.href}
												className="text-2xl font-medium hover:text-primary transition-colors"
											>
												{link.name}
											</Link>
										))}
									</div>
								</SheetContent>
							</Sheet>

							{/* Logo */}
							<Link
								href="/"
								className="flex items-center gap-1 text-lg font-bold tracking-tight text-foreground group"
							>
								<Package2 className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
								<span>
									Next<span className="text-primary">Store</span>
								</span>
							</Link>
						</div>

						{/* Desktop Nav */}
						<div className="hidden md:flex items-center gap-8 text-sm font-medium">
							{links.map((link) => (
								<NavLink key={link.href} href={link.href}>
									{link.name}
								</NavLink>
							))}
						</div>

						{/* Right Actions */}
						<div className="flex items-center gap-2 sm:gap-4">
							{/* SEARCH BAR (Restored) */}
							<form
								onSubmit={handleSearch}
								className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 bg-secondary/50 text-muted-foreground focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background transition-all"
							>
								<Search size={16} />
								<input
									type="text"
									placeholder="Search products..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="bg-transparent outline-none w-24 lg:w-48 text-sm placeholder:text-muted-foreground/70 text-foreground"
								/>
							</form>

							{/* Theme Toggle */}
							<button
								onClick={toggleTheme}
								className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition"
							>
								{mounted && theme === "dark" ? (
									<Sun size={20} />
								) : (
									<Moon size={20} />
								)}
							</button>

							{/* Cart */}
							<Link href="/cart">
								<button className="relative rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition">
									<ShoppingCart size={20} />
									{cartItems.length > 0 && (
										<span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
											{cartItems.length}
										</span>
									)}
								</button>
							</Link>
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
}

function NavLink({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className="text-muted-foreground hover:text-foreground transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300"
		>
			{children}
		</Link>
	);
}
