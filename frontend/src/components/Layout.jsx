import { Link } from "react-router-dom";

export default function Layout({ children, fullWidth = false }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <h1>UNI-CONNECT</h1>
          <nav>
            <Link to="/">Submit Request</Link>
            <Link to="/admin/requests">Admin</Link>
          </nav>
        </div>
      </header>

      <main className={fullWidth ? "container full-width" : "container"}>{children}</main>
    </div>
  );
}