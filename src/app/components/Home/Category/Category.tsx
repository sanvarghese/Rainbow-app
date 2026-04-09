"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import Image from "next/image";
import "../Category/Category.css";

// Default fallback images (keep these as fallbacks)
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

// Fallback images mapping for common category names
const fallbackImages: { [key: string]: any } = {
  "Vegetables": vegetablesImg,
  "Curry Powders": curryPowdersImg,
  "Dry Items": dryImg,
  "Juice": juiceImg,
  "Meat": meatImg,
  "Snacks": snacksImg,
  "Honey": honeyImg,
  "Dairy": dairyImg,
  "Grocery": groceryImg,
  "Fruits": fruitsImg,
};

interface CategoryType {
  _id: string;
  name: string;
  image?: string;
  status: string;
}

const Category = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = [
    "#FCEDED", "#F5FBE3", "#FCF2E7", "#E3FBE9", "#E9E3FB",
    "#ECF8F2", "#F8F5E5", "#DDDDDD", "#F0F8E5", "#F6EBF3"
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/category');
        const data = await response.json();

        if (data.success && data.categories) {
          // Filter only approved categories
          const approvedCategories = data.categories.filter(
            (cat: CategoryType) => cat.status === 'approved'
          );
          setCategories(approvedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Show loading state or return null while loading
  if (loading) {
    return (
      <section className="cat-list-scroll">
        <div className="container-fluid">
          <div className="text-center py-4">Loading categories...</div>
        </div>
      </section>
    );
  }

  // Don't render if no categories
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="cat-list-scroll">
      <div className="container-fluid d-flex justify-content-center">
        <div className="category-slider-wrapper" style={{ width: '100%', maxWidth: '1400px' }}>
          <Swiper
            modules={[Autoplay]}
            spaceBetween={10}
            centeredSlides={true}
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
            {categories.map((category, index) => {
              // Determine image source
              let imageSrc = fallbackImages[category.name] || vegetablesImg;

              // If category has custom image URL from database, use it
              if (category.image) {
                imageSrc = category.image;
              }

              return (
                <SwiperSlide key={category._id}>
                  <div
                    className="category-box mx-auto d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  >
                    {typeof imageSrc === 'string' ? (
                      // For URL strings from database
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageSrc}
                        alt={category.name}
                        width={80}
                        height={80}
                        style={{ objectFit: 'contain' }}
                      />
                    ) : (
                      // For imported static images
                      <Image
                        src={imageSrc}
                        alt={category.name}
                        width={80}
                        height={80}
                      />
                    )}
                  </div>
                  <p className="fw-bold mt-2 text-center">{category.name}</p>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Category;