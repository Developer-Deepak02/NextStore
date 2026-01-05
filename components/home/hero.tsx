import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
	return (
		<section className="relative overflow-hidden bg-background py-16 md:py-32 transition-colors duration-500">
			{/* Dynamic Background Blur Effect */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen animate-pulse" />
			</div>

			<div className="container relative z-10 flex flex-col items-center text-center">
				{/* Badge */}
				<div className="inline-flex items-center rounded-full border border-primary/20 bg-secondary/50 px-3 py-1 text-sm text-secondary-foreground backdrop-blur-md mb-6 shadow-sm">
					<span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
					New Collection Just Dropped
				</div>

				{/* Heading */}
				<h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent pb-2">
					Discover the Future <br className="hidden sm:inline" />
					of <span className="text-primary">Modern Shopping</span>
				</h1>

				{/* Subheading */}
				<p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
					Shop premium electronics, fashion, and lifestyle essentials —
					thoughtfully curated for quality, comfort, and everyday reliability.
				</p>

				{/* CTA Buttons */}
				<div className="mt-10 flex flex-col w-full sm:w-auto gap-4 sm:flex-row">
					<Link href="/products" className="w-full sm:w-auto">
						<Button
							size="lg"
							className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20"
						>
							Shop Now <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>

					<Link href="/category" className="w-full sm:w-auto">
						<Button
							variant="outline"
							size="lg"
							className="w-full sm:w-auto h-12 px-8 text-base bg-background/50 backdrop-blur-sm hover:bg-secondary/80"
						>
							Browse Categories
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
