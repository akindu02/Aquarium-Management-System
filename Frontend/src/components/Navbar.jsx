import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="logo">
          Methu<span className="text-primary">Aquarium</span>
        </Link>

        <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <a href="#" className="nav-link">Store</a>
          <a href="#" className="nav-link">Services</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#about" className="nav-link">Contact</a>
          <div className="mobile-auth">
            <Link to="/signin" style={{ width: '100%', marginBottom: '10px' }}>
              <button className="btn btn-outline" style={{ width: '100%' }}>Sign In</button>
            </Link>
            <Link to="/signup" style={{ width: '100%' }}>
              <button className="btn btn-primary" style={{ width: '100%' }}>Sign Up</button>
            </Link>
          </div>
        </div>

        <div className="nav-auth">
          <Link to="/signin">
            <button className="btn btn-outline" style={{ padding: '0.5rem 1.25rem', marginRight: '1rem' }}>Sign In</button>
          </Link>
          <Link to="/signup">
            <button className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Sign Up</button>
          </Link>
        </div>

        <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          transition: all 0.3s ease;
          padding: 1.5rem 0;
        }

        .navbar.scrolled {
          background: rgba(11, 17, 32, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--glass-border);
          padding: 1rem 0;
          box-shadow: var(--glass-shadow);
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-main);
          z-index: 1001;
        }

        .text-primary {
          color: var(--color-primary);
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          font-weight: 500;
          color: var(--text-muted);
          position: relative;
        }

        .nav-link:hover {
          color: var(--text-main);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 0;
          background-color: var(--color-primary);
          transition: width 0.3s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-auth {
          display: flex;
          align-items: center;
        }

        .mobile-auth {
          display: none;
        }

        .hamburger {
          display: none;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
          z-index: 1001;
        }

        .bar {
          width: 25px;
          height: 2px;
          background-color: var(--text-main);
          transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
          .nav-links {
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            width: 70%;
            background: rgba(11, 17, 32, 0.95);
            backdrop-filter: blur(15px);
            flex-direction: column;
            padding-top: 6rem;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: -5px 0 15px rgba(0,0,0,0.5);
          }

          .nav-links.active {
            transform: translateX(0);
          }

          .nav-auth {
            display: none;
          }

          .mobile-auth {
            display: block;
            margin-top: 2rem;
            width: 80%;
          }

          .hamburger {
            display: flex;
          }

          .bar.open:nth-child(1) {
            transform: rotate(45deg) translate(5px, 6px);
          }
          .bar.open:nth-child(2) {
            opacity: 0;
          }
          .bar.open:nth-child(3) {
            transform: rotate(-45deg) translate(5px, -6px);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
