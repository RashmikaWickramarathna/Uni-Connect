import './StatsSection.css';

const StatsSection = () => {
  const stats = [
    {
      number: '50+',
      label: 'Active Societies',
      description: 'Student-run organizations across campus',
    },
    {
      number: '200+',
      label: 'Events Hosted',
      description: 'Successful events organized this year',
    },
    {
      number: '5,000+',
      label: 'Students Connected',
      description: 'Active members in our community',
    },
    {
      number: '98%',
      label: 'Satisfaction Rate',
      description: 'Happy students and organizers',
    },
  ];

  return (
    <section id="stats" className="stats-section">
      <div className="stats-background">
        <div className="stats-shape shape-1"></div>
        <div className="stats-shape shape-2"></div>
      </div>
      
      <div className="stats-container">
        <div className="stats-header">
          <span className="section-badge light">Our Impact</span>
          <h2 className="section-title light">
            Making a Difference on
            <span className="highlight"> Campus</span>
          </h2>
          <p className="section-description light">
            See how Uni-Connect is transforming the way students engage with campus life.
          </p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <span className="stat-card-number">{stat.number}</span>
              <h3 className="stat-card-label">{stat.label}</h3>
              <p className="stat-card-description">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
