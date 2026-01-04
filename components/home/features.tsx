import { Truck, ShieldCheck, Clock, CreditCard } from "lucide-react";

const features = [
	{
		icon: Truck,
		title: "Free Shipping",
		description: "On all orders over $100. Delivered to your doorstep.",
	},
	{
		icon: ShieldCheck,
		title: "Secure Payment",
		description: "100% secure payment gateways protected by SSL.",
	},
	{
		icon: Clock,
		title: "24/7 Support",
		description: "Our dedicated team is here to help you anytime.",
	},
	{
		icon: CreditCard,
		title: "Easy Returns",
		description: "30-day money-back guarantee. No questions asked.",
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
							<p className="mt-2 text-sm text-muted-foreground">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
