import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/admin.css";

const MenuItem = ({ icon, label, active, onClick }) => (
  <button 
    className={`menu-item ${active ? "active" : ""}`} 
    onClick={onClick}
  >
    <span className="mi-icon" aria-hidden>{icon}</span>
    <span className="mi-label">{label}</span>
  </button>
);

export default function AdminLayout({ children, title = "Uni-Connect - Admin Panel", subtitle = "Society and Club Management System" }) {
  const [active, setActive] = useState("Society Approvals");

  const menu = [
    "Dashboard",
    "User Accounts",
    "Society Approvals",
    "Events",
    "Ticket Reservations",
    "Payments",
    "Feedback",
    "Reports",
    "Settings",
    "Logout",
  ];

  const icons = {
    Dashboard: "🏠",
    "User Accounts": "👥",
    "Society Approvals": "📨",
    Events: "📅",
    "Ticket Reservations": "🎟️",
    Payments: "💳",
    Feedback: "🗣️",
    Reports: "📊",
    Settings: "⚙️",
    Logout: "⤴️",
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <div className="brand-mark">UC</div>
          <div>
            <div className="brand-title">Uni-Connect</div>
            <div className="brand-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="menu">
          {menu.map((m) => (
            <MenuItem
              key={m}
              icon={icons[m]}
              label={m}
              active={active === m}
              onClick={() => setActive(m)}
            />
          ))}
        </nav>

        <div className="sidebar-footer">v1.0 • Uni-Connect</div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <h2 className="system-title">{title}</h2>
            <div className="system-sub">{subtitle}</div>
          </div>
          <div className="topbar-right">
            <button className="icon-btn">🔔</button>
            <div className="profile">
              <div className="avatar">A</div>
              <div className="profile-info">
                <div className="name">Admin</div>
                <div className="email">admin@uni-connect.edu</div>
              </div>
            </div>
          </div>
        </header>

        <section className="admin-content">
          {children({ selectedModule: active })}
        </section>
      </div>
    </div>
  );
}
