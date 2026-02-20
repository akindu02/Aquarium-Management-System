import React from 'react';
import { Link } from 'react-router-dom';
import './OurStore.css';

const storeData = [
  {
    id: 1,
    title: 'Premium Aquariums',
    description: 'High-quality glass tanks.',
    image: '/images/tank1.jpg'
  },
  {
    id: 2,
    title: 'Filtration Systems',
    description: 'Advanced filtration tech.',
    image: '/images/filter.jpg'
  },
  {
    id: 3,
    title: 'Aquatic Plants',
    description: 'Live plants for aquascapes.',
    image: '/images/plant.jpg'
  },
  {
    id: 4,
    title: 'LED Lighting',
    description: 'Energy-efficient LED lights.',
    image: '/images/led.jpg'
  }
];

const OurStore = () => {
  return (
    <section className="store-section">
      <div className="container">
        <div className="store-header">
          <h2 className="section-title">Our Store</h2>
          <p className="section-subtitle">Browse our premium selection of aquarium products.</p>
        </div>

        <div className="store-grid">
          {storeData.map((product) => (
            <div key={product.id} className="store-card glass">
              <div className="store-image-container">
                <img src={product.image} alt={product.title} className="store-image" />
              </div>
              <div className="store-content">
                <h3 className="card-title">{product.title}</h3>
                <p className="card-description">{product.description}</p>
                <Link to="/store" className="store-btn">
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurStore;
