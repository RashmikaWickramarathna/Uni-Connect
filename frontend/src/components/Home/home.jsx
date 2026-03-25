import { useNavigate } from 'react-router-dom';
import './home.css';

const placeholderTrending = [
  { id: 1, title: 'Robotics Club', desc: 'Innovation, workshops and competitions' },
  { id: 2, title: 'Debating Society', desc: 'Sharpen your public speaking skills' },
  { id: 3, title: 'Music Circle', desc: 'Jams, gigs and musical collaborations' }
];

const Home = () => {
  const navigate = useNavigate();
  const handleApplyClick = () => navigate('/submit');

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-inner">
          <h1>Connect. Create. Celebrate.</h1>
          <p>Join student societies, host events, and grow your campus community.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleApplyClick}>Apply for Society Registration</button>
          </div>
        </div>
      </section>

      <section className="trending">
        <h2>Trending Societies</h2>
        <div className="trending-grid">
          {placeholderTrending.map((t) => (
            <div className="trend-card" key={t.id}>
              <div className="trend-avatar">{t.title.charAt(0)}</div>
              <div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works">
        <h2>How it works</h2>
        <div className="hiw-grid">
          <div className="hiw-item">Submit request → Approval → Launch society</div>
          <div className="hiw-item">Organise events → Invite members</div>
          <div className="hiw-item">Get support from campus administration</div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <h2>About This System</h2>
        <p>
          This system serves as an official digital platform managing student society registrations efficiently and securely. It allows users to submit
          their society details through an online form, eliminating the need for manual paperwork and making the process faster and more convenient.

          The platform follows a structured approval mechanism where each submission is reviewed by administrators before granting access to full registration.once 
          approved, a unique approval link is generated and sent to the applicant, ensuaring that only authorized socities can proceed futher. This enhances the 
          reliability and integrity of the entire registration process while providing a smooth and user-friendly experience.
          
        </p>
      </section>

      {/* Steps Section */}
      <section className="steps" id="steps">
        <h2>How It Works</h2>
        <div className="step-boxes">
          <div className="step-card">
            <h3>1</h3>
            <p>Submit the society request form</p>
          </div>
          <div className="step-card">
            <h3>2</h3>
            <p>Wait for admin review and approval</p>
          </div>
          <div className="step-card">
            <h3>3</h3>
            <p>Receive the approval link</p>
          </div>
          <div className="step-card">
            <h3>4</h3>
            <p>Complete the society registration</p>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default Home;
