// components/Home/Banner/Banner.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import Link from "next/link";
import Image from "next/image";
import "../Banner/Banner.css";

interface BannerType {
  _id: string;
  title?: string;
  image: string;
  link?: string;
  order: number;
  isActive: boolean;
}

const Banner = () => {
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickedStates, setClickedStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banner');
      const data = await response.json();
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const banner = document.getElementById("banner-container");
    if (banner) {
      const bannerHeight = banner.offsetHeight;
      const extraOffset = 250;
      window.scrollTo({
        top: bannerHeight + extraOffset,
        behavior: "smooth",
      });
    }
  };

  const handleClick = (bannerId: string) => {
    setClickedStates(prev => ({ ...prev, [bannerId]: true }));
  };

  if (loading) {
    return (
      <div className="container-fluid" id="banner-container">
        <div className="text-center py-5">Loading banners...</div>
      </div>
    );
  }

  if (!banners.length) {
    return (
      <div className="container-fluid" id="banner-container">
        <div className="text-center py-5">No banners available</div>
      </div>
    );
  }

  return (
    <div className="container-fluid" id="banner-container">
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        navigation
        loop
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner._id}>
            <div className="carousel-item active">
              <Image
                src={banner.image}
                className="d-block w-100 img-fluid"
                alt={banner.title || `Slide ${banner.order + 1}`}
                width={1920}
                height={600}
                priority
              />

              {/* Scroll Down Button */}
              <button className="scrolldown" onClick={handleScroll}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="50"
                  height="50"
                  fill="currentColor"
                  className="bi bi-arrow-down"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 
                    0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 
                    0l-4-4a.5.5 0 0 1 .708-.708L7.5 
                    13.293V1.5A.5.5 0 0 1 8 1"
                  />
                </svg>
              </button>

              {/* Caption + Button - Only show if title exists */}
              {banner.title && (
                <div className="carousel-caption d-md-block">
                  <h1>{banner.title}</h1>
                  <Link href={banner.link || "/products"}>
                    <button
                      className={`${!clickedStates[banner._id] ? "ordernow" : "clicked"}`}
                      onClick={() => handleClick(banner._id)}
                    >
                      Order now
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Banner;