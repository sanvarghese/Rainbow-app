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
  const sliderRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Mouse Events
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    isDragging.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
    sliderRef.current.classList.add("dragging");
  };

  const handleMouseLeave = () => {
    if (!sliderRef.current) return;
    isDragging.current = false;
    sliderRef.current.classList.remove("dragging");
  };

  const handleMouseUp = () => {
    if (!sliderRef.current) return;
    isDragging.current = false;
    sliderRef.current.classList.remove("dragging");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !sliderRef.current) return;

    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // Touch Events
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    startX.current = e.touches[0].pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

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
                <Image src={topvendors1} alt="Vendor 1" width={150} height={150} />
              </div>
              <div className="vendor-item">
                <Image src={topvendors6} alt="Vendor 6" width={150} height={150} />
              </div>
              <div className="vendor-item">
                <Image src={secondImage} alt="Vendor 2" width={150} height={150} />
              </div>
              <div className="vendor-item">
                <Image src={topvendors3} alt="Vendor 3" width={150} height={150} />
              </div>
              <div className="vendor-item">
                <Image src={topvendors4} alt="Vendor 4" width={150} height={150} />
              </div>
              <div className="vendor-item">
                <Image src={topvendors5} alt="Vendor 5" width={150} height={150} />
              </div>
              <div className="vendor-item">
                <Image src={topvendors7} alt="Vendor 7" width={150} height={150} />
              </div>
              <div className="vendor-item">
                <Image src={topvendors8} alt="Vendor 8" width={150} height={150} />
              </div>
              <div className="vendor-item">
                <Image src={topvendors1} alt="Vendor 1" width={150} height={150} />
              </div>
              <div className="vendor-item">
                <Image src={topvendors6} alt="Vendor 6" width={150} height={150} />
              </div>
              <div className="vendor-item">
                <Image src={secondImage} alt="Vendor 2" width={150} height={150} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}