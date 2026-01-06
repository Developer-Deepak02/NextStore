"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase";
import {
	Mail,
	MessageSquare,
	Trash2,
	User,
	Inbox,
	Loader2,
	RefreshCcw,
	Eye,
	Reply,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminMessagesPage() {
	const [messages, setMessages] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [isPending, startTransition] = useTransition();
	const supabase = createClient();

	const fetchMessages = async () => {
		setLoading(true);
		const { data, error } = await supabase
			.from("contact_messages")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			toast.error(`Permissions Error: ${error.message}`);
		} else {
			setMessages(data || []);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchMessages();
	}, []);

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this message?")) return;
		startTransition(async () => {
			const { error } = await supabase
				.from("contact_messages")
				.delete()
				.eq("id", id);
			if (error) toast.error("Delete failed");
			else {
				toast.success("Message deleted");
				setMessages((prev) => prev.filter((m) => m.id !== id));
			}
		});
	};

	// Improved Reply Handler to try and avoid "open application" popups
	const handleReply = (email: string, subject: string) => {
		const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=Re: ${encodeURIComponent(
			subject
		)}`;
		window.open(gmailUrl, "_blank");
	};

	if (loading)
		return (
			<div className="flex h-[80vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);

	return (
		<div className="p-6 lg:p-10 space-y-8">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold tracking-tight">Customer Messages</h1>
				<Button
					onClick={fetchMessages}
					variant="outline"
					size="sm"
					className="gap-2 border-border/40"
				>
					<RefreshCcw className="h-4 w-4" /> Refresh
				</Button>
			</div>

			<Card className="border-border/20 bg-card shadow-2xl">
				<CardHeader className="border-b border-border/20">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Inbox className="h-5 w-5 text-primary" /> Inbox ({messages.length})
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0 text-foreground">
					<Table>
						<TableHeader className="bg-secondary/10">
							<TableRow className="border-border/20">
								<TableHead className="font-bold py-4">Customer</TableHead>
								<TableHead className="font-bold">Subject</TableHead>
								<TableHead className="font-bold">Preview</TableHead>
								<TableHead className="text-right font-bold pr-6">
									Date
								</TableHead>
								<TableHead className="text-right font-bold pr-6">
									Action
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{messages.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="h-64 text-center text-muted-foreground italic"
									>
										No messages found.
									</TableCell>
								</TableRow>
							) : (
								messages.map((msg) => (
									<TableRow
										key={msg.id}
										className="border-border/10 hover:bg-secondary/5 transition-colors group"
									>
										<TableCell className="py-4">
											<div className="flex flex-col">
												<span className="font-bold flex items-center gap-1.5 text-sm">
													<User className="h-3.5 w-3.5 text-primary" />{" "}
													{msg.name}
												</span>
												<span className="text-xs text-muted-foreground">
													{msg.email}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-wider"
											>
												{msg.subject}
											</Badge>
										</TableCell>
										<TableCell className="max-w-[200px] truncate text-sm text-muted-foreground group-hover:text-foreground">
											{msg.message}
										</TableCell>
										<TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
											<p className="font-medium text-foreground">
												{format(new Date(msg.created_at), "MMM d, yyyy")}
											</p>
											<p className="opacity-70">
												{format(new Date(msg.created_at), "p")}
											</p>
										</TableCell>
										<TableCell className="text-right pr-6">
											<div className="flex justify-end gap-1">
												<Dialog>
													<DialogTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
														>
															<Eye className="h-4 w-4" />
														</Button>
													</DialogTrigger>
													<DialogContent className="bg-card border-border/40 text-card-foreground shadow-2xl max-w-lg">
														<DialogHeader>
															<DialogTitle className="flex items-center gap-2 text-xl">
																<MessageSquare className="h-5 w-5 text-primary" />{" "}
																Message Details
															</DialogTitle>
															<DialogDescription className="text-muted-foreground font-mono text-xs">
																ID: {msg.id}
															</DialogDescription>
														</DialogHeader>
														<div className="space-y-6 py-4">
															{/* Updated Sender Info Layout */}
															<div className="grid grid-cols-1 gap-4 bg-secondary/10 p-4 rounded-xl border border-border/40">
																<div className="flex items-start gap-3">
																	<div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
																		<User className="h-5 w-5 text-primary" />
																	</div>
																	<div>
																		<p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">
																			Sender Name
																		</p>
																		<p className="text-base font-semibold">
																			{msg.name}
																		</p>
																	</div>
																</div>
																<div className="flex items-start gap-3 border-t border-border/20 pt-3">
																	<div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
																		<Mail className="h-5 w-5 text-primary" />
																	</div>
																	<div className="min-w-0">
																		<p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">
																			Email Address
																		</p>
																		<p className="text-sm font-medium truncate">
																			{msg.email}
																		</p>
																	</div>
																</div>
															</div>

															<div className="space-y-2">
																<div className="flex justify-between items-end px-1">
																	<p className="text-[10px] uppercase font-bold text-muted-foreground">
																		Message Body
																	</p>
																	<p className="text-[10px] text-muted-foreground italic">
																		Received{" "}
																		{format(new Date(msg.created_at), "PPP p")}
																	</p>
																</div>
																<div className="bg-secondary/20 p-5 rounded-xl border border-border/40 min-h-[120px]">
																	<p className="text-sm leading-relaxed whitespace-pre-wrap">
																		{msg.message}
																	</p>
																</div>
															</div>
														</div>
														<div className="flex gap-3 mt-2">
															<Button
																variant="default"
																className="flex-1 font-bold shadow-lg shadow-primary/20"
																onClick={() =>
																	handleReply(msg.email, msg.subject)
																}
															>
																<Reply className="mr-2 h-4 w-4" /> Reply via
																Gmail
															</Button>
															<Button
																variant="destructive"
																size="icon"
																className="shrink-0"
																onClick={() => handleDelete(msg.id)}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</DialogContent>
												</Dialog>
												<Button
													variant="ghost"
													size="icon"
													className="text-red-500 h-8 w-8 hover:bg-red-500/10"
													onClick={() => handleDelete(msg.id)}
													disabled={isPending}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
