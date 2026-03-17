import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../index.css';
import { getContactSettingsAPI } from '../utils/api';

const DEFAULT_CONTACT = {
  address: 'No 50, Kumaradasa Mawatha, Matara',
  phone:   '041-2236848 / 074-3143109',
  email:   'methuaquarium@gmail.com',
};

const Footer = () => {
  const [contact, setContact] = useState(DEFAULT_CONTACT);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionNav = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  useEffect(() => {
    getContactSettingsAPI()
      .then(res => {
        if (res.success && res.data) {
          setContact({
            address: res.data.contact_address || DEFAULT_CONTACT.address,
            phone:   res.data.contact_phone   || DEFAULT_CONTACT.phone,
            email:   res.data.contact_email   || DEFAULT_CONTACT.email,
          });
        }
      })
      .catch(() => { /* keep defaults */ });
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="logo">
              Methu<span className="text-primary">Aquarium</span>
            </a>
            <p className="footer-text">
              Transforming spaces with living aquatic art. Dedicated to sustainability, beauty, and marine health.
            </p>
          </div>

          <div className="footer-links">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="link-list">
              <li><Link to="/">Home</Link></li>
              <li><a href="#about" onClick={(e) => handleSectionNav(e, 'about')}>About Us</a></li>
              <li><Link to="/store">Store</Link></li>
              <li><a href="#contact" onClick={(e) => handleSectionNav(e, 'contact')}>Contact</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4 className="footer-title">Services</h4>
            <ul className="link-list">
              <li><a href="#">Installation</a></li>
              <li><a href="#">Maintenance</a></li>
              <li><a href="#">Health Checks</a></li>
              <li><a href="#">Consultation</a></li>
            </ul>
          </div>

          <div className="footer-social">
            <h4 className="footer-title">Contact Us</h4>
            <p className="footer-text">{contact.address}</p>
            <p className="footer-text">{contact.phone}</p>
            <p className="footer-text">{contact.email}</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Methu Aquarium Management System. All rights reserved.</p>
        </div>
      </div>

      <style>{`
        .footer {
          background-color: #050a14;
          padding: 5rem 0 2rem;
          border-top: 1px solid var(--glass-border);
          color: var(--text-muted);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 4rem;
        }

        .footer-brand .logo {
          margin-bottom: 1.5rem;
          display: inline-block;
        }

        .footer-text {
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .footer-title {
          color: var(--text-main);
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }

        .link-list li {
          margin-bottom: 0.75rem;
        }

        .link-list a:hover {
          color: var(--color-primary);
        }


        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid var(--glass-border);
          font-size: 0.9rem;
        }

        @media (max-width: 968px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
