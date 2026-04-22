import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getImageUrl } from "../../api/societyPortalApi";
import { formatTicketLabel, formatTicketPrice, humanizeTicketType } from "../../utils/ticketUtils";
import "./TicketBookingPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STEPS = ["Details", "Tickets", "Payment", "Confirm"];

const formatEventDate = (value) =>
  new Date(value).toLocaleDateString("en-LK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatEventTime = (event) => {
  if (String(event?.time || "").trim()) {
    const [hour = "00", minute = "00"] = String(event.time).split(":");
    const hourValue = Number(hour) || 0;
    return `${hourValue % 12 || 12}:${minute} ${hourValue >= 12 ? "PM" : "AM"}`;
  }

  return new Date(event?.date).toLocaleTimeString("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function PaymentMethodStep({
  totalAmount,
  ticketLabel,
  quantity,
  onConfirm,
  onBack,
  loading,
  error,
}) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [localError, setLocalError] = useState("");
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    bankName: "",
    branch: "",
    referenceNumber: "",
  });

    const [onlineDetails, setOnlineDetails] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleBankChange = (event) => {
    const { name, value } = event.target;
    setBankDetails((previous) => ({ ...previous, [name]: value }));
  };

  const handleOnlineChange = (event) => {
    const { name, value } = event.target;
    if (name === "cardNumber") {
      const cleaned = value.replace(/\D/g, "").slice(0, 16);
      const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
      setOnlineDetails((previous) => ({ ...previous, cardNumber: formatted }));
      return;
    }

    if (name === "cvv") {
      const cleaned = value.replace(/\D/g, "").slice(0, 3);
      setOnlineDetails((previous) => ({ ...previous, cvv: cleaned }));
      return;
    }

    setOnlineDetails((previous) => ({ ...previous, [name]: value }));
  };

  const validateAndConfirm = () => {
    setLocalError("");

    if (paymentMethod === "bank_transfer") {
      if (!bankDetails.accountHolderName.trim()) return setLocalError("Account holder name is required.");
      if (!bankDetails.bankName.trim()) return setLocalError("Bank name is required.");
      if (!bankDetails.branch.trim()) return setLocalError("Branch is required.");
      if (!bankDetails.referenceNumber.trim()) return setLocalError("Transfer reference number is required.");
    }

    if (paymentMethod === "online") {
      if (!onlineDetails.cardholderName.trim()) return setLocalError("Cardholder name is required.");
      if (onlineDetails.cardNumber.replace(/\s/g, "").length !== 16) {
        return setLocalError("Enter a valid 16-digit card number.");
      }
      if (!onlineDetails.expiryDate) {
        return setLocalError("Select expiry date.");
      }
      if (new Date(onlineDetails.expiryDate) < new Date()) {
        return setLocalError("Card expiry date cannot be in the past.");
      }
      if (onlineDetails.cvv.length !== 3) {
        return setLocalError("Enter a valid 3-digit CVV.");
      }
    }

    onConfirm(
      paymentMethod,
      paymentMethod === "bank_transfer"
        ? bankDetails
        : paymentMethod === "online"
          ? onlineDetails
          : null
    );
  };

  return (
    <div className="form-section">
      <h3 className="form-title">Payment</h3>
      <p className="form-subtitle">Choose how you will pay to confirm your booking.</p>

      {error || localError ? <div className="form-error">{localError || error}</div> : null}

      <div className="payment-summary-bar">
        <span>
          {quantity} × {ticketLabel}
        </span>
        <strong>{formatTicketPrice(totalAmount)}</strong>
      </div>

      <div className="ticket-types" style={{ marginTop: "1.25rem" }}>
        {[
          { value: "cash", label: "Cash", desc: "Pay at the event counter" },
          { value: "bank_transfer", label: "Bank Transfer", desc: "Transfer to the university account" },
          { value: "online", label: "Online", desc: "Pay through the online gateway" },
        ].map((method) => (
          <button
            key={method.value}
            type="button"
            className={`ticket-type-card ${paymentMethod === method.value ? "selected" : ""}`}
            onClick={() => {
              setPaymentMethod(method.value);
              setLocalError("");
            }}
          >
            <div className="tt-name">{method.label}</div>
            <div className="tt-seats">{method.desc}</div>
            {paymentMethod === method.value ? <div className="tt-check">✓</div> : null}
          </button>
        ))}
      </div>

      {paymentMethod === "bank_transfer" ? (
        <div className="payment-details-box">
          <div className="payment-details-header">
            <div>
              <div className="payment-details-title">Bank Transfer Details</div>
              <div className="payment-details-sub">
                Transfer the amount and add the reference below.
              </div>
            </div>
          </div>
          <div className="bank-info-card">
            <div className="bank-info-row"><span>Bank</span><strong>Bank of Ceylon</strong></div>
            <div className="bank-info-row"><span>Account Name</span><strong>University of Colombo</strong></div>
            <div className="bank-info-row"><span>Account No.</span><strong>0123456789</strong></div>
            <div className="bank-info-row"><span>Branch</span><strong>Colombo 03</strong></div>
            <div className="bank-info-row"><span>Amount</span><strong>{formatTicketPrice(totalAmount)}</strong></div>
          </div>
          <p className="bank-info-note">
            After completing the transfer, fill in your details below to confirm your booking.
          </p>
          <div className="form-grid">
            <div className="form-group full">
              <label>Account Holder Name *</label>
              <input
                name="accountHolderName"
                value={bankDetails.accountHolderName}
                onChange={handleBankChange}
                placeholder="Your full name as on bank account"
              />
            </div>
            <div className="form-group">
              <label>Your Bank Name *</label>
              <input
                name="bankName"
                value={bankDetails.bankName}
                onChange={handleBankChange}
                placeholder="e.g. Commercial Bank"
              />
            </div>
            <div className="form-group">
              <label>Branch *</label>
              <input
                name="branch"
                value={bankDetails.branch}
                onChange={handleBankChange}
                placeholder="e.g. Nugegoda"
              />
            </div>
            <div className="form-group full">
              <label>Transfer Reference / Transaction ID *</label>
              <input
                name="referenceNumber"
                value={bankDetails.referenceNumber}
                onChange={handleBankChange}
                placeholder="e.g. TXN20260415001"
              />
            </div>
          </div>
        </div>
      ) : null}

      {paymentMethod === "online" ? (
        <div className="payment-details-box">
          <div className="payment-details-header">
            <div>
              <div className="payment-details-title">Card Details</div>
              <div className="payment-details-sub">Enter your card information to complete the payment.</div>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group full">
              <label>Cardholder Name *</label>
              <input
                name="cardholderName"
                value={onlineDetails.cardholderName}
                onChange={handleOnlineChange}
                placeholder="Name as it appears on your card"
              />
            </div>
            <div className="form-group full">
              <label>Card Number *</label>
              <input
                name="cardNumber"
                value={onlineDetails.cardNumber}
                onChange={handleOnlineChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                inputMode="numeric"
              />
            </div>
            <div className="form-group">
              <label>Expiry Date (MM/DD/YYYY) *</label>
              <input
                name="expiryDate"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={onlineDetails.expiryDate}
                onChange={handleOnlineChange}
              />
            </div>
            <div className="form-group">
              <label>CVV *</label>
              <input
                name="cvv"
                value={onlineDetails.cvv}
                onChange={handleOnlineChange}
                placeholder="123"
                maxLength={3}
                inputMode="numeric"
                type="password"
              />
            </div>
          </div>
          <p className="bank-info-note">Your card details are encrypted and secure.</p>
        </div>
      ) : null}

      <div className="form-actions">
        <button className="btn-back" type="button" onClick={onBack}>
          Back
        </button>
        <button className="btn-next" type="button" onClick={validateAndConfirm} disabled={loading}>
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

function BookingSuccess({ result, onGoHome, onGoTickets }) {
  const ticket = result?.ticket;
  const payment = result?.payment;

  return (
    <div className="booking-success">
      <div className="booking-success-icon">🎉</div>
      <h2>Booking Confirmed!</h2>
      <p>Your ticket has been booked successfully.</p>

      <div className="booking-success-card">
        {[
          ["Ticket Number", ticket?.ticketNumber || result?.ticketNumber],
          ["Receipt Number", payment?.receiptNumber || result?.receiptNumber],
          ["Event", ticket?.eventTitle],
          ["Ticket Type", ticket?.ticketLabel || humanizeTicketType(ticket?.ticketType)],
          ["Quantity", ticket?.quantity],
          ["Total Amount", ticket?.totalAmount === 0 ? "Free" : formatTicketPrice(ticket?.totalAmount)],
          ["Payment Status", ticket?.paymentStatus],
          ["Booking Status", ticket?.status],
        ]
          .filter(([, value]) => value != null)
          .map(([label, value]) => (
            <div key={label} className="booking-success-row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
      </div>

      <div className="booking-success-note">
        Go to <strong>My Tickets</strong> with your Student ID and email to view your QR ticket.
      </div>

      <div className="booking-success-actions">
        <button className="btn-back" type="button" onClick={onGoHome}>
          Home
        </button>
        <button className="btn-next" type="button" onClick={onGoTickets}>
          My Tickets
        </button>
      </div>
    </div>
  );
}

export default function TicketBookingPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [event, setEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [form, setForm] = useState({
    studentName: "",
    studentId: "",
    email: "",
    phone: "",
    faculty: "",
    ticketType: "",
    quantity: 1,
  });

  useEffect(() => {
    setEventLoading(true);
    setError("");

    fetch(`${API_BASE}/events/public/${eventId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data?._id) {
          setEvent(data);
        } else {
          setError(data?.message || "Event not found.");
        }
      })
      .catch(() => setError("Failed to load event. Make sure your backend is running."))
      .finally(() => setEventLoading(false));
  }, [eventId]);

  useEffect(() => {
    if (event?.tickets?.length > 0) {
      setForm((previous) => ({
        ...previous,
        ticketType:
          event.tickets.find((ticket) => ticket.type === previous.ticketType)?.type ||
          event.tickets[0].type,
        quantity: 1,
      }));
    }
  }, [event]);

  const selectedTicket = useMemo(
    () => event?.tickets?.find((ticket) => ticket.type === form.ticketType) || null,
    [event, form.ticketType]
  );
  const ticketLabel = selectedTicket ? formatTicketLabel(selectedTicket) : "Ticket";
  const unitPrice = Number(selectedTicket?.price) || 0;
  const availableSeats = Number(selectedTicket?.availableSeats ?? selectedTicket?.totalSeats ?? 0);
  const totalAmount = unitPrice * Number(form.quantity || 0);
  const isFree = totalAmount === 0;
  const bannerImage = getImageUrl(event?.bannerImage || event?.image);

  const handleChange = (eventNode) => {
    const { name, value } = eventNode.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const validateStep0 = () => {
    if (!form.studentName.trim()) return "Full name is required.";
    const cleanStudentId = form.studentId.trim();
    if (!cleanStudentId) return "Student ID is required.";
    if (!/^it[0-9]{8}$/i.test(cleanStudentId)) {
      return 'Student ID must be "it" + exactly 8 digits (for example: it23711228).';
    }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "Valid email is required.";

    const cleanPhone = form.phone.trim();
    if (cleanPhone && !/^07[0-9]{8}$/.test(cleanPhone)) {
      return 'Phone must be 10 digits starting with "07" (for example: 0712345678).';
    }

    return "";
  };

  const handleNextFromDetails = () => {
    const nextError = validateStep0();
    if (nextError) {
      setError(nextError);
      return;
    }

    setError("");
    setStep(1);
  };

  const handleNextFromTickets = async () => {
    if (!selectedTicket) {
      setError("Select a ticket option first.");
      return;
    }

    if (availableSeats <= 0) {
      setError("This ticket tier is sold out.");
      return;
    }

    if (Number(form.quantity) > availableSeats) {
      setError(`Only ${availableSeats} seat(s) are left for ${ticketLabel}.`);
      return;
    }

    if (isFree) {
      await handleConfirmBooking("not_required", null);
      return;
    }

    setError("");
    setStep(2);
  };

  const handleConfirmBooking = async (paymentMethod, paymentDetails = null) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/tickets/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event._id,
          studentName: form.studentName,
          studentId: form.studentId,
          email: form.email,
          phone: form.phone,
          faculty: form.faculty,
          ticketType: form.ticketType,
          quantity: Number(form.quantity),
          paymentMethod,
          ...(paymentDetails ? { paymentDetails } : {}),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Booking failed");
      }

      localStorage.setItem("studentId", form.studentId.trim());
      localStorage.setItem("studentEmail", form.email.trim().toLowerCase());
      setBookingResult(data);
      setStep(3);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  if (eventLoading) {
    return (
      <div className="booking-state">
        <div className="booking-loader" />
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="booking-state">
        <h2>Event Not Found</h2>
        <p>{error || "This event does not exist."}</p>
        <button className="btn-next" type="button" onClick={() => navigate("/events")}>
          Back to Events
        </button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="booking-page booking-page-success">
        <main className="booking-main booking-main-success">
          <BookingSuccess
            result={bookingResult}
            onGoHome={() => navigate("/")}
            onGoTickets={() => navigate("/my-tickets")}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <aside className="booking-sidebar">
        <div className="event-badge">{event.category || "Event"}</div>
        <h2 className="event-title">{event.title}</h2>

        {bannerImage ? (
          <div className="booking-sidebar-image">
            <img src={bannerImage} alt={event.title} />
          </div>
        ) : null}

        <div className="event-meta">
          {[
            { icon: "📅", label: "Date", value: formatEventDate(event.date) },
            { icon: "⏰", label: "Time", value: formatEventTime(event) },
            { icon: "📍", label: "Venue", value: event.venue },
            { icon: "🏛️", label: "Organizer", value: event.organizer },
          ].map((item) => (
            <div className="meta-item" key={item.label}>
              <span className="meta-icon">{item.icon}</span>
              <div>
                <div className="meta-label">{item.label}</div>
                <div className="meta-value">{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="event-desc">{event.description}</p>

        <div className="pricing-table">
          <div className="pricing-title">Ticket Pricing</div>
          {event.tickets?.map((ticket, index) => (
            <div key={ticket.type || index} className="pricing-row">
              <div>
                <div className="pricing-type">{formatTicketLabel(ticket, index)}</div>
                <div className="pricing-note">
                  {Number(ticket.availableSeats ?? ticket.totalSeats ?? 0)} seats available
                </div>
              </div>
              <span className="pricing-amount">{formatTicketPrice(ticket.price)}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="booking-main">
        <div className="step-indicator">
          {STEPS.map((label, index) => (
            <div key={label} className={`step ${index === step ? "active" : index < step ? "done" : ""}`}>
              <div className="step-dot">{index < step ? "✓" : index + 1}</div>
              <span className="step-label">{label}</span>
              {index < STEPS.length - 1 ? <div className="step-line" /> : null}
            </div>
          ))}
        </div>

        <div className="form-card">
          {step === 0 ? (
            <div className="form-section">
              <h3 className="form-title">Your Details</h3>
              <p className="form-subtitle">Enter your university information to book tickets.</p>
              {error ? <div className="form-error">{error}</div> : null}

              <div className="form-grid">
                <div className="form-group full">
                  <label>Full Name *</label>
                  <input
                    name="studentName"
                    value={form.studentName}
                    onChange={handleChange}
                    placeholder="e.g. Kavindu Perera"
                    maxLength={100}
                  />
                </div>
                <div className="form-group">
                  <label>Student ID *</label>
                  <input
                    name="studentId"
                    value={form.studentId}
                    onChange={handleChange}
                    placeholder="it23711228"
                    maxLength={10}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@uni.ac.lk"
                  />
                </div>
                <div className="form-group">
                  <label>Phone (Optional)</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                    maxLength={10}
                  />
                </div>
                <div className="form-group">
                  <label>Faculty (Optional)</label>
                  <input
                    list="faculty-list"
                    name="faculty"
                    value={form.faculty}
                    onChange={handleChange}
                    placeholder="e.g. Faculty of Computing"
                  />
                  <datalist id="faculty-list">
                    <option>Faculty of Computing</option>
                    <option>Faculty of architecture</option>
                    <option>Faculty of Business</option>
                    <option>Faculty of Humanity</option>
                    <option>Management</option>
                    <option>Other</option>
                  </datalist>
                </div>
              </div>

              <button className="btn-next" type="button" onClick={handleNextFromDetails}>
                Continue to Tickets
              </button>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="form-section">
              <h3 className="form-title">Select Tickets</h3>
              <p className="form-subtitle">Choose your preferred ticket tier and quantity.</p>
              {error ? <div className="form-error">{error}</div> : null}

              <div className="ticket-types">
                {event.tickets?.map((ticket, index) => {
                  const seatsLeft = Number(ticket.availableSeats ?? ticket.totalSeats ?? 0);
                  const isSelected = form.ticketType === ticket.type;
                  const isSoldOut = seatsLeft <= 0;

                  return (
                    <button
                      key={ticket.type || index}
                      type="button"
                      className={`ticket-type-card ${isSelected ? "selected" : ""}`}
                      onClick={() =>
                        !isSoldOut &&
                        setForm((previous) => ({
                          ...previous,
                          ticketType: ticket.type,
                          quantity: 1,
                        }))
                      }
                      disabled={isSoldOut}
                    >
                      <div className="tt-name">{formatTicketLabel(ticket, index)}</div>
                      <div className="tt-price">{formatTicketPrice(ticket.price)}</div>
                      <div className="tt-seats">
                        {isSoldOut ? "Sold out" : `${seatsLeft} seats available`}
                      </div>
                      {isSelected ? <div className="tt-check">✓</div> : null}
                    </button>
                  );
                })}
              </div>

              <div className="form-group qty-group">
                <label>Quantity</label>
                <div className="qty-control">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        quantity: Math.max(1, Number(previous.quantity) - 1),
                      }))
                    }
                  >
                    −
                  </button>
                  <span>{form.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        quantity: Math.min(Math.max(1, Math.min(10, availableSeats || 1)), Number(previous.quantity) + 1),
                      }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="order-summary">
                {[
                  ["Ticket Type", ticketLabel],
                  ["Unit Price", formatTicketPrice(unitPrice)],
                  ["Quantity", `× ${form.quantity}`],
                ].map(([label, value]) => (
                  <div className="summary-row" key={label}>
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatTicketPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-back" type="button" onClick={() => setStep(0)}>
                  Back
                </button>
                <button className="btn-next" type="button" onClick={handleNextFromTickets} disabled={loading}>
                  {loading ? "Processing..." : isFree ? "Book Free Ticket" : "Proceed to Payment"}
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <PaymentMethodStep
              totalAmount={totalAmount}
              ticketLabel={ticketLabel}
              quantity={Number(form.quantity)}
              onConfirm={handleConfirmBooking}
              onBack={() => setStep(1)}
              loading={loading}
              error={error}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
