import './FeaturesSection.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: '📝',
      title: 'Easy Registration',
      description: 'Register your student society with our streamlined digital process. No more paperwork, just fill out the form and submit.',
    },
    {
      icon: '✅',
      title: 'Quick Approvals',
      description: 'Get your society approved faster with our automated review system. Track your application status in real-time.',
    },
    {
      icon: '📅',
      title: 'Event Management',
      description: 'Plan, organize, and promote your events all in one place. Manage registrations and send updates to members.',
    },
    {
      icon: '👥',
      title: 'Member Management',
      description: 'Keep track of your society members, manage roles, and communicate with your team efficiently.',
    },
    {
      icon: '📢',
      title: 'Announcements',
      description: 'Broadcast important updates and news to your members. Keep everyone informed and engaged.',
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Get insights into your society\'s performance. Track event attendance, member growth, and engagement metrics.',
    },
  ];

  return (
    <section id="features" className="features-section">
      <div className="features-container">
        <div className="features-header">
          <span className="section-badge">Features</span>
          <h2 className="section-title">
            Everything You Need to
            <span className="highlight"> Manage Societies</span>
          </h2>
          <p className="section-description">
            Uni-Connect provides all the tools you need to create, manage, and grow your student societies on campus.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
