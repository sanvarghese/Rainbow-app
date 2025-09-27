"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

import bannerImage from "../../../../assets/images/bannerImage.png";
import Link from "next/link";
import Image from "next/image";
import "../Banner/Banner.css";

const Banner = () => {
  const [clicked, setClicked] = useState(false);

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

  const handleClick = () => {
    setClicked(true);
  };

  return (
    <div className="container-fluid" id="banner-container">
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        // autoplay={'false'}
        navigation
        loop
      >
        {[1, 2, 3].map((_, index) => (
          <SwiperSlide key={index}>
            <div className="carousel-item active">
              <Image
                src={bannerImage}
                className="d-block w-100 img-fluid"
                alt={`Slide ${index + 1}`}
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

              {/* Caption + Button */}
              <div className="carousel-caption d-md-block">
                <h1>Daily grocery order and</h1>
                <h1>get express delivery</h1>
                <Link href="/products">
                  <button
                    className={`${!clicked ? "ordernow" : "clicked"}`}
                    onClick={handleClick}
                  >
                    Order now
                  </button>
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Banner;
