"use client";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminContentWrapper from "@/components/admin/admin-content-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "next-themes";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;

}) {
  const { theme } = useTheme();
	return (
		<div className="min-h-screen bg-secondary/20">
			<AdminSidebar />

			{/* The Wrapper handles the padding shift logic now */}
			<AdminContentWrapper>{children}</AdminContentWrapper>
			<Toaster
				theme={theme as "light" | "dark" | "system"}
				richColors
				toastOptions={{
					style: {
						background: "var(--background)",
						color: "var(--foreground)",
						border: "1px solid var(--border)",
					},
					className: "shadow-xl",
				}}
			/>
		</div>
	);
}
