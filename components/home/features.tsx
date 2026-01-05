import { Truck, ShieldCheck, Clock, CreditCard } from "lucide-react";

const features = [
	{
		icon: Truck,
		title: "Fast & Free Shipping",
		description:
			"Enjoy free delivery on all orders over $100, straight to your door.",
	},
	{
		icon: ShieldCheck,
		title: "Secure Payments",
		description:
			"Your payments are protected with industry-standard SSL security.",
	},
	{
		icon: Clock,
		title: "24/7 Customer Support",
		description:
			"Need help? Our support team is available anytime, day or night.",
	},
	{
		icon: CreditCard,
		title: "Hassle-Free Returns",
		description:
			"Not satisfied? Get a full refund within 30 days, no questions asked.",
	},
];

export default function Features() {
	return (
		<section className="bg-muted/50 py-16">
			<div className="container">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
					{features.map((feature, index) => (
						<div
							key={index}
							className="flex flex-col items-center text-center p-4"
						>
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<feature.icon className="h-6 w-6" />
							</div>

							<h3 className="text-lg font-semibold">{feature.title}</h3>

							<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
