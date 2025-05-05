import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/layout/ScrollToTop';
import Banner from '../components/home/Banner';
import Categories from '../components/home/Categories';
import FeaturedProducts from '../components/home/FeaturedProducts';
import Occasions from '../components/home/Occasions';
import Testimonials from '../components/home/Testimonials';
import Features from '../components/home/Features';
import Newsletter from '../components/home/NewsLetters';

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Banner />
        <Categories />
        <FeaturedProducts />
        <Occasions />
        <Testimonials />
        <Features />
        <Newsletter />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default HomePage;