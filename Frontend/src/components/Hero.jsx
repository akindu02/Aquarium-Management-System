import React from 'react';
import '../index.css';

import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <h1 className="hero-title">
          Bring the <span className="text-gradient">Ocean</span> Home
        </h1>
        <p className="hero-subtitle">
          Experience the tranquility of marine life with Methu Aquarium's premium installation and maintenance services. We build liquid art.
        </p>
        <div className="hero-buttons">
          <Link to="/services" className="btn btn-primary">Book a Service</Link>
          <Link to="/store" className="btn btn-outline">Shop Products</Link>
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: var(--header-height);
          background-image: url('/images/home main.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .text-gradient {
          background: linear-gradient(to right, var(--color-primary), var(--color-accent));
          -webkit-background-clip: text;
          color: transparent;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-muted);
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-buttons {
            flex-direction: column;
            gap: 1rem;
            padding: 0 2rem;
          }
          
          .hero-buttons .btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
