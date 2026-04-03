import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'Home', path: '/' },
      { label: 'Register Society', path: '/submit' },
      { label: 'Admin Dashboard', path: '/admin' },
    ],
    resources: [
      { label: 'How It Works', path: '/#features' },
      { label: 'Guidelines', path: '/' },
      { label: 'FAQ', path: '/' },
    ],
    support: [
      { label: 'Contact Us', path: '/' },
      { label: 'Help Center', path: '/' },
      { label: 'Report Issue', path: '/' },
    ],
  };

  const socialLinks = [
    { icon: '𝕏', label: 'Twitter', href: '#' },
    { icon: 'in', label: 'LinkedIn', href: '#' },
    { icon: '📷', label: 'Instagram', href: '#' },
    { icon: '📘', label: 'Facebook', href: '#' },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
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
            <p className="footer-description">
              Empowering students to connect, create, and celebrate campus life through 
              seamless society management and event organization.
            </p>
            <div className="footer-social">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  className="social-link"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h4 className="footer-links-title">Platform</h4>
              <ul>
                {footerLinks.platform.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-column">
              <h4 className="footer-links-title">Resources</h4>
              <ul>
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-column">
              <h4 className="footer-links-title">Support</h4>
              <ul>
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            {currentYear} Uni-Connect. All rights reserved.
          </p>
          <div className="footer-legal">
            <Link to="/">Privacy Policy</Link>
            <span className="divider">|</span>
            <Link to="/">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
