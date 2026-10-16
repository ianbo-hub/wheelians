import { useEffect } from 'react';
import ContactStrip from '../components/layout/ContactStrip';
import Nav from '../components/layout/Nav';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import NewArrivals from '../components/sections/NewArrivals';
import Inventory from '../components/sections/Inventory';
import About from '../components/sections/About';
import Locations from '../components/sections/Locations';
import FinanceCalc from '../components/sections/FinanceCalc';
import FAQ from '../components/sections/FAQ';
import SellCar from '../components/sections/SellCar';
import Contact from '../components/sections/Contact';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Home() {
  useScrollReveal();

  // Re-run reveal on route mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const obs = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        }),
        { threshold: 0.15 }
      );
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <ContactStrip />
      <Nav />
      <Hero />
      <NewArrivals />
      <Inventory />
      <About />
      <Locations />
      <FinanceCalc />
      <FAQ />
      <SellCar />
      <Contact />
      <Footer />
    </>
  );
}
