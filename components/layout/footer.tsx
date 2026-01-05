"use client";

import Link from "next/link";
import { useStoreSettings } from "@/hooks/use-store-settings";
import {
	Package2,
	Mail,
	Phone,
	MapPin,
	Facebook,
	Twitter,
	Instagram,
} from "lucide-react";

export default function Footer() {
	const { settings } = useStoreSettings();

	return (
		<footer className="bg-secondary/30 border-t border-border mt-auto">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Brand Column */}
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-lg font-bold tracking-tight">
							<Package2 className="h-6 w-6 text-primary" />
							<span>{settings.storeName}</span>
						</div>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Your one-stop destination for premium products. Quality meets
							reliability in every order.
						</p>
						<div className="flex gap-4 pt-2">
							<Link
								href="#"
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								<Facebook size={20} />
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								<Twitter size={20} />
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								<Instagram size={20} />
							</Link>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="font-semibold mb-4">Quick Links</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link
									href="/products"
									className="hover:text-primary transition-colors"
								>
									All Products
								</Link>
							</li>
							<li>
								<Link
									href="/category"
									className="hover:text-primary transition-colors"
								>
									Categories
								</Link>
							</li>
							<li>
								<Link
									href="/about"
									className="hover:text-primary transition-colors"
								>
									About Us
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="hover:text-primary transition-colors"
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>

					{/* Customer Service */}
					<div>
						<h3 className="font-semibold mb-4">Customer Service</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Shipping Policy
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Returns & Refunds
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Terms of Service
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Privacy Policy
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact Info (Dynamic) */}
					<div>
						<h3 className="font-semibold mb-4">Contact Us</h3>
						<ul className="space-y-3 text-sm text-muted-foreground">
							<li className="flex items-start gap-3">
								<MapPin className="h-4 w-4 mt-0.5 text-primary" />
								<span>
									{settings.address || "123 Commerce St, Market City"}
								</span>
							</li>
							<li className="flex items-center gap-3">
								<Mail className="h-4 w-4 text-primary" />
								<a
									href={`mailto:${settings.email}`}
									className="hover:text-primary transition-colors"
								>
									{settings.email}
								</a>
							</li>
							{settings.phone && (
								<li className="flex items-center gap-3">
									<Phone className="h-4 w-4 text-primary" />
									<a
										href={`tel:${settings.phone}`}
										className="hover:text-primary transition-colors"
									>
										{settings.phone}
									</a>
								</li>
							)}
						</ul>
					</div>
				</div>

				<div className="border-t border-border/50 mt-12 pt-8 text-center text-sm text-muted-foreground">
					<p>
						&copy; {new Date().getFullYear()} {settings.storeName}. All rights
						reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
