import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const storeData = [
  {
    id: 1,
    title: 'Premium Aquariums',
    description: 'High-quality glass aquariums in various sizes, perfect for any space.',
    image: '/images/tank1.jpg'
  },
  {
    id: 2,
    title: 'Filtration Systems',
    description: 'Advanced filtration equipment to keep your water crystal clear.',
    image: '/images/filter.jpg'
  },
  {
    id: 3,
    title: 'Aquatic Plants',
    description: 'Live plants to create natural, beautiful aquascapes.',
    image: '/images/plant.jpg'
  },
  {
    id: 4,
    title: 'LED Lighting',
    description: 'Energy-efficient LED lights to showcase your aquarium beautifully.',
    image: '/images/led.jpg'
  }
];

const OurStore = () => {


  return (
    <section className="section-padding">
      <div className="container">
        <h2 className="section-title">Our Store</h2>
        <p className="section-subtitle">Browse our premium selection of aquarium products and accessories.</p>

        <div className="store-grid">
          {storeData.map((product) => (
            <div key={product.id} className="store-card glass">
              <img src={product.image} alt={product.title} className="store-image" />
              <h3 className="store-title">{product.title}</h3>
              <p className="store-desc">{product.description}</p>
              <Link to="/store" className="btn btn-primary store-btn">
                Shop Now
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .section-padding {
          padding: 6rem 0;
          background-color: var(--color-surface);
          position: relative;
        }

        .store-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .store-card {
          padding: 2rem;
          border-radius: 20px;
          transition: transform 0.3s ease, background 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          cursor: pointer;
        }

        .store-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .store-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .store-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 1rem;
        }

        .store-desc {
          color: var(--text-muted);
          margin-bottom: 1rem;
          line-height: 1.6;
          flex-grow: 1;
        }

        .store-btn {
          width: 100%;
          padding: 0.75rem 1.5rem;
        }
      `}</style>
    </section>
  );
};

export default OurStore;
