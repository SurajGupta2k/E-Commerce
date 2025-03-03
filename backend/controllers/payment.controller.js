import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";

export const createCheckoutSession = async (req, res) => {
	try {
		const { productId, couponCode } = req.body;
		const product = await Product.findById(productId);
		
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode });
			if (!coupon) {
				return res.status(404).json({ message: "Coupon not found" });
			}
			if (!coupon.isActive) {
				return res.status(400).json({ message: "Coupon is not active" });
			}
		}

		// Create order without Stripe
		const order = await Order.create({
			product: productId,
			user: req.user._id,
			coupon: coupon?._id,
			status: "pending",
			totalAmount: product.price * (1 - (coupon?.discountPercentage || 0) / 100)
		});

		res.status(200).json({ 
			orderId: order._id,
			totalAmount: order.totalAmount
		});
	} catch (error) {
		console.error("Error in createCheckoutSession:", error);
		res.status(500).json({ message: "Error creating checkout session" });
	}
};

export const handleWebhook = async (req, res) => {
	try {
		// Implement your own payment webhook handling here
		res.status(200).json({ received: true });
	} catch (error) {
		console.error("Error in webhook handler:", error);
		res.status(500).json({ message: "Error handling webhook" });
	}
};

export const getPaymentStatus = async (req, res) => {
	try {
		const { orderId } = req.params;
		const order = await Order.findById(orderId);
		
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		res.status(200).json({
			status: order.status,
			totalAmount: order.totalAmount
		});
	} catch (error) {
		console.error("Error in getPaymentStatus:", error);
		res.status(500).json({ message: "Error getting payment status" });
	}
};