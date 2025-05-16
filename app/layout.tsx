import { ThemeSwitcher } from "@/components/theme-switcher";
import { Urbanist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: "Smart-suite-web",
	description: "Managemenet hotels business",
};

const urbanist = Urbanist({
	display: "swap",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es" className={urbanist.className} suppressHydrationWarning>
			<body className="bg-background text-foreground">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<AuthProvider>
						
						{children}
						<Toaster />
						<footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-4">
							<p>
								Powered by{" "}
								<a
									href="https://las4as.pe"
									target="_blank"
									className="font-bold hover:underline"
									rel="noreferrer"
								>
									A&S Soluciones
								</a>
							</p>
							<ThemeSwitcher />
						</footer>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
