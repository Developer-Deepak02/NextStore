"use client";

import Link from "next/link";
import Image from "next/image";
import {
	Facebook,
	Twitter,
	Instagram,
	Linkedin,
	ShoppingBag,
	Send,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/actions/newsletter";
import { useTransition } from "react";
import { toast } from "sonner";

function NewsletterForm() {
	const [isPending, startTransition] = useTransition();

	async function handleSubmit(formData: FormData) {
		const email = formData.get("email");
		if (!email) {
			toast.error("Please enter an email address.");
			return;
		}

		startTransition(async () => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			const result = await subscribeToNewsletter(formData);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Welcome to the family!", {
					description: "You've successfully subscribed to our newsletter.",
				});
			}
		});
	}

	return (
		<form action={handleSubmit} className="flex flex-col gap-2">
			<div className="relative">
				<Input
					name="email"
					type="email"
					placeholder="your@email.com"
					required
					className="bg-secondary/50 pr-12 border-border/60 focus-visible:ring-primary/20 h-11 transition-all focus:bg-background"
					disabled={isPending}
				/>
				<Button
					type="submit"
					size="icon"
					className="absolute right-1 top-1 h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground"
					disabled={isPending}
				>
					{isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Send className="h-4 w-4" />
					)}
				</Button>
			</div>
			<p className="text-[11px] text-muted-foreground/60 pl-1">
				No spam. Unsubscribe anytime.
			</p>
		</form>
	);
}

export default function Footer() {
	return (
		// Added 'relative' to position the gradient
		<footer className="relative border-t border-border/40 bg-card/30 backdrop-blur-lg mt-auto w-full">
			{/* ✨ THE SUBTLE GRADIENT DIVIDER ✨ */}
			<div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

			<div className="container mx-auto px-6 md:px-12 py-16">
				<div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
					{/* Brand Column */}
					<div className="space-y-6">
						<Link
							href="/"
							className="flex items-center gap-2 text-2xl font-bold tracking-tight"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
								<ShoppingBag className="h-6 w-6" />
							</div>
							ShopKart
						</Link>
						<p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
							Your one-stop destination for premium products. We bring quality
							and reliability to every doorstep.
						</p>

						<div className="flex gap-4">
							{[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
								<Link
									key={i}
									href="#"
									className="bg-background border border-border/50 p-2.5 rounded-full text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-sm"
								>
									<Icon className="h-4 w-4" />
								</Link>
							))}
						</div>
					</div>

					{/* Shop Links */}
					<div>
						<h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-foreground/90">
							Shop
						</h4>
						<ul className="space-y-4 text-sm text-muted-foreground">
							<li>
								<Link
									href="/products"
									className="hover:text-primary hover:translate-x-1 inline-block transition-all"
								>
									All Products
								</Link>
							</li>
							<li>
								<Link
									href="/categories"
									className="hover:text-primary hover:translate-x-1 inline-block transition-all"
								>
									Categories
								</Link>
							</li>
							<li>
								<Link
									href="/products?featured=true"
									className="hover:text-primary hover:translate-x-1 inline-block transition-all"
								>
									Featured Collection
								</Link>
							</li>
							<li>
								<Link
									href="/products?sort=new"
									className="hover:text-primary hover:translate-x-1 inline-block transition-all"
								>
									New Arrivals
								</Link>
							</li>
						</ul>
					</div>

					{/* Company Links */}
					<div>
						<h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-foreground/90">
							Company
						</h4>
						<ul className="space-y-4 text-sm text-muted-foreground">
							<li>
								<Link
									href="/about"
									className="hover:text-primary hover:translate-x-1 inline-block transition-all"
								>
									About Us
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="hover:text-primary hover:translate-x-1 inline-block transition-all"
								>
									Contact Support
								</Link>
							</li>
							<li>
								<Link
									href="/privacy"
									className="hover:text-primary hover:translate-x-1 inline-block transition-all"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href="/terms"
									className="hover:text-primary hover:translate-x-1 inline-block transition-all"
								>
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>

					{/* Newsletter & Payments */}
					<div className="space-y-4">
						<h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-foreground/90">
							Stay Updated
						</h4>
						<p className="text-sm text-muted-foreground mb-4">
							Join 10,000+ shoppers getting our best deals.
						</p>

						<NewsletterForm />

						{/* Local Payment Icons */}
						<div className="flex items-center gap-3 pt-6">
							<div className="bg-white rounded h-8 w-12 flex items-center justify-center p-1">
								<Image
									src="/payments/visa.svg"
									alt="Visa"
									width={32}
									height={32}
									className="w-full h-full object-contain"
								/>
							</div>
							<div className="bg-white rounded h-8 w-12 flex items-center justify-center p-1">
								<Image
									src="/payments/mastercard.svg"
									alt="Mastercard"
									width={32}
									height={32}
									className="w-full h-full object-contain"
								/>
							</div>
							<div className="bg-white rounded h-8 w-12 flex items-center justify-center p-1">
								<Image
									src="/payments/upi.svg"
									alt="UPI"
									width={32}
									height={32}
									className="w-full h-full object-contain"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Copyright */}
				<div className="mt-20 border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
					<p>© 2026 ShopKart Inc. All rights reserved.</p>
					<div className="flex gap-8">
						<Link href="#" className="hover:text-primary transition-colors">
							Privacy
						</Link>
						<Link href="#" className="hover:text-primary transition-colors">
							Terms
						</Link>
						<Link href="#" className="hover:text-primary transition-colors">
							Sitemap
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
