"use client";

import { useRef } from "react";
import Image from "next/image";
import "../TopVendors/TopVendors.css";

import topvendors1 from "../../../../assets/images/topvendors_1.png";
import secondImage from "../../../../assets/images/secondImage.png";
import topvendors3 from "../../../../assets/images/topvendors_3.png";
import topvendors4 from "../../../../assets/images/topvendors_4.png";
import topvendors5 from "../../../../assets/images/topvendors_5.png";
import topvendors6 from "../../../../assets/images/topvendors_6.png";
import topvendors7 from "../../../../assets/images/topvendors_7.png";
import topvendors8 from "../../../../assets/images/topvendors_8.png";

export default function TopVendors() {
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Mouse drag
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
    sliderRef.current.classList.add("dragging");
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    sliderRef.current.classList.remove("dragging");
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    sliderRef.current.classList.remove("dragging");
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // Touch drag
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const handleTouchMove = (e) => {
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <section className="top-vendors-home mt-5">
      <div className="topvendors-fluid pt-4 pb-4">
        <div className="row align-items-center">
          <div className="col-12 shop">
            <h2>Shop by Vendors</h2>
          </div>
          <div className="col-12 d-flex align-items-center justify-content-center">
            <div
              className="vendor-slider"
              ref={sliderRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <div className="vendor-item">
                <Image src={topvendors1} alt="Vendor 1" />
              </div>
              <div className="vendor-item">
                <Image src={topvendors6} alt="Vendor 6" />
              </div>
              <div className="vendor-item">
                <Image src={secondImage} alt="Vendor 2" />
              </div>
              <div className="vendor-item">
                <Image src={topvendors3} alt="Vendor 3" />
              </div>
              <div className="vendor-item">
                <Image src={topvendors4} alt="Vendor 4" />
              </div>
              <div className="vendor-item">
                <Image src={topvendors5} alt="Vendor 5" />
              </div>
              <div className="vendor-item">
                <Image src={topvendors7} alt="Vendor 7" />
              </div>
              <div className="vendor-item">
                <Image src={topvendors8} alt="Vendor 8" />
              </div>
              <div className="vendor-item">
                <Image src={topvendors1} alt="Vendor 1" />
              </div>
              <div className="vendor-item">
                <Image src={topvendors6} alt="Vendor 6" />
              </div>
              <div className="vendor-item">
                <Image src={secondImage} alt="Vendor 2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
