"use server";
import { prisma } from "@/db/prisma";
import { LATEST_PRODUCTS_LIMIT } from "../constants";
import { convertToPlainObject } from "../utils";

// Get the latest products
export async function getLatestProducts() {
	const data = await prisma.product.findMany({
		take: LATEST_PRODUCTS_LIMIT,
		orderBy: { createdAt: "desc" },
	});

	// Convert rating from string to number
	const products = convertToPlainObject(data);
	return products.map((product) => ({
		...product,
		rating: typeof product.rating === "string" ? parseFloat(product.rating) : product.rating,
	}));
}

// Get single product by slug
export async function getProductBySlug(slug: string) {
	const product = await prisma.product.findFirst({
		where: { slug: slug },
	});

	if (!product) return null;

	// Convert rating from string to number
	const plainProduct = convertToPlainObject(product);
	return {
		...plainProduct,
		rating:
			typeof plainProduct.rating === "string"
				? parseFloat(plainProduct.rating)
				: plainProduct.rating,
	};
}
