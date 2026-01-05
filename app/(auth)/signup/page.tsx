"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
	});

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const { error } = await supabase.auth.signUp({
			email: formData.email,
			password: formData.password,
			options: {
				data: {
					full_name: formData.name,
				},
			},
		});

		if (error) {
			toast.error(error.message);
		} else {
			toast.success("Account created! Please log in.");
			router.push("/login");
		}
		setLoading(false);
	};

	return (
		<div className="flex items-center justify-center min-h-[80vh]">
			<Card className="w-full max-w-md border-none shadow-xl bg-card/50 backdrop-blur-sm">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">
						Create an account
					</CardTitle>
					<CardDescription>
						Enter your email below to create your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSignUp} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								placeholder="John Doe"
								required
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								required
								value={formData.password}
								onChange={(e) =>
									setFormData({ ...formData, password: e.target.value })
								}
							/>
						</div>
						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								"Sign Up"
							)}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center text-sm text-muted-foreground">
					Already have an account?
					<Link
						href="/login"
						className="ml-1 text-primary hover:underline font-medium"
					>
						Sign In
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
