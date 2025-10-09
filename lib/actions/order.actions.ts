"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { insertOrderSchema } from "@/lib/validator";
import { CartItem } from "@/types";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";

// Create an order
export async function createOrder() {
	try {
		const session = await auth();
		if (!session) throw new Error("User is not authenticated");

		const cart = await getMyCart();
		const userId = session?.user?.id;

		if (!userId) throw new Error("User not found");

		const user = await getUserById(userId);

		if (!cart || cart.items.length === 0) {
			return { success: false, message: "Your cart is empty", redirectTo: "/cart" };
		}
		if (!user.address) {
			return {
				success: false,
				message: "Please add a shipping address",
				redirectTo: "/shipping-address",
			};
		}
		if (!user.paymentMethod) {
			return {
				success: false,
				message: "Please select a payment method",
				redirectTo: "/payment-method",
			};
		}

		const order = insertOrderSchema.parse({
			userId: user.id,
			shippingAddress: user.address,
			paymentMethod: user.paymentMethod,
			itemsPrice: cart.itemsPrice,
			shippingPrice: cart.shippingPrice,
			taxPrice: cart.taxPrice,
			totalPrice: cart.totalPrice,
		});

		const insertedOrderId = await prisma.$transaction(async (tx) => {
			const insertedOrder = await tx.order.create({ data: order });
			for (const item of cart.items as CartItem[]) {
				await tx.orderItem.create({
					data: {
						...item,
						price: item.price,
						orderId: insertedOrder.id,
					},
				});
			}
			await tx.cart.update({
				where: { id: cart.id },
				data: {
					items: [],
					totalPrice: 0,
					shippingPrice: 0,
					taxPrice: 0,
					itemsPrice: 0,
				},
			});

			return insertedOrder.id;
		});

		if (!insertedOrderId) throw new Error("Order not created");

		return {
			success: true,
			message: "Order successfully created",
			redirectTo: `/order/${insertedOrderId}`,
		};
	} catch (error) {
		console.log(error);
		if (isRedirectError(error)) throw error;
		return { success: false, message: formatError(error) };
	}
}

export async function getOrderById(orderId: string) {
	const data = await prisma.order.findFirst({
		where: {
			id: orderId,
		},
		include: {
			orderItems: true,
			user: { select: { name: true, email: true } },
		},
	});

	if (!data) return null;

	// Convert Decimal fields to strings to match Order type
	return {
		...data,
		itemsPrice: data.itemsPrice.toString(),
		shippingPrice: data.shippingPrice.toString(),
		taxPrice: data.taxPrice.toString(),
		totalPrice: data.totalPrice.toString(),
		orderItems: data.orderItems.map((item) => ({
			...item,
			price: item.price.toString(),
		})),
	};
}
