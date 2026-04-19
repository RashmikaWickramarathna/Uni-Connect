import {
  FiBell,
  FiCalendar,
  FiClipboard,
  FiCreditCard,
  FiFileText,
  FiHelpCircle,
  FiHome,
  FiLogOut,
  FiMessageSquare,
  FiMonitor,
  FiMoon,
  FiSettings,
  FiSun,
  FiUsers,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "../styles/admin.css";

const menuItems = [
  { label: "Dashboard", icon: FiHome, path: "/admin" },
  { label: "User Accounts", icon: FiUsers, path: "/admin-login/login" },
  { label: "Society Approvals", icon: FiClipboard, path: "/society-admin/requests" },
  { label: "Events", icon: FiCalendar, path: "/admin/events" },
  { label: "Ticket Reservations", icon: FiFileText, path: "/admin/bookings" },
  { label: "Payments", icon: FiCreditCard, path: "/admin/payments" },
  { label: "Feedback", icon: FiMessageSquare, path: "/admin/feedbacks" },
  { label: "Inquiries", icon: FiHelpCircle, path: "/admin/inquiries" },
  { label: "Common Settings", icon: FiSettings, path: "/admin/settings" },
];

function isActiveRoute(itemPath, pathname) {
  if (!itemPath) return false;
  if (itemPath === "/admin") return pathname === itemPath;
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

function SidebarItem({ item, pathname }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={`menu-item${isActiveRoute(item.path, pathname) ? " active" : ""}`}
    >
      <span className="mi-icon" aria-hidden>
        <Icon />
      </span>
      <span className="mi-label">{item.label}</span>
    </Link>
  );
}

export default function AdminLayout({
  children,
  title = "Uni-Connect - Admin Panel",
  subtitle = "Society and Club Management System",
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const content =
    typeof children === "function" ? children({ pathname: location.pathname }) : children;
  const displayName = user?.name || "Admin";
  const displayEmail = user?.email || "admin@uni-connect.edu";
  const avatarLetter = displayName.charAt(0).toUpperCase() || "A";
  const ThemeIcon = theme === "system" ? FiMonitor : resolvedTheme === "dark" ? FiSun : FiMoon;
  const themeLabel =
    theme === "system" ? "System theme" : resolvedTheme === "dark" ? "Light mode" : "Dark mode";

  const handleLogout = () => {
    logout();
    navigate("/admin-login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <div className="brand-mark">UC</div>
          <div className="brand-copy">
            <div className="brand-title">Uni-Connect</div>
            <div className="brand-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="menu" aria-label="Admin navigation">
          {menuItems.map((item) => (
            <SidebarItem key={item.label} item={item} pathname={location.pathname} />
          ))}
        </nav>

        <button className="menu-item menu-item-logout" onClick={handleLogout} type="button">
          <span className="mi-icon" aria-hidden>
            <FiLogOut />
          </span>
          <span className="mi-label">Logout</span>
        </button>

        <div className="sidebar-footer">v1.0 • Uni-Connect • {resolvedTheme}</div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1 className="system-title">{title}</h1>
            <div className="system-sub">{subtitle}</div>
          </div>

          <div className="topbar-right">
            <button
              className="icon-btn icon-btn-theme"
              type="button"
              onClick={toggleTheme}
              aria-label={themeLabel}
              title={themeLabel}
            >
              <ThemeIcon />
            </button>

            <button className="icon-btn" type="button" aria-label="Notifications">
              <FiBell />
            </button>

            <div className="profile">
              <div className="avatar">{avatarLetter}</div>
              <div className="profile-info">
                <div className="name">{displayName}</div>
                <div className="email">{displayEmail}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">{content}</main>
      </div>
    </div>
  );
}
