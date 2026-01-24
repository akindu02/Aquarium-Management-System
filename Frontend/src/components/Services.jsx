import React from 'react';
import { Wrench, Droplets, HeartPulse, Mountain, ArrowRight } from 'lucide-react';
import '../index.css';

const servicesData = [
  {
    id: 1,
    title: 'Custom Installation',
    description: 'Bespoke aquarium designs tailored to your space, from residential living rooms to corporate lobbies.',
    icon: Wrench,
  },
  {
    id: 2,
    title: 'Maintenance',
    description: 'Regular cleaning, water testing, and partial water changes to keep your ecosystem thriving.',
    icon: Droplets,
  },
  {
    id: 3,
    title: 'Health Checks',
    description: 'Expert diagnosis and treatment plans for fish and coral health by certified marine biologists.',
    icon: HeartPulse,
  },
  {
    id: 4,
    title: 'Aquascaping',
    description: 'Artistic underwater landscaping using premium rocks, wood, and live plants.',
    icon: Mountain,
  }
];

const Services = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <h2 className="section-title">Our Services</h2>
        <p className="section-subtitle">Comprehensive care for your aquatic world, handled by experts.</p>

        <div className="services-grid">
          {servicesData.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.id} className="service-card glass">
                <div className="icon-wrapper">
                  <Icon className="service-icon" strokeWidth={1.5} />
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.description}</p>
                <a href="#" className="service-link">
                  Learn More <ArrowRight className="link-arrow" size={16} />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .section-padding {
          padding: 8rem 0;
          background-color: var(--color-bg);
          position: relative;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2.5rem;
          margin-top: 4rem;
        }

        .service-card {
          padding: 2.5rem;
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          cursor: pointer;
          height: 100%;
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        /* Gradient hover effect background - subtle */
        .service-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), transparent 60%);
            opacity: 0;
            transition: opacity 0.4s ease;
            z-index: 0;
            pointer-events: none;
        }

        .service-card:hover {
          transform: translateY(-8px);
          border-color: rgba(6, 182, 212, 0.3);
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
        }
        
        .service-card:hover::before {
            opacity: 1;
        }
        
        .icon-wrapper {
            width: 60px;
            height: 60px;
            background: rgba(6, 182, 212, 0.1);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem; /* Gap spacing top of content */
            color: var(--color-primary);
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
        }
        
        .service-card:hover .icon-wrapper {
            background: var(--color-primary);
            color: #fff;
            transform: scale(1.1) rotate(-5deg);
        }

        .service-icon {
            width: 32px;
            height: 32px;
        }

        .service-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }

        .service-desc {
          color: var(--text-muted);
          margin-bottom: 2rem;
          line-height: 1.7;
          flex-grow: 1;
          font-size: 1rem;
          position: relative;
          z-index: 1;
        }

        .service-link {
          color: var(--color-primary);
          font-weight: 600;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          z-index: 1;
        }
        
        .link-arrow {
            transition: transform 0.3s ease;
        }

        .service-link:hover .link-arrow {
            transform: translateX(4px);
        }
        
        .service-link:hover {
          color: var(--color-accent);
        }
      `}</style>
    </section>
  );
};

export default Services;
