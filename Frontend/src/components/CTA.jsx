import React from 'react';
import '../index.css';
import { MapPin, Phone, Mail } from 'lucide-react';


const CTA = () => {
  return (
    <section id="about" className="cta-section">
      <div className="container">
        <div className="cta-grid">
          <div className="cta-card icon-bg">
            <div className="cta-content">
              <h2 className="cta-title">About Us</h2>
              <p className="cta-desc">
                Methu Aquarium is your premier destination for all things aquatic. With years of experience in the industry,
                we are passionate about bringing the beauty of underwater life into your home or business. Our team of experts
                provides top-quality fish, aquarium supplies, and professional services to help you create and maintain the
                perfect aquatic environment.
              </p>
            </div>
          </div>

          <div className="cta-card icon-bg">
            <div className="cta-content">
              <h2 className="cta-title">Contact Us</h2>
              <p className="cta-desc">
                For any inquiries or questions, please don't hesitate to contact us. We are here to assist you with any questions you may have.
              </p>
              <div className="contact-info">
                <div className="contact-row">
                  <MapPin className="contact-icon" size={20} />
                  <p>No 50, Kumaradasa Mawatha, Matara</p>
                </div>
                <div className="contact-row">
                  <Phone className="contact-icon" size={20} />
                  <p>041-2236848 / 074-3133109</p>
                </div>
                <div className="contact-row">
                  <Mail className="contact-icon" size={20} />
                  <p>methuaquarium@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cta-section {
          padding: 6rem 0;
          background-color: var(--color-bg); 
        }

        .cta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
        }

        .cta-card {
          padding: 3rem 2.5rem;
          border-radius: 24px;
          text-align: center;
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .cta-content {
          position: relative;
          z-index: 2;
        }

        .cta-title {
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1.5rem;
        }

        .cta-desc {
          font-size: 1.05rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
          line-height: 1.7;
        }
        
        .contact-info {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            align-items: center; /* Align items to the center */
        }

        .contact-row {
            display: flex;
            align-items: center;
            gap: 1rem;
            color: var(--text-main);
            text-align: left;
        }
        
        .contact-icon {
            color: var(--color-primary);
            flex-shrink: 0;
        }
        
        .contact-row p {
            margin: 0;
            font-weight: 500;
        }

        @media (max-width: 968px) {
          .cta-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>
    </section>
  );
};

export default CTA;
