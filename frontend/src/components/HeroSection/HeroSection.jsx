import { FiHelpCircle, FiMessageSquare, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();
  const studentToolButtons = [
    { label: 'Feedbacks', icon: FiMessageSquare, path: '/my-feedbacks' },
    { label: 'Inquiries', icon: FiHelpCircle, path: '/my-inquiries' },
    { label: 'Profile', icon: FiUser, path: '/profile' },
  ];

  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-shape shape-1"></div>
        <div className="hero-shape shape-2"></div>
        <div className="hero-shape shape-3"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-icon">🎓</span>
          <span>University Event and Club Management</span>
        </div>
        
        <h1 className="hero-title">
          Connect. Create.
          <span className="highlight"> Celebrate.</span>
        </h1>
        
        <p className="hero-description">
          Join student societies, host amazing events, and grow your campus community. 
          Uni-Connect makes it easy to discover, organize, and participate in university life.
        </p>
        
        <div className="hero-buttons">
          <button 
            className="btn-primary"
            onClick={() => navigate('/submit')}
          >
            Register Your Society
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          
          <button 
            className="btn-secondary"
            onClick={() => {
              const featuresSection = document.getElementById('features');
              if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Explore Features
          </button>
        </div>

        <div className="hero-tool-buttons" aria-label="Student quick links">
          {studentToolButtons.map(({ label, icon: Icon, path }) => (
            <button
              key={label}
              className="hero-tool-button"
              onClick={() => navigate(path)}
            >
              <Icon className="hero-tool-icon" />
              {label}
            </button>
          ))}
        </div>
        
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Active Societies</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">200+</span>
            <span className="stat-label">Events Hosted</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">5K+</span>
            <span className="stat-label">Students Connected</span>
          </div>
        </div>
      </div>
      
      <div className="hero-image">
        <div className="image-container">
          <div className="floating-card card-1">
            <span className="card-icon">🎵</span>
            <div>
              <p className="card-title">Music Club</p>
              <p className="card-subtitle">Live Concert Tonight</p>
            </div>
          </div>
          <div className="floating-card card-2">
            <span className="card-icon">🏆</span>
            <div>
              <p className="card-title">Debate Competition</p>
              <p className="card-subtitle">Registration Open</p>
            </div>
          </div>
          <div className="floating-card card-3">
            <span className="card-icon">🎮</span>
            <div>
              <p className="card-title">Gaming Tournament</p>
              <p className="card-subtitle">This Weekend</p>
            </div>
          </div>
          <div className="main-visual">
            <div className="visual-circle">
              <span className="visual-emoji">🎓</span>
            </div>
          </div>
          

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
