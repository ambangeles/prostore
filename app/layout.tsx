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
    uuid: "a28b8cc9-c94b-4e6b-9d62-37f6a3752822",
    theme: {
      logo: "https://img.freepik.com/free-vector/bird-colorful-gradient-design-vector_343694-2506.jpg",
      triggerButtonIcon: "https://img.freepik.com/free-vector/bird-colorful-gradient-design-vector_343694-2506.jpg",
      submitButtonIcon: "https://img.freepik.com/free-vector/bird-colorful-gradient-design-vector_343694-2506.jpg",
      closeButtonIcon: "https://img.freepik.com/free-vector/bird-colorful-gradient-design-vector_343694-2506.jpg",
      color: "#df8134",
      userMessageColor: "#29cf26"
    }
  });
				`,
				}}
			/>
		</html>
	);
}
