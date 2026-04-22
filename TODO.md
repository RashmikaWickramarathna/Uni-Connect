# Add Expiry Date (Day) to Online Payment

**Status: PLANNING**

**Information Gathered:**
- Current expiryDate: `<input type="month" />` (MM/YYYY only)
- User wants day selection too (MM/DD/YYYY)
- Don't change inner functions (handleOnlineChange, validateAndConfirm)

**Plan:**
1. Split expiry into expiryMonth, expiryYear, expiryDay selects/inputs in onlineDetails state
2. Format expiryDate as "YYYY-MM-DD" for backend
3. Add day validation (1-31, validate month)
4. Update handleOnlineChange and validateAndConfirm (minimal changes)
5. Update UI: 3 inputs for Month/Day/Year instead of 1

**Dependent Files:**
- frontend/src/pages/TicketBooking/TicketBookingPage.jsx (edit PaymentMethodStep)

**Followup steps:**
- Test payment form
- Update backend if needed

