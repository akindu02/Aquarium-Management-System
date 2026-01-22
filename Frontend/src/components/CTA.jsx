import React from 'react';
import '../index.css';

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="container cta-container icon-bg">
        <div className="cta-content">
          <h2 className="cta-title">About Us</h2>
          <p className="cta-desc">
            Methu Aquarium is your premier destination for all things aquatic. With years of experience in the industry,
            we are passionate about bringing the beauty of underwater life into your home or business. Our team of experts
            provides top-quality fish, aquarium supplies, and professional services to help you create and maintain the
            perfect aquatic environment.
          </p>
          <button className="btn btn-primary cta-btn">Learn More</button>
        </div>
      </div>

      <style>{`
        .cta-section {
          padding: 6rem 2rem;
        }

        .cta-container {
          background: linear-gradient(135deg, var(--color-surface), var(--color-bg));
          border: 1px solid var(--glass-border);
          border-radius: 30px;
          padding: 4rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .cta-content {
          position: relative;
          z-index: 2;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1rem;
        }

        .cta-desc {
          font-size: 1.125rem;
          color: var(--text-muted);
          margin-bottom: 2.5rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-btn {
          font-size: 1.125rem;
          padding: 1rem 2.5rem;
        }

        /* Decorative Background Glow */
        .cta-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
      `}</style>
    </section>
  );
};

export default CTA;
