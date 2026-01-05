"use client";

import { cn } from "@/lib/utils";
import { useAdminStore } from "@/lib/admin-store";
import AdminHeader from "@/components/admin/admin-header";

export default function AdminContentWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isCollapsed } = useAdminStore();

	return (
		// Dynamically adjust padding-left based on collapsed state
		<main
			className={cn(
				"min-h-screen flex flex-col transition-all duration-300 ease-in-out",
				isCollapsed ? "md:pl-[80px]" : "md:pl-72"
			)}
		>
			{/* Header stays inside the shifting main container */}
			<AdminHeader />

			{/* Page Content */}
			<div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
				{children}
			</div>
		</main>
	);
}
