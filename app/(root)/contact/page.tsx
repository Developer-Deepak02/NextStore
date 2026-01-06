"use client";

import { useState, useTransition } from "react";
import {
	Mail,
	Phone,
	MapPin,
	Send,
	Loader2,
	CheckCircle2,
	MessageSquare,
	HelpCircle,
	CreditCard,
	Truck,
	Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { toast } from "sonner";

export default function ContactPage() {
	const [isPending, startTransition] = useTransition();
	const [isSuccess, setIsSuccess] = useState(false);
	const { settings } = useStoreSettings(); //

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.subject) {
			toast.error("Please select a subject.");
			return;
		}

		startTransition(async () => {
			const supabase = createClient();
			const { error } = await supabase
				.from("contact_messages")
				.insert([formData]);

			if (error) {
				toast.error("Something went wrong. Please try again.");
			} else {
				setIsSuccess(true);
				toast.success("Message sent successfully!");
				setFormData({ name: "", email: "", subject: "", message: "" });
				setTimeout(() => setIsSuccess(false), 5000);
			}
		});
	};

	const contactCards = [
		{
			icon: Mail,
			title: "Email Us",
			detail: settings.email || "support@shopkart.com",
			sub: "Response within 24 hours",
		},
		{
			icon: Phone,
			title: "Call Us",
			detail: settings.phone,
			sub: "Mon-Fri, 9am-6pm IST",
		},
		{
			icon: MapPin,
			title: "Visit Us",
			detail: settings.address,
			sub: "India",
		},
	];

	return (
		<div className="min-h-screen bg-background pb-20 pt-10 px-4 md:px-6">
			<div className="container mx-auto max-w-6xl">
				<div className="mb-12">
					<h1 className="text-4xl font-bold tracking-tight text-foreground">
						Get in touch
					</h1>
					<p className="text-muted-foreground text-lg mt-2">
						Have a question? Our team is here to help you.
					</p>
				</div>

				{/* PERFECTLY ALIGNED GRID: items-start ensures tops match exactly */}
				<div className="flex flex-col lg:flex-row items-start gap-12">
					{/* LEFT: Contact Cards */}
					<div className="lg:w-5/12 w-full grid gap-6">
						{contactCards.map((card, idx) => (
							<div
								key={idx}
								className="group p-6 rounded-2xl border border-border/20 bg-card/40 hover:border-primary/40 hover:bg-card transition-all duration-300 shadow-xl shadow-black/5"
							>
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
										<card.icon className="h-6 w-6" />
									</div>
									<div className="min-w-0">
										<h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
											{card.title}
										</h3>
										<p className="text-primary font-medium text-lg mt-0.5 break-all leading-tight">
											{card.detail}
										</p>
										<p className="text-xs text-muted-foreground mt-1">
											{card.sub}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* RIGHT: Form Card */}
					<div className="lg:w-7/12 w-full">
						<div className="rounded-3xl border border-border/20 bg-card p-8 shadow-2xl shadow-black/10 relative overflow-hidden">
							{isSuccess ? (
								<div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
									<div className="h-20 w-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
										<CheckCircle2 className="h-10 w-10" />
									</div>
									<h2 className="text-2xl font-bold">Message Sent!</h2>
									<p className="text-muted-foreground mt-2 max-w-xs">
										We've received your inquiry and will respond to your email
										shortly.
									</p>
									<Button
										variant="outline"
										className="mt-8 rounded-full border-border/40"
										onClick={() => setIsSuccess(false)}
									>
										Send another message
									</Button>
								</div>
							) : (
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label htmlFor="name">Name</Label>
											<Input
												id="name"
												required
												placeholder="John Doe"
												value={formData.name}
												onChange={(e) =>
													setFormData({ ...formData, name: e.target.value })
												}
												className="bg-secondary/10 border-border/20 focus:border-primary/50 h-11"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												required
												placeholder="john@example.com"
												value={formData.email}
												onChange={(e) =>
													setFormData({ ...formData, email: e.target.value })
												}
												className="bg-secondary/10 border-border/20 focus:border-primary/50 h-11"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="subject">Subject</Label>
										<Select
											onValueChange={(val) =>
												setFormData({ ...formData, subject: val })
											}
											value={formData.subject}
										>
											<SelectTrigger className="bg-secondary/10 border-border/20 h-11">
												<SelectValue placeholder="Select an inquiry type" />
											</SelectTrigger>
											<SelectContent className="bg-card border-border/40 shadow-2xl">
												<SelectItem value="Order Issue">
													<div className="flex items-center gap-2">
														<Truck className="h-4 w-4" /> Order Issue
													</div>
												</SelectItem>
												<SelectItem value="Payment Issue">
													<div className="flex items-center gap-2">
														<CreditCard className="h-4 w-4" /> Payment Issue
													</div>
												</SelectItem>
												<SelectItem value="Partnership">
													<div className="flex items-center gap-2">
														<Briefcase className="h-4 w-4" /> Partnership
													</div>
												</SelectItem>
												<SelectItem value="General Question">
													<div className="flex items-center gap-2">
														<HelpCircle className="h-4 w-4" /> General Question
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="message">Message</Label>
										<Textarea
											id="message"
											required
											placeholder="How can we help you today?"
											value={formData.message}
											onChange={(e) =>
												setFormData({ ...formData, message: e.target.value })
											}
											className="min-h-[150px] bg-secondary/10 border-border/20 focus:border-primary/50 resize-none"
										/>
									</div>

									<div className="space-y-4 pt-2">
										<Button
											type="submit"
											disabled={isPending}
											className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
										>
											{isPending ? (
												<Loader2 className="mr-2 h-5 w-5 animate-spin" />
											) : (
												<>
													<Send className="mr-2 h-4 w-4" /> Send Message
												</>
											)}
										</Button>
										<p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
											<MessageSquare className="h-3 w-3" /> We usually respond
											within 24 hours
										</p>
									</div>
								</form>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
