// src/pages/TicketBooking/TicketBookingPage.jsx
// UniConnect – Full Ticket Booking Flow (fetches real event from API)

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./TicketBookingPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STEPS = ["Details", "Tickets", "Payment", "Confirm"];

// ─────────────────────────────────────────────
// 💳  Payment Method Step
// ─────────────────────────────────────────────
function PaymentMethodStep({ totalAmount, ticketType, quantity, onConfirm, onBack, loading, error }) {
  const [paymentMethod, setPaymentMethod] = useState("cash");

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

  const [localError, setLocalError] = useState("");

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleOnlineChange = (e) => {
    const { name, value } = e.target;
    if (name === "cardNumber") {
      const cleaned   = value.replace(/\D/g, "").slice(0, 16);
      const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
      setOnlineDetails((prev) => ({ ...prev, cardNumber: formatted }));
      return;
    }
    if (name === "expiryDate") {
      // type="month" already formats YYYY-MM, no manual formatting needed
      setOnlineDetails((prev) => ({ ...prev, [name]: value }));
      return;
    }
    if (name === "cvv") {
      const cleaned = value.replace(/\D/g, "").slice(0, 3);
      setOnlineDetails((prev) => ({ ...prev, cvv: cleaned }));
      return;
    }
    setOnlineDetails((prev) => ({ ...prev, [name]: value }));
  };

  const validateAndConfirm = () => {
    setLocalError("");
    if (paymentMethod === "bank_transfer") {
      if (!bankDetails.accountHolderName.trim()) return setLocalError("Account holder name is required.");
      if (!bankDetails.bankName.trim())          return setLocalError("Bank name is required.");
      if (!bankDetails.branch.trim())            return setLocalError("Branch is required.");
      if (!bankDetails.referenceNumber.trim())   return setLocalError("Transfer reference number is required.");
    }
    if (paymentMethod === "online") {
      if (!onlineDetails.cardholderName.trim())                      return setLocalError("Cardholder name is required.");
      if (onlineDetails.cardNumber.replace(/\s/g, "").length !== 16) return setLocalError("Enter a valid 16-digit card number.");
      if (onlineDetails.expiryDate.length !== 5)                     return setLocalError("Enter expiry date as MM/YY.");
      if (onlineDetails.cvv.length !== 3)                            return setLocalError("Enter a valid 3-digit CVV.");
    }
    onConfirm(
      paymentMethod,
      paymentMethod === "bank_transfer" ? bankDetails :
      paymentMethod === "online"        ? onlineDetails : null
    );
  };

  return (
    <div className="form-section">
      <h3 className="form-title">Payment</h3>
      <p className="form-subtitle">Choose how you will pay to confirm your booking.</p>

      {(error || localError) && (
        <div className="form-error">{localError || error}</div>
      )}

      <div className="payment-summary-bar">
        <span>{quantity}× {ticketType.replace("_", " ")} ticket</span>
        <strong>Rs. {totalAmount.toLocaleString()}</strong>
      </div>

      {/* ── Payment Method Cards ── */}
      <div className="ticket-types" style={{ marginTop: "1.5rem" }}>
        {[
          { value: "cash",          label: "💵 Cash",         desc: "Pay at the event counter" },
          { value: "bank_transfer", label: "🏦 Bank Transfer", desc: "Transfer to university account" },
          { value: "online",        label: "💳 Online",        desc: "Pay via online gateway" },
        ].map((m) => (
          <div
            key={m.value}
            className={`ticket-type-card ${paymentMethod === m.value ? "selected" : ""}`}
            onClick={() => { setPaymentMethod(m.value); setLocalError(""); }}
          >
            <div className="tt-name">{m.label}</div>
            <div className="tt-seats">{m.desc}</div>
            {paymentMethod === m.value && <div className="tt-check">✓</div>}
          </div>
        ))}
      </div>

      {/* ── Bank Transfer Details ── */}
      {paymentMethod === "bank_transfer" && (
        <div className="payment-details-box" style={{ marginTop: "1.5rem" }}>
          <div className="payment-details-header">
            <span>🏦</span>
            <div>
              <div className="payment-details-title">Bank Transfer Details</div>
              <div className="payment-details-sub">Transfer the amount to the university account and enter your reference below.</div>
            </div>
          </div>
          <div className="bank-info-card">
            <div className="bank-info-row"><span>Bank</span><strong>Bank of Ceylon</strong></div>
            <div className="bank-info-row"><span>Account Name</span><strong>University of Colombo</strong></div>
            <div className="bank-info-row"><span>Account No.</span><strong>0123456789</strong></div>
            <div className="bank-info-row"><span>Branch</span><strong>Colombo 03</strong></div>
            <div className="bank-info-row"><span>Amount</span><strong style={{ color: "#4361ee" }}>Rs. {totalAmount.toLocaleString()}</strong></div>
          </div>
          <p className="bank-info-note">
            ⚠️ After completing the transfer, fill in your details below to confirm your booking.
          </p>
          <div className="form-grid" style={{ marginTop: "1rem" }}>
            <div className="form-group full">
              <label>Account Holder Name *</label>
              <input name="accountHolderName" value={bankDetails.accountHolderName} onChange={handleBankChange} placeholder="Your full name as on bank account" />
            </div>
            <div className="form-group">
              <label>Your Bank Name *</label>
              <input name="bankName" value={bankDetails.bankName} onChange={handleBankChange} placeholder="e.g. Commercial Bank" />
            </div>
            <div className="form-group">
              <label>Branch *</label>
              <input name="branch" value={bankDetails.branch} onChange={handleBankChange} placeholder="e.g. Nugegoda" />
            </div>
            <div className="form-group full">
              <label>Transfer Reference / Transaction ID *</label>
              <input name="referenceNumber" value={bankDetails.referenceNumber} onChange={handleBankChange} placeholder="e.g. TXN20260415001" />
            </div>
          </div>
        </div>
      )}

      {/* ── Online Payment Details ── */}
      {paymentMethod === "online" && (
        <div className="payment-details-box" style={{ marginTop: "1.5rem" }}>
          <div className="payment-details-header">
            <span>💳</span>
            <div>
              <div className="payment-details-title">Card Details</div>
              <div className="payment-details-sub">Enter your card information to complete the payment.</div>
            </div>
          </div>
          <div className="form-grid" style={{ marginTop: "1rem" }}>
            <div className="form-group full">
              <label>Cardholder Name *</label>
              <input name="cardholderName" value={onlineDetails.cardholderName} onChange={handleOnlineChange} placeholder="Name as it appears on your card" />
            </div>
            <div className="form-group full">
              <label>Card Number *</label>
              <input name="cardNumber" value={onlineDetails.cardNumber} onChange={handleOnlineChange} placeholder="1234 5678 9012 3456" maxLength={19} inputMode="numeric" />
            </div>
            <div className="form-group">
              <label>Expiry Date *</label>
              <input 
                name="expiryDate" 
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={onlineDetails.expiryDate}
                onChange={handleOnlineChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>CVV *</label>
              <input name="cvv" value={onlineDetails.cvv} onChange={handleOnlineChange} placeholder="123" maxLength={3} inputMode="numeric" type="password" />
            </div>
          </div>
          <p className="bank-info-note">
            🔒 Your card details are encrypted and secure. We do not store your card information.
          </p>
        </div>
      )}

      <div className="form-actions" style={{ marginTop: "2rem" }}>
        <button className="btn-back" onClick={onBack}>← Back</button>
        <button className="btn-next" onClick={validateAndConfirm} disabled={loading}>
          {loading ? "Booking..." : "Confirm Booking →"}
        </button>
      </div>

      <div className="secure-badge">🔒 Your booking is secured</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ✅  Success Step
// ─────────────────────────────────────────────
function BookingSuccess({ result }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 2rem" }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
      <h2 style={{ color: "#22c55e", marginBottom: "0.5rem" }}>Booking Confirmed!</h2>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>
        Your ticket has been booked successfully.
      </p>
      <div style={{
        background: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: "12px", padding: "1.5rem", maxWidth: "400px",
        margin: "0 auto 2rem", textAlign: "left",
      }}>
        {[
          ["Ticket Number",  result?.ticket?.ticketNumber  || result?.ticketNumber],
          ["Receipt Number", result?.payment?.receiptNumber || result?.receiptNumber],
          ["Event",          result?.ticket?.eventTitle],
          ["Ticket Type",    result?.ticket?.ticketType?.replace("_", " ")],
          ["Quantity",       result?.ticket?.quantity],
          ["Total Amount",   result?.ticket?.totalAmount === 0 ? "Free" : `Rs. ${result?.ticket?.totalAmount?.toLocaleString()}`],
          ["Payment Status", result?.ticket?.paymentStatus],
          ["Booking Status", result?.ticket?.status],
        ].map(([label, value]) => value != null && (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between",
            padding: "0.5rem 0", borderBottom: "1px solid #e2e8f0",
            fontSize: "0.9rem",
          }}>
            <span style={{ color: "#64748b" }}>{label}</span>
            <span style={{ fontWeight: 600, color: "#1e293b", textTransform: "capitalize" }}>{value}</span>
          </div>
        ))}
      </div>
      <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
        A confirmation will be sent to your email. Please bring your ticket number to the event.
      </p>
      <div style={{ marginTop: "2rem", padding: "1.5rem", background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: "12px", textAlign: "left" }}>
        <div style={{ fontSize: "1.2rem", marginBottom: "0.75rem", color: "#166534", fontWeight: "600" }}>
          🎉 Next Steps:
        </div>
        <ol style={{ color: "#166534", paddingLeft: "1.5rem", margin: 0 }}>
          <li>Go to <strong>Home → My Tickets</strong></li>
          <li>Enter your <strong>Student ID</strong> and <strong>Email</strong></li>
          <li>View your ticket with QR code ✓</li>
        </ol>
      </div>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem" }}>
        <button
          className="btn-next"
          style={{ background: "#3b82f6", flex: 1 }}
          onClick={() => window.location.href = "/"}
        >
          🏠 Home
        </button>
        <button
          className="btn-next"
          style={{ flex: 1 }}
          onClick={() => window.location.href = "/my-tickets"}
        >
          🎫 My Tickets
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 🏠  Main Page
// ─────────────────────────────────────────────
export default function TicketBookingPage() {
  const { eventId } = useParams();

  const [step, setStep]                   = useState(0);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [event, setEvent]                 = useState(null);
  const [eventLoading, setEventLoading]   = useState(true);

  // ── Fetch event from correct API endpoint ──
  useEffect(() => {
    setEventLoading(true);
    setError("");
    fetch(`${API_BASE}/events/${eventId}`)          // ✅ FIXED: was /tickets/events/
      .then((r) => r.json())
      .then((data) => {
        if (data._id) {
          setEvent(data);
        } else {
          setError(data.message || "Event not found.");
        }
      })
      .catch(() => setError("Failed to load event. Make sure your backend is running."))
      .finally(() => setEventLoading(false));
  }, [eventId]);

  const [form, setForm] = useState({
    studentName: "",
    studentId:   "",
    email:       "",
    phone:       "",
    faculty:     "",
    ticketType:  "general",
    quantity:    1,
  });

  const selectedTicket = event?.tickets?.find((t) => t.type === form.ticketType);
  const unitPrice      = selectedTicket?.price || 0;
  const totalAmount    = unitPrice * form.quantity;
  const isFree         = totalAmount === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep0 = () => {
    if (!form.studentName.trim()) return "Full name is required.";
    const cleanStudentId = form.studentId.trim();
    if (!cleanStudentId) return "Student ID is required.";
    if (!/^it[0-9]{8}$/i.test(cleanStudentId)) return 'Student ID must be "it" + exactly 8 digits (it23711228)';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "Valid email is required.";
    
    // Phone validation (if provided)
    const cleanPhone = form.phone.trim();
    if (cleanPhone && !/^07[0-9]{8}$/.test(cleanPhone)) {
      return 'Phone must be 10 digits starting with "07" (e.g. 0712345678)';
    }
    return "";
  };

  const handleNextFromDetails = () => {
    const err = validateStep0();
    if (err) { setError(err); return; }
    setError("");
    setStep(1);
  };

  const handleNextFromTickets = async () => {
    if (isFree) {
      await handleConfirmBooking("not_required", null);
    } else {
      setError("");
      setStep(2);
    }
  };

  const handleConfirmBooking = async (paymentMethod, paymentDetails = null) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/tickets/book`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId:     event._id,
          studentName: form.studentName,
          studentId:   form.studentId,
          email:       form.email,
          phone:       form.phone,
          faculty:     form.faculty,
          ticketType:  form.ticketType,
          quantity:    Number(form.quantity),
          paymentMethod,
          ...(paymentDetails && { paymentDetails }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Booking failed");
      }

      setBookingResult(data);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-LK", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-LK", {
      hour: "2-digit", minute: "2-digit",
    });

  // ── Loading ──
  if (eventLoading) {
    return (
      <div style={{ padding: "5rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
        <p style={{ color: "#64748b" }}>Loading event details...</p>
      </div>
    );
  }

  // ── Not found ──
  if (!event) {
    return (
      <div style={{ padding: "5rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
        <h2 style={{ color: "#ef4444" }}>Event Not Found</h2>
        <p style={{ color: "#64748b", marginTop: "0.5rem" }}>{error || "This event does not exist."}</p>
        <button
          onClick={() => window.location.href = "/events"}
          style={{
            marginTop: "1.5rem", padding: "0.75rem 1.5rem",
            background: "#4361ee", color: "#fff",
            border: "none", borderRadius: "8px", cursor: "pointer",
          }}
        >
          ← Back to Events
        </button>
      </div>
    );
  }

  // ── Success ──
  if (step === 3) return <BookingSuccess result={bookingResult} />;

  return (
    <div className="booking-page">

      {/* ── Left Panel: Event Info ── */}
      <aside className="booking-sidebar">
        <div className="event-badge">{event.status}</div>
        <h2 className="event-title">{event.title}</h2>
        <div className="event-meta">
          {[
            { icon: "📅", label: "Date",      value: formatDate(event.date) },
            { icon: "⏰", label: "Time",      value: formatTime(event.date) },
            { icon: "📍", label: "Venue",     value: event.venue },
            { icon: "🏛️", label: "Organizer", value: event.organizer },
          ].map(({ icon, label, value }) => (
            <div className="meta-item" key={label}>
              <span className="meta-icon">{icon}</span>
              <div>
                <div className="meta-label">{label}</div>
                <div className="meta-value">{value}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="event-desc">{event.description}</p>
        <div className="pricing-table">
          <div className="pricing-title">Ticket Pricing</div>
          {event.tickets?.map((t) => (
            <div key={t.type} className="pricing-row">
              <span className="pricing-type">{t.type.replace("_", " ")}</span>
              <span className="pricing-amount">
                {t.price === 0 ? "Free" : `Rs. ${t.price.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Right Panel: Booking Form ── */}
      <main className="booking-main">

        {/* Step indicator */}
        <div className="step-indicator">
          {STEPS.map((label, i) => (
            <div key={label} className={`step ${i === step ? "active" : i < step ? "done" : ""}`}>
              <div className="step-dot">{i < step ? "✓" : i + 1}</div>
              <span className="step-label">{label}</span>
              {i < STEPS.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="form-card">

          {/* ── STEP 0: Student Details ── */}
          {step === 0 && (
            <div className="form-section">
              <h3 className="form-title">Your Details</h3>
              <p className="form-subtitle">Enter your university information to book tickets.</p>
              {error && <div className="form-error">{error}</div>}
              <div className="form-grid">
                <div className="form-group full">
                  <label>Full Name *</label>
                  <input 
                    required 
                    minLength="2" 
                    maxLength="100"
                    name="studentName" 
                    value={form.studentName} 
                    onChange={handleChange}
                    placeholder="e.g. Kavindu Perera" 
                  />
                </div>
                <div className="form-group">
                  <label>Student ID *</label>
                  <input 
                    required 
                    minLength="3" 
                    maxLength="20"
                    pattern="[a-zA-Z]+\/[0-9]+"
                    title="Format: FACULTY/NUMBER (e.g. ITxxxxxxxx)"
                    name="studentId" 
                    value={form.studentId} 
                    onChange={handleChange}
placeholder="itxxxxxxxx" 

                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    required 
                    type="email" 
                    pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                    name="email" 
                    value={form.email} 
                    onChange={handleChange}
                    placeholder="you@uni.ac.lk" 
                  />
                </div>
                <div className="form-group">
                  <label>Phone (Optional)</label>
                  <input 
                    pattern="07[0-9]{8}"
                    inputMode="tel"
                    maxLength="10"
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange}
                    placeholder="07XXXXXXXX" 
                  />
                </div>
                <div className="form-group">
                  <label>Faculty (Optional)</label>
                  <input 
                    list="faculty-list"
                    maxLength="50"
                    name="faculty" 
                    value={form.faculty} 
                    onChange={handleChange}
                    placeholder="e.g. Faculty of Science" 
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
              <button className="btn-next" onClick={handleNextFromDetails}>
                Continue to Tickets →
              </button>
            </div>
          )}

          {/* ── STEP 1: Ticket Selection ── */}
          {step === 1 && (
            <div className="form-section">
              <h3 className="form-title">Select Tickets</h3>
              <p className="form-subtitle">Choose your ticket type and quantity.</p>
              {error && <div className="form-error">{error}</div>}
              <div className="ticket-types">
                {event.tickets?.map((t) => (
                  <div
                    key={t.type}
                    className={`ticket-type-card ${form.ticketType === t.type ? "selected" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, ticketType: t.type }))}
                  >
                    <div className="tt-name">{t.type.replace("_", " ")}</div>
                    <div className="tt-price">
                      {t.price === 0 ? "Free" : `Rs. ${t.price.toLocaleString()}`}
                    </div>
                    <div className="tt-seats">{t.totalSeats} seats available</div>
                    {form.ticketType === t.type && <div className="tt-check">✓</div>}
                  </div>
                ))}
              </div>

              <div className="form-group qty-group">
                <label>Quantity</label>
                <div className="qty-control">
                  <button onClick={() => setForm((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}>−</button>
                  <span>{form.quantity}</span>
                  <button onClick={() => setForm((p) => ({ ...p, quantity: Math.min(10, p.quantity + 1) }))}>+</button>
                </div>
              </div>

              <div className="order-summary">
                {[
                  ["Ticket Type", form.ticketType.replace("_", " ")],
                  ["Unit Price",  unitPrice === 0 ? "Free" : `Rs. ${unitPrice.toLocaleString()}`],
                  ["Quantity",    `× ${form.quantity}`],
                ].map(([label, value]) => (
                  <div className="summary-row" key={label}>
                    <span>{label}</span><span>{value}</span>
                  </div>
                ))}
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{totalAmount === 0 ? "Free" : `Rs. ${totalAmount.toLocaleString()}`}</span>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-back" onClick={() => setStep(0)}>← Back</button>
                <button className="btn-next" onClick={handleNextFromTickets} disabled={loading}>
                  {loading ? "Processing..." : isFree ? "Book Free Ticket →" : "Proceed to Payment →"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Payment Method ── */}
          {step === 2 && (
            <PaymentMethodStep
              totalAmount={totalAmount}
              ticketType={form.ticketType}
              quantity={form.quantity}
              onConfirm={handleConfirmBooking}
              onBack={() => setStep(1)}
              loading={loading}
              error={error}
            />
          )}

        </div>
      </main>
    </div>
  );
}
