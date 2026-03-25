import { BrowserRouter, Routes, Route } from "react-router-dom";
import SocietyRequestSubmit from "../pages/SocietyRequestSubmit";
import SocietyRequestsAdmin from "../pages/SocietyRequestsAdmin";
import SocietyRequestDetail from "../pages/SocietyRequestDetail";
import SocietyRegisterByToken from "../pages/SocietyRegisterByToken";
import AdminDashboard from "../pages/AdminDashboard";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SocietyRequestSubmit />} />
        <Route path="/admin/requests" element={<SocietyRequestsAdmin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/requests/:id" element={<SocietyRequestDetail />} />
        <Route path="/society-register/:token" element={<SocietyRegisterByToken />} />
      </Routes>
    </BrowserRouter>
  );
}