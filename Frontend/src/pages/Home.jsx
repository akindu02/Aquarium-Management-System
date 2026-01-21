import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import OurStore from '../components/OurStore';
import CTA from '../components/CTA';

const Home = () => {
    return (
        <>
            <Hero />
            <Services />
            <OurStore />
            <CTA />
        </>
    );
};

export default Home;
