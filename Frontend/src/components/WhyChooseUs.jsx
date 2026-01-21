import React from 'react';
import '../index.css';

const features = [
  {
    title: 'Expert Marine Biologists',
    description: 'Our team consists of certified experts who understand the delicate balance of aquatic ecosystems.'
  },
  {
    title: '24/7 Emergency Support',
    description: 'We are always just a phone call away if your tank needs urgent attention.'
  },
  {
    title: 'Premium Equipment',
    description: 'We use only top-tier filtration and lighting systems to ensure longevity and clarity.'
  }
];

const WhyChooseUs = () => {
  return (
    <section className="section-padding bg-surface">
      <div className="container">
        <div className="why-grid">
          <div className="why-content">
            <h2 className="section-title text-left">Why Choose Methu Aquarium?</h2>
            <p className="section-subtitle text-left">We don't just sell aquariums we curate living art pieces that bring peace to your environment.</p>

            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="why-image glass">
            {/* Visual element or decorative image container */}
            <div className="visual-circle"></div>
            <div className="visual-content">
              <span>100% Satisfaction Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bg-surface {
          background-color: var(--color-surface);
        }

        .text-left {
          text-align: left;
          margin-left: 0;
        }

        .why-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 2rem;
        }

        .feature-item {
          display: block;
        }


        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }

        .feature-desc {
          color: var(--text-muted);
        }

        .why-image {
          height: 500px;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(45deg, var(--color-bg), var(--color-surface));
        }

        .visual-circle {
          position: absolute;
          width: 300px;
          height: 300px;
          background: var(--color-primary);
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
        }

        .visual-content {
          position: relative;
          z-index: 2;
          border: 1px solid var(--color-primary);
          padding: 2rem;
          border-radius: 50%;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-weight: 700;
          letter-spacing: 1px;
          color: var(--color-primary);
        }

        @media (max-width: 968px) {
          .why-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          
          .text-left {
            text-align: center;
            margin: 0 auto;
          }

          .feature-item {
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
};

export default WhyChooseUs;
