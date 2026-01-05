import { Truck, ShieldCheck, Headset, RefreshCcw } from "lucide-react";

const features = [
	{
		icon: Truck,
		title: "Fast & Free Shipping",
		description: "Free delivery on orders over $100.",
	},
	{
		icon: ShieldCheck,
		title: "Secure Payments",
		description: "100% secured with SSL encryption.",
	},
	{
		icon: Headset,
		title: "24/7 Support", // Shortened title for mobile safety
		description: "Our team is here day or night.",
	},
	{
		icon: RefreshCcw,
		title: "Easy Returns", // Shortened title for mobile safety
		description: "30-day money-back guarantee.",
	},
];

export default function Features() {
	return (
		<section className="container py-12 md:py-24">
			{/* Container: Tighter padding on mobile (p-6) vs desktop (p-16) */}
			<div className="rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-sm p-6 md:p-16 shadow-2xl shadow-black/20">
				{/* GRID: 2 columns on mobile, 4 columns on desktop */}
				<div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-12">
					{features.map((feature, i) => (
						<div
							key={i}
							className="group flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2"
						>
							{/* Icon: Smaller on mobile (h-12) -> Larger on desktop (h-16) */}
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner transition-colors duration-300 group-hover:bg-primary/20 group-hover:shadow-primary/20 md:mb-6 md:h-16 md:w-16">
								<feature.icon className="h-5 w-5 md:h-7 md:w-7" />
							</div>

							{/* Title: Smaller text on mobile */}
							<h3 className="mb-2 text-sm font-bold tracking-tight text-foreground md:mb-3 md:text-lg">
								{feature.title}
							</h3>

							{/* Description: Tiny text (text-xs) on mobile, constrained width to prevent spilling */}
							<p className="max-w-[140px] text-xs font-medium leading-relaxed text-muted-foreground/80 md:max-w-[200px] md:text-sm">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
