// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage            from "./pages/Home/HomePage";
import EventsListPage      from "./pages/Events/EventsListPage";
import TicketBookingPage   from "./pages/TicketBooking/TicketBookingPage";
import MyTicketsPage       from "./pages/MyTickets/MyTicketPage";       // ✅ fixed typo from MyTicketPage
import PaymentHistoryPage  from "./pages/PaymentHistory/PaymentHistoryPage";
import AdminDashboardPage  from "./pages/Admin/AdminDashboardPage";
import AdminBookingsPage   from "./pages/Admin/AdminBookingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Landing page – shows first ── */}
        <Route path="/" element={<HomePage />} />

        {/* ── Student routes ── */}
        <Route path="/events"               element={<EventsListPage />} />
        <Route path="/events/:eventId/book" element={<TicketBookingPage />} />
        <Route path="/my-tickets"           element={<MyTicketsPage />} />
        <Route path="/payment-history"      element={<PaymentHistoryPage />} />

        {/* ── Admin routes ── */}
        <Route path="/admin"          element={<AdminDashboardPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
import AppRouter from "./routes/AppRouter";

export default function App() {
  return <AppRouter />;
}
