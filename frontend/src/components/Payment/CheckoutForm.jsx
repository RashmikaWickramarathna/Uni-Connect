// src/components/Payment/CheckoutForm.jsx
// UniConnect – Stripe Checkout Form Component

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { paymentAPI, ticketAPI } from "../../services/api";
import "./CheckoutForm.css";

export default function CheckoutForm({ bookingData, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    try {
      // 1. Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setMessage(error.message || "Payment failed. Please try again.");
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // 2. Save payment record to DB
        await paymentAPI.savePayment({
          paymentIntentId: paymentIntent.id,
          amount: bookingData.totalAmount,
          studentName: bookingData.studentName,
          studentId: bookingData.studentId,
          email: bookingData.email,
          paymentType: "ticket_booking",
          stripeStatus: "succeeded",
          eventId: bookingData.eventId,
          eventName: bookingData.eventTitle,
          ticketType: bookingData.ticketType,
          quantity: bookingData.quantity,
        });

        // 3. Book the ticket
        const ticketRes = await ticketAPI.book({
          ...bookingData,
          paymentIntentId: paymentIntent.id,
          stripeStatus: "succeeded",
        });

        onSuccess(ticketRes);
      }
    } catch (err) {
      setMessage(err.message || "Something went wrong.");
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <div className="payment-element-wrapper">
        <PaymentElement />
      </div>

      {message && (
        <div className="checkout-error">
          <span>⚠️</span> {message}
        </div>
      )}

      <button
        className="pay-btn"
        type="submit"
        disabled={!stripe || loading}
      >
        {loading ? (
          <span className="btn-loading">
            <span className="spinner" /> Processing...
          </span>
        ) : (
          `Pay Rs. ${bookingData?.totalAmount?.toLocaleString()}`
        )}
      </button>
    </form>
  );
}
