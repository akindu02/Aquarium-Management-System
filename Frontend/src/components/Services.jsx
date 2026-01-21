import React from 'react';
import '../index.css';

const servicesData = [
  {
    id: 1,
    title: 'Custom Installation',
    description: 'Bespoke aquarium designs tailored to your space, from residential living rooms to corporate lobbies.',

  },
  {
    id: 2,
    title: 'Maintenance',
    description: 'Regular cleaning, water testing, and partial water changes to keep your ecosystem thriving.',

  },
  {
    id: 3,
    title: 'Health Checks',
    description: 'Expert diagnosis and treatment plans for fish and coral health by certified marine biologists.',

  },
  {
    id: 4,
    title: 'Aquascaping',
    description: 'Artistic underwater landscaping using premium rocks, wood, and live plants.',

  }
];

const Services = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <h2 className="section-title">Our Services</h2>
        <p className="section-subtitle">Comprehensive care for your aquatic world, handled by experts.</p>

        <div className="services-grid">
          {servicesData.map((service) => (
            <div key={service.id} className="service-card glass">
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.description}</p>
              <a href="#" className="service-link">Learn More &rarr;</a>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .section-padding {
          padding: 6rem 0;
          background-color: var(--color-bg);
          position: relative;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .service-card {
          padding: 2rem;
          border-radius: 20px;
          transition: transform 0.3s ease, background 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          cursor: pointer;
        }

        .service-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }


        .service-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 1rem;
        }

        .service-desc {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          line-height: 1.6;
          flex-grow: 1;
        }

        .service-link {
          color: var(--color-primary);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .service-link:hover {
          color: var(--color-accent);
          text-decoration: underline;
        }
      `}</style>
    </section>
  );
};

export default Services;
