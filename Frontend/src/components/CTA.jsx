import React from 'react';
import '../index.css';

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="container cta-container icon-bg">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Space?</h2>
          <p className="cta-desc">Join hundreds of satisfied clients who have brought the magic of the ocean into their homes.</p>
          <button className="btn btn-primary cta-btn">Book Your Service</button>
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
