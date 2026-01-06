"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
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

export default function LoginPage() {
	const supabase = createClient();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			toast.error(error.message);
		} else {
			toast.success("Welcome back!");
			router.push("/"); // Redirect to home
			router.refresh(); // Refresh to update Navbar state
		}
		setLoading(false);
	};

	return (
		<div className="flex items-center justify-center min-h-[80vh]">
			<Card className="w-full max-w-md border-none shadow-xl bg-card/50 backdrop-blur-sm">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">Sign in</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								"Sign In"
							)}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center text-sm text-muted-foreground">
					Don&apos;t have an account?
					<Link
						href="/signup"
						className="ml-1 text-primary hover:underline font-medium"
					>
						Sign Up
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
