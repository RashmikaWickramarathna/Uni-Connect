import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import SocietyRequestSubmit from "../pages/SocietyRequestSubmit";
import SocietyRequestsAdmin from "../pages/SocietyRequestsAdmin";
import SocietyRequestDetail from "../pages/SocietyRequestDetail";
import SocietyRegisterByToken from "../pages/SocietyRegisterByToken";
import CreateEvent from "../pages/CreateEvent";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<SocietyRequestSubmit />} />
        <Route path="/society-admin/requests" element={<SocietyRequestsAdmin />} />
        <Route path="/society-admin" element={<Navigate to="/society-admin/requests" replace />} />
        <Route path="/society-admin/requests/:id" element={<SocietyRequestDetail />} />
        <Route path="/society-register/:token" element={<SocietyRegisterByToken />} />
        <Route path="/create-event/:token" element={<CreateEvent />} />
      </Routes>

    </BrowserRouter>
  );
}
