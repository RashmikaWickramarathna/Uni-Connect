// src/components/Payment/PaymentSuccess.jsx
// UniConnect – Payment Success Screen

import { useNavigate } from "react-router-dom";
import "./PaymentSuccess.css";

export default function PaymentSuccess({ ticket }) {
  const navigate = useNavigate();

  return (
    <div className="success-wrapper">
      <div className="success-card">
        {/* Animated checkmark */}
        <div className="success-icon">
          <svg viewBox="0 0 52 52" className="checkmark">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14 27l7 7 16-16" />
          </svg>
        </div>

        <h1 className="success-title">Booking Confirmed!</h1>
        <p className="success-sub">Your ticket has been booked successfully.</p>

        {ticket && (
          <div className="ticket-summary">
            <div className="ticket-row">
              <span className="ticket-label">Ticket No.</span>
              <span className="ticket-value highlight">{ticket.ticketNumber}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Event</span>
              <span className="ticket-value">{ticket.ticket?.eventTitle}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Name</span>
              <span className="ticket-value">{ticket.ticket?.studentName}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Type</span>
              <span className="ticket-value">{ticket.ticket?.ticketType}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Qty</span>
              <span className="ticket-value">{ticket.ticket?.quantity}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Amount Paid</span>
              <span className="ticket-value">
                Rs. {ticket.ticket?.totalAmount?.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <p className="success-note">
          📧 A confirmation has been sent to your email. Please bring your ticket number to the event entrance.
        </p>

        <div className="success-actions">
          <button
            className="btn-primary"
            onClick={() => navigate("/my-tickets")}
          >
            View My Tickets
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate("/events")}
          >
            Browse More Events
          </button>
        </div>
      </div>
    </div>
  );
}
