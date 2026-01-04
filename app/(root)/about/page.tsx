import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AboutPage() {
	return (
		<div className="container py-10 space-y-20">
			{/* 1. Hero / Our Story */}
			<section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
				<div className="space-y-6">
					<Badge className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 border-none">
						Our Story
					</Badge>
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
						Empowering Your <br />
						<span className="text-primary">Digital Lifestyle</span>
					</h1>
					<p className="text-lg text-muted-foreground leading-relaxed">
						Founded in 2025, NextStore began with a simple mission: to make
						premium quality products accessible to everyone. We believe that
						shopping online should be an experience, not just a transaction.
						From the latest tech gadgets to sustainable fashion, we curate items
						that elevate your everyday life.
					</p>
				</div>
				<div className="relative h-[400px] rounded-2xl overflow-hidden bg-secondary/30 border border-border">
					{/* Replace with a real image if you have one, using a placeholder for now */}
					<Image
						src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
						alt="Team working"
						fill
						className="object-cover"
					/>
				</div>
			</section>

			{/* 2. Stats / Features */}
			<section className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center py-10 bg-secondary/20 rounded-2xl">
				{[
					{ label: "Happy Customers", value: "10k+" },
					{ label: "Products Sold", value: "50k+" },
					{ label: "Countries Served", value: "25+" },
					{ label: "Awards Won", value: "12" },
				].map((stat, i) => (
					<div key={i} className="space-y-2">
						<h3 className="text-3xl font-bold text-primary">{stat.value}</h3>
						<p className="text-sm text-muted-foreground uppercase tracking-wider">
							{stat.label}
						</p>
					</div>
				))}
			</section>

			{/* 3. Testimonials */}
			<section>
				<h2 className="text-3xl font-bold text-center mb-12">
					What Our Customers Say
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[
						{
							name: "Alex Johnson",
							role: "Tech Enthusiast",
							text: "The delivery was incredibly fast, and the headphones are exactly as described. The dark mode on the site is a nice touch!",
							initials: "AJ",
						},
						{
							name: "Sarah Williams",
							role: "Fashion Blogger",
							text: "I love the curated fashion collection. It's rare to find a store that balances quality and price so perfectly.",
							initials: "SW",
						},
						{
							name: "Michael Chen",
							role: "Verified Buyer",
							text: "Customer support helped me with a return within minutes. Truly professional service. Highly recommended.",
							initials: "MC",
						},
					].map((t, i) => (
						<Card key={i} className="bg-card border-border/50">
							<CardContent className="pt-6 space-y-4">
								<p className="text-muted-foreground italic">"{t.text}"</p>
								<div className="flex items-center gap-4">
									<Avatar>
										<AvatarFallback className="bg-primary/10 text-primary">
											{t.initials}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-semibold text-sm">{t.name}</p>
										<p className="text-xs text-muted-foreground">{t.role}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</section>
		</div>
	);
}
