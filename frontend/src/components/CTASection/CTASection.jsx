import { useNavigate } from 'react-router-dom';
import './CTASection.css';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      <div className="cta-background">
        <div className="cta-shape shape-1"></div>
        <div className="cta-shape shape-2"></div>
        <div className="cta-shape shape-3"></div>
      </div>
      
      <div className="cta-container">
        <div className="cta-content">
          <h2 className="cta-title">
            Ready to Start Your
            <span className="highlight"> Society Journey?</span>
          </h2>
          <p className="cta-description">
            Join hundreds of student societies already using Uni-Connect to manage their events, 
            engage members, and create unforgettable campus experiences.
          </p>
          
          <div className="cta-buttons">
            <button 
              className="btn-cta-primary"
              onClick={() => navigate('/submit')}
            >
              Register Your Society
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
            
          </div>
        </div>
        
        <div className="cta-visual">
          <div className="cta-circle">
            <span className="cta-emoji">🚀</span>
          </div>
          <div className="cta-decoration decoration-1">✨</div>
          <div className="cta-decoration decoration-2">🎯</div>
          <div className="cta-decoration decoration-3">💡</div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
