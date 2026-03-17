import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import Services from '../components/Services';
import OurStore from '../components/OurStore';
import CTA from '../components/CTA';

const Home = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.scrollTo) {
            setTimeout(() => {
                document.getElementById(location.state.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [location.state]);

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
