import React from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'
import Banner from './components/Home/Banner/Banner'
import Advantages from './components/Home/Advantages/Advantages'
import Category from './components/Home/Category/Category'
import Products from './components/Home/Products/Products'
import WeekendOffers from './components/Home/WeekendOffers/WeekendOffers'
import TopSelling from './components/Home/TopSelling/TopSelling'
import OrderBanner from './components/Home/OrderBanner/OrderBanner'
import TopVendors from './components/Home/TopVendors/TopVendors'
import SpecialOffer from './components/Home/SpecialOffer/SpecialOffer'
// import CustomerServices from './components/CustomerServices/CustomerServices'
import WeeklyTopVenders from './components/Home/WeeklyTopVenders/WeeklyTopVenders';
import CustomerServices from './components/Home/CustomerServices/CustomerServices';

const page = () => {
  return (
    <>
      <Header />
      <Banner/>
      <Advantages/>
      <Category/>
      <Products/>
      <WeekendOffers/>
      <TopSelling/>
      <OrderBanner/>
      <TopVendors/>
      <SpecialOffer/>
      <CustomerServices/>
      <WeeklyTopVenders/>
      <Footer />
    </>
  )
}

export default page