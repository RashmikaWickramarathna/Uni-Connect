import { useEffect, useRef, useState } from 'react';
import { FiMonitor, FiMoon, FiSun } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { normalizeAuthRole, useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const authMenuRef = useRef(null);
  const userRole = normalizeAuthRole(user?.role);
  const isLoggedIn = Boolean(user);
  const dashboardPath = userRole === 'admin' ? '/admin' : '/';
  const userLabel = user?.name || user?.email?.split('@')[0] || (userRole === 'admin' ? 'Admin' : 'Student');
  const studentAreaPrefixes = [
    '/',
    '/home',
    '/events',
    '/my-feedbacks',
    '/my-inquiries',
    '/profile',
    '/my-tickets',
    '/payment-history',
  ];
  const isStudentArea =
    userRole === 'student' &&
    studentAreaPrefixes.some((path) =>
      path === '/' ? ['/', '/home'].includes(location.pathname) : location.pathname.startsWith(path)
    );
  const ThemeIcon = theme === 'system' ? FiMonitor : resolvedTheme === 'dark' ? FiSun : FiMoon;
  const themeButtonText =
    theme === 'system' ? 'System' : resolvedTheme === 'dark' ? 'Light' : 'Dark';
  const themeButtonLabel =
    theme === 'system'
      ? 'Theme is following your system preference'
      : resolvedTheme === 'dark'
        ? 'Switch to light mode'
        : 'Switch to dark mode';

  const closeMenus = () => {
    setIsAuthMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authMenuRef.current && !authMenuRef.current.contains(event.target)) {
        setIsAuthMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      closeMenus();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.hash]);

  const publicNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/submit', label: 'Register Society' },
  ];

  const studentNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/my-feedbacks', label: 'My Feedbacks' },
    { path: '/my-inquiries', label: 'My Inquiries' },
    { path: '/profile', label: 'My Profile' },
  ];

  const navLinks = isStudentArea ? studentNavLinks : publicNavLinks;

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleUserLogin = () => {
    closeMenus();
    navigate('/login');
  };

  const handleSocietyLogin = () => {
    closeMenus();
    navigate('/social-login');
  };

  const handleAdminLogin = () => {
    closeMenus();
    navigate('/admin-login');
  };

  const handleDashboard = () => {
    closeMenus();
    navigate(dashboardPath);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate('/');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 100 100" className="logo-svg">
              <rect x="10" y="10" width="35" height="35" rx="8" fill="none" stroke="currentColor" strokeWidth="3"/>
              <rect x="55" y="10" width="35" height="35" rx="8" fill="currentColor"/>
              <rect x="10" y="55" width="35" height="35" rx="8" fill="currentColor"/>
              <rect x="55" y="55" width="35" height="35" rx="8" fill="none" stroke="currentColor" strokeWidth="3"/>
              <text x="20" y="32" fontSize="14" fill="currentColor">♪</text>
              <text x="65" y="32" fontSize="14" fill="white">🎓</text>
              <text x="22" y="78" fontSize="14" fill="white">🎮</text>
              <text x="67" y="78" fontSize="14" fill="currentColor">🏆</text>
            </svg>
          </div>
          <span className="logo-text">
            <span className="logo-text-uni">Uni</span>
            <span className="logo-text-connect">Connect</span>
          </span>
        </Link>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        <ul className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link 
                to={link.path}
                className={isActive(link.path) ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {!isStudentArea && (
            <li>
              <Link to="/society-admin/requests" className="btn-admin" onClick={closeMenus}>
                Admin
              </Link>
            </li>
          )}
          <li className="auth-buttons">
            <button
              className="btn-theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={themeButtonLabel}
              title={themeButtonLabel}
            >
              <ThemeIcon />
              <span>{themeButtonText}</span>
            </button>
            {isLoggedIn ? (
              <>
                <span className="auth-user-pill">
                  {userRole === 'admin' ? 'Admin' : 'User'}: {userLabel}
                </span>
                <button className="btn-login btn-dashboard" onClick={handleDashboard}>
                  {userRole === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                </button>
                <button className="btn-logout" onClick={handleLogout}>
                  Log Out
                </button>
              </>
            ) : (
              <div className="auth-dropdown" ref={authMenuRef}>
                <button
                  className="btn-login"
                  aria-haspopup="true"
                  aria-expanded={isAuthMenuOpen}
                  onClick={() => setIsAuthMenuOpen((current) => !current)}
                >
                  Log In
                </button>
                <div className={`dropdown-menu ${isAuthMenuOpen ? 'open' : ''}`} role="menu">
                  <button
                    className="btn-auth-option btn-admin-login"
                    role="menuitem"
                    onClick={handleAdminLogin}
                  >
                    Admin Login
                  </button>
                  <button
                    className="btn-auth-option btn-society-login"
                    role="menuitem"
                    onClick={handleSocietyLogin}
                  >
                    Society Login
                  </button>
                  <button
                    className="btn-auth-option btn-user-login"
                    role="menuitem"
                    onClick={handleUserLogin}
                  >
                    User Login
                  </button>
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
