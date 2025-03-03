import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrderSummary = ({ product, couponCode }) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const handleCheckout = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await axios.post("/api/payment/create-checkout-session", {
				productId: product._id,
				couponCode
			});

			// Navigate to a confirmation page with the order ID
			navigate(`/order-confirmation/${response.data.orderId}`);
		} catch (error) {
			setError(error.response?.data?.message || "Error processing checkout");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="order-summary">
			<h2>Order Summary</h2>
			<div className="product-details">
				<h3>{product.name}</h3>
				<p>Price: ${product.price}</p>
				{couponCode && <p>Coupon Applied: {couponCode}</p>}
			</div>
			{error && <div className="error-message">{error}</div>}
			<button 
				onClick={handleCheckout} 
				disabled={loading}
				className="checkout-button"
			>
				{loading ? "Processing..." : "Proceed to Checkout"}
			</button>
		</div>
	);
};

export default OrderSummary;
