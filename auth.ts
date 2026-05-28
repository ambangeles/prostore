import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { cookies } from "next/headers";
import { authConfig } from "./auth.config";

export const config: NextAuthConfig = {
	...authConfig,
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			credentials: {
				email: {
					type: "email",
				},
				password: { type: "password" },
			},
			async authorize(credentials) {
				if (credentials == null) return null;

				// Find user in database
				const user = await prisma.user.findFirst({
					where: {
						email: credentials.email as string,
					},
				});
				// Check if user exists and password is correct
				if (user && user.password) {
					const isMatch = compareSync(credentials.password as string, user.password);
					// If password is correct, return user object
					if (isMatch) {
						return {
							id: user.id,
							name: user.name,
							email: user.email,
							role: user.role,
						};
					}
				}
				// If user doesn't exist or password is incorrect, return null
				return null;
			},
		}),
	],
	callbacks: {
		...authConfig.callbacks,
		async jwt({ token, user, trigger, session }) {
			if (user) {
				// Assign user properties to the token
				token.id = user.id;
				if (user && "role" in user && typeof user.role === "string") {
					token.role = user.role;
				}

				if (trigger === "signIn" || trigger === "signUp") {
					const cookiesObject = await cookies();
					const sessionCartId = cookiesObject.get("sessionCartId")?.value;

					if (sessionCartId) {
						const sessionCart = await prisma.cart.findFirst({
							where: { sessionCartId },
						});

						if (sessionCart && user.id) {
							// Overwrite any existing user cart
							await prisma.cart.deleteMany({
								where: { userId: user.id },
							});

							// Assign the guest cart to the logged-in user
							await prisma.cart.update({
								where: { id: sessionCart.id },
								data: { userId: user.id },
							});
						}
					}
				}
			}

			// Handle session updates (e.g., name change)
			if (session?.user.name && trigger === "update") {
				token.name = session.user.name;
			}
			return token;
		},
		async session({ session, token, trigger }) {
			// Map the token data to the session object
			if (typeof token.id === "string") {
				session.user.id = token.id;
			}
			session.user.name = token.name;
			if (typeof token.role === "string") {
				session.user.role = token.role;
			}

			// Optionally handle session updates (like name change)
			if (trigger === "update" && token.name) {
				session.user.name = token.name;
			}

			// Return the updated session object
			return session;
		},
	},
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
