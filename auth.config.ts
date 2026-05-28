import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
	pages: {
		signIn: "/sign-in",
		error: "/sign-in",
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
	},
	providers: [],
	callbacks: {
		authorized({ request, auth }) {
			// Array of regex patterns of protected paths
			const protectedPaths = [
				/\/shipping-address/,
				/\/payment-method/,
				/\/place-order/,
				/\/profile/,
				/\/user\/(.*)/,
				/\/order\/(.*)/,
				/\/admin/,
			];

			// Get pathname from the req URL object
			const { pathname } = request.nextUrl;

			// Check if user is not authenticated and on a protected path
			if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

			// Check for cart cookie
			if (!request.cookies.get("sessionCartId")) {
				// Generate cart cookie
				const sessionCartId = crypto.randomUUID();

				// Clone the request headers
				const newRequestHeaders = new Headers(request.headers);

				// Create a new response and add the new headers
				const response = NextResponse.next({
					request: {
						headers: newRequestHeaders,
					},
				});

				// Set the newly generated sessionCartId in the response cookies
				response.cookies.set("sessionCartId", sessionCartId);

				// Return the response with the sessionCartId set
				return response;
			} else {
				return true;
			}
		},
	},
} satisfies NextAuthConfig;
