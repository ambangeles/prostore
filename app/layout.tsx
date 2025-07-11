import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/assets/styles/globals.css";
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/lib/constants";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		template: `%s | ${APP_NAME}`,
		default: APP_NAME,
	},
	description: `${APP_DESCRIPTION}`,
	metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
			<Script
				id="arto-chat-script"
				strategy="afterInteractive"
				type="module"
				crossOrigin="anonymous"
				dangerouslySetInnerHTML={{
					__html: `
					import Arto from "https://assets.arto.chat/arto.js";
						Arto.init({
							uuid: "07c4c5f6-5b6f-4d01-94fe-9e5129ded4ce"
						});
				`,
				}}
			/>
		</html>
	);
}
