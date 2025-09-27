"use client";

import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../WeekendOffers/WeekendOffers.css";
import bigSale from "../../../../assets/images/bigsal.png";
import megaOffer from "../../../../assets/images/offer.png";
import Image, { StaticImageData } from "next/image";

// ✅ Define Offer type
interface Offer {
  id: number;
  image: StaticImageData;
  title: string;
}

const WeekendOffers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);

  const fetchOffers = async (): Promise<void> => {
    await new Promise((res) => setTimeout(res, 500));

    const data: Offer[] = [
      { id: 1, image: bigSale, title: "Big Sale" },
      { id: 2, image: megaOffer, title: "Mega Offer" },
      { id: 3, image: bigSale, title: "Big Sale Again" },
      { id: 4, image: megaOffer, title: "Mega Deal" },
      { id: 5, image: bigSale, title: "Final Sale" },
      { id: 6, image: megaOffer, title: "Last Minute Offer" },
    ];

    setOffers(data);
  };

  // Example if you fetch from API instead:
  // const fetchOffers = async (): Promise<void> => {
  //   const response = await fetch("https://your-backend.com/api/weekend-offers");
  //   const data: Offer[] = await response.json();
  //   setOffers(data);
  // };

  useEffect(() => {
    fetchOffers();
  }, []);

  const settings: Slider["props"] = {
    infinite: true,
    speed: 800,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="weekend-offers-banner">
      <div className="container-fluid" id="week">
        <div className="offer-wrapper">
          <h2 className="offer-title">Weekend Offers</h2>
          <Slider {...settings} className="slider-container">
            {offers.map((offer) => (
              <div className="slide img-influid" key={offer.id}>
                <Image
                  src={offer.image}
                  alt={offer.title}
                  className="offer-image"
                  priority
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};  

export default WeekendOffers;
