'use client';

import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../WeekendOffers/WeekendOffers.css";
import Image from "next/image"; 

interface WeekendOffer {
  _id: string;
  title: string;
  images: string[];
}

const WeekendOffers: React.FC = () => {
  const [offers, setOffers] = useState<WeekendOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/offers/weekend');
      const data = await res.json();

      if (data.success) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.error("Failed to fetch weekend offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Create a flat array of all images from all offers
  const allImages = offers.flatMap(offer => 
    offer.images.map((imageUrl, index) => ({
      id: `${offer._id}-${index}`,
      title: offer.title,
      imageUrl: imageUrl
    }))
  );

  const settings = {
    infinite: allImages.length > 1,
    speed: 800,
    autoplay: allImages.length > 1,
    autoplaySpeed: 3000,
    slidesToShow: Math.min(2, allImages.length),
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(2, allImages.length) } },
      { breakpoint: 768,  settings: { slidesToShow: 1 } },
    ],
  };

  if (loading) {
    return (
      <section className="weekend-offers-banner">
        <div className="container-fluid" id="week">
          <div className="offer-wrapper">
            <h2 className="offer-title">Weekend Offers</h2>
            <div className="h-80 flex items-center justify-center text-gray-500">
              Loading offers...
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (allImages.length === 0) {
    return null;
  }

  return (
    <section className="weekend-offers-banner">
      <div className="container-fluid" id="week">
        <div className="offer-wrapper">
          <h2 className="offer-title">Weekend Offers</h2>
          
          <Slider {...settings} className="slider-container">
            {allImages.map((image) => (
              <div className="slide img-influid" key={image.id}>
                <Image
                  src={image.imageUrl}
                  alt={image.title}
                  width={800}
                  height={400}
                  className="offer-image"
                  priority
                />
                
                {/* {image.title && (
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-1 rounded">
                    {image.title}
                  </div>
                )} */}
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default WeekendOffers;