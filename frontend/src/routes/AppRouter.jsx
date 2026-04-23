import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminBookingsPage from "../pages/Admin/AdminBookingsPage";
import AdminDashboardPage from "../pages/Admin/AdminDashboardPage";
import EventsListPage from "../pages/Events/EventsListPage";
import HomePage from "../pages/Home/HomePage";
import MyTicketsPage from "../pages/MyTickets/MyTicketPage";
import PaymentHistoryPage from "../pages/PaymentHistory/PaymentHistoryPage";
import TicketBookingPage from "../pages/TicketBooking/TicketBookingPage";
import CreateEvent from "../pages/CreateEvent";
import SocietyRegisterByToken from "../pages/SocietyRegisterByToken";
import SocietyRequestDetail from "../pages/SocietyRequestDetail";
import SocietyRequestSubmit from "../pages/SocietyRequestSubmit";
import SocietyRequestsAdmin from "../pages/SocietyRequestsAdmin";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/:eventId/book" element={<TicketBookingPage />} />
        <Route path="/my-tickets" element={<MyTicketsPage />} />
        <Route path="/payment-history" element={<PaymentHistoryPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/submit" element={<SocietyRequestSubmit />} />
        <Route path="/admin/requests" element={<SocietyRequestsAdmin />} />
        <Route path="/admin/requests/:id" element={<SocietyRequestDetail />} />
        <Route path="/society-register/:token" element={<SocietyRegisterByToken />} />
        <Route path="/create-event/:token" element={<CreateEvent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
