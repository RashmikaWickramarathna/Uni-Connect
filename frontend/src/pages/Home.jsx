import { Link } from 'react-router-dom';
import { FiArrowRight, FiHelpCircle, FiMessageSquare, FiUser } from 'react-icons/fi';

import Navbar from '../components/Navbar/Navbar';
import HeroSection from '../components/HeroSection/HeroSection';
import FeaturesSection from '../components/FeaturesSection/FeaturesSection';
import StatsSection from '../components/StatsSection/StatsSection';
import CTASection from '../components/CTASection/CTASection';
import Footer from '../components/Footer/Footer';
import './Home.css';

const quickActions = [
  {
    title: 'My Feedbacks',
    description: 'Review your submissions, share new ideas, and keep track of responses.',
    icon: FiMessageSquare,
    route: '/my-feedbacks',
  },
  {
    title: 'My Inquiries',
    description: 'Ask questions, follow updates, and stay connected with support.',
    icon: FiHelpCircle,
    route: '/my-inquiries',
  },
  {
    title: 'My Profile',
    description: 'Manage your personal details and keep your account information current.',
    icon: FiUser,
    route: '/profile',
  },
];

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <section className="quick-actions-section">
          <div className="quick-actions-container">
            <div className="quick-actions-header">
              <span className="section-badge">Quick Actions</span>
              <h2 className="section-title">
                Student tools that fit right into
                <span className="highlight"> UniConnect</span>
              </h2>
              <p className="section-description">
                Jump straight into your personal dashboard features without leaving the current landing page
                experience.
              </p>
            </div>

            <div className="quick-actions-grid">
              {quickActions.map(({ title, description, icon: Icon, route }) => (
                <Link key={title} to={route} className="quick-action-card">
                  <div className="quick-action-icon">
                    <Icon />
                  </div>
                  <h3 className="quick-action-title">{title}</h3>
                  <p className="quick-action-description">{description}</p>
                  <div className="quick-action-footer">
                    <span className="quick-action-dot"></span>
                    <span className="quick-action-link">
                      Open
                      <FiArrowRight />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
