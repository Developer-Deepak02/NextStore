"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Validation Schema
const contactSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	subject: z.string().min(5, "Subject must be at least 5 characters"),
	message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
	const [isSubmitted, setIsSubmitted] = useState(false);

	const form = useForm<ContactFormValues>({
		resolver: zodResolver(contactSchema),
	});

	const onSubmit = (data: ContactFormValues) => {
		// In a real app, you would send 'data' to your backend API here
		console.log("Form Submitted:", data);
		setIsSubmitted(true);
	};

	return (
		<div className="container py-10 max-w-5xl">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
				{/* Left: Contact Info */}
				<div className="space-y-8">
					<div>
						<h1 className="text-4xl font-bold tracking-tight mb-4">
							Get in touch
						</h1>
						<p className="text-muted-foreground text-lg">
							Have a question about your order or want to partner with us? Fill
							out the form and our team will get back to you within 24 hours.
						</p>
					</div>

					<div className="space-y-6">
						<Card>
							<CardContent className="flex items-center gap-4 p-6">
								<div className="bg-primary/10 p-3 rounded-full text-primary">
									<Mail className="h-6 w-6" />
								</div>
								<div>
									<p className="font-semibold">Email Us</p>
									<p className="text-sm text-muted-foreground">
										support@nextstore.com
									</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="flex items-center gap-4 p-6">
								<div className="bg-primary/10 p-3 rounded-full text-primary">
									<Phone className="h-6 w-6" />
								</div>
								<div>
									<p className="font-semibold">Call Us</p>
									<p className="text-sm text-muted-foreground">
										+1 (555) 000-0000
									</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="flex items-center gap-4 p-6">
								<div className="bg-primary/10 p-3 rounded-full text-primary">
									<MapPin className="h-6 w-6" />
								</div>
								<div>
									<p className="font-semibold">Visit Us</p>
									<p className="text-sm text-muted-foreground">
										123 Commerce Blvd, Tech City, TC 90210
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Right: Contact Form */}
				<div className="bg-card border rounded-2xl p-8 shadow-sm">
					{isSubmitted ? (
						<div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in">
							<div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
								<CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
							</div>
							<h2 className="text-2xl font-bold">Message Sent!</h2>
							<p className="text-muted-foreground">
								Thank you for contacting us. We will be in touch shortly.
							</p>
							<Button
								onClick={() => setIsSubmitted(false)}
								variant="outline"
								className="mt-4"
							>
								Send Another Message
							</Button>
						</div>
					) : (
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid gap-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									placeholder="John Doe"
									{...form.register("name")}
								/>
								{form.formState.errors.name && (
									<p className="text-sm text-destructive">
										{form.formState.errors.name.message}
									</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="john@example.com"
									{...form.register("email")}
								/>
								{form.formState.errors.email && (
									<p className="text-sm text-destructive">
										{form.formState.errors.email.message}
									</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="subject">Subject</Label>
								<Input
									id="subject"
									placeholder="Order Inquiry"
									{...form.register("subject")}
								/>
								{form.formState.errors.subject && (
									<p className="text-sm text-destructive">
										{form.formState.errors.subject.message}
									</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="message">Message</Label>
								<Textarea
									id="message"
									placeholder="How can we help you today?"
									className="min-h-[150px]"
									{...form.register("message")}
								/>
								{form.formState.errors.message && (
									<p className="text-sm text-destructive">
										{form.formState.errors.message.message}
									</p>
								)}
							</div>

							<Button type="submit" className="w-full h-12 text-base">
								<Send className="mr-2 h-4 w-4" /> Send Message
							</Button>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
