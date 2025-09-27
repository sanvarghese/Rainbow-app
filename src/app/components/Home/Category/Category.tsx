"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import Image from "next/image";
import "../Category/Category.css";

import vegetablesImg from "../../../../assets/images/vegetables.png";
import curryPowdersImg from "../../../../assets/images/currypowders.png";
import dryImg from "../../../../assets/images/currypowders.png";
import juiceImg from "../../../../assets/images/juice.png";
import meatImg from "../../../../assets/images/meat.png";
import snacksImg from "../../../../assets/images/snacks.png";
import honeyImg from "../../../../assets/images/honey.png";
import dairyImg from "../../../../assets/images/diary.png";
import groceryImg from "../../../../assets/images/grocery.png";
import fruitsImg from "../../../../assets/images/fruits.png";

const Category = () => {
  const categories = [
    { name: "Vegetables", img: vegetablesImg },
    { name: "Curry Powders", img: curryPowdersImg },
    { name: "Dry Items", img: dryImg },
    { name: "Juice", img: juiceImg },
    { name: "Meat", img: meatImg },
    { name: "Snacks", img: snacksImg },
    { name: "Honey", img: honeyImg },
    { name: "Dairy", img: dairyImg },
    { name: "Grocery", img: groceryImg },
    { name: "Fruits", img: fruitsImg },
  ];

  const colors = [
    "#FCEDED", "#F5FBE3", "#FCF2E7", "#E3FBE9", "#E9E3FB",
    "#ECF8F2", "#F8F5E5", "#DDDDDD", "#F0F8E5", "#F6EBF3"
  ];

  return (
    <section className="cat-list-scroll">
      <div className="container-fluid">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={10}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          loop={true}
          breakpoints={{
            1700: { slidesPerView: 7 },
            1200: { slidesPerView: 6 },
            1024: { slidesPerView: 5 },
            920: { slidesPerView: 4 },
            540: { slidesPerView: 2 },
            344: { slidesPerView: 1 },
          }}
        >
          {categories.map((category, index) => (
            <SwiperSlide key={index}>
              <div
                className="category-box mx-auto d-flex justify-content-center align-items-center"
                style={{ backgroundColor: colors[index % colors.length] }}
              >
                <Image
                  src={category.img}
                  alt={category.name}
                  width={80}
                  height={80}
                />
              </div>
              <p className="fw-bold mt-2 text-center">{category.name}</p>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Category;
