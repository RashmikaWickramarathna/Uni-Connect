import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/#features', label: 'Features' },
    { path: '/#stats', label: 'Stats' },
    { path: '/submit', label: 'Register Society' },
  ];

  const isActive = (path) => {
    if (path.startsWith('/#')) {
      return location.hash === path.substring(1);
    }
    return location.pathname === path;
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
          <li>
            <Link to="/society-admin/requests" className="btn-admin">
              Admin
            </Link>
          </li>
          <li className="auth-buttons">
            <div className="auth-dropdown">
              <button className="btn-login" aria-haspopup="true" aria-expanded="false">Log In</button>
              <div className="dropdown-menu" role="menu">
                <button className="btn-auth-option btn-society-login" role="menuitem">Society Login</button>
                <button className="btn-auth-option btn-user-login" role="menuitem">User Login</button>
              </div>
            </div>
            <button className="btn-logout">Log Out</button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
