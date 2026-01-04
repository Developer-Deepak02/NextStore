import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ScrollToTop from "@/components/layout/scroll-top";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<Navbar />

			{/* ADDED: 'mx-auto w-full max-w-7xl' forces centering manually */}
			<main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				{children}
			</main>

			<Footer />
			<ScrollToTop />
		</div>
	);
}
