"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import "./Weeklytopvendors.css";

import vendorlogo1 from "../../../../assets/images/vendorlogo1.png";
import vendorlogo1_image1 from "../../../../assets/images/vendorlogo1_image1.png";
import vendorlogo1_image2 from "../../../../assets/images/vendorlogo1_image2.png";
import vendorlogo1_image3 from "../../../../assets/images/vendorlogo1_image3.png";
import vendorlogo1_image4 from "../../../../assets/images/vendorlogo1_image4.png";

import vendorlogo2 from "../../../../assets/images/vendorlogo2.png";
import vendorlogo2_image1 from "../../../../assets/images/vendorlogo2_image1.png";
import vendorlogo2_image2 from "../../../../assets/images/vendorlogo2_image2.png";
import vendorlogo2_image3 from "../../../../assets/images/vendorlogo2_image3.png";
import vendorlogo2_image4 from "../../../../assets/images/vendorlogo2_image4.png";

// import vendorlogo3 from "../../assets/images/vendorlogo3.png";
import vendorlogo3_image1 from "../../../../assets/images/vendorlogo3_image1.png";
import vendorlogo3_image2 from "../../../../assets/images/vendorlogo3_image2.png";
import vendorlogo3_image3 from "../../../../assets/images/vendorlogo3_image3.png";
import vendorlogo3_image4 from "../../../../assets/images/vendorlogo3_image4.png";

const WeeklyTopVenders: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    const fetchVendors = async () => {
      await new Promise((res) => setTimeout(res, 1000));

      const response = [
        {
          id: 1,
          logo: vendorlogo1,
          heading: "Organic Market",
          images: [
            vendorlogo1_image1,
            vendorlogo1_image2,
            vendorlogo1_image3,
            vendorlogo1_image4,
          ],
        },
        {
          id: 2,
          logo: vendorlogo2,
          heading: "Fresh Farm",
          images: [
            vendorlogo2_image1,
            vendorlogo2_image2,
            vendorlogo2_image3,
            vendorlogo2_image4,
          ],
        },
        {
          id: 3,
          logo: vendorlogo2,
          heading: "Green Basket",
          images: [
            vendorlogo3_image1,
            vendorlogo3_image2,
            vendorlogo3_image3,
            vendorlogo3_image4,
          ],
        },
        {
          id: 4,
          logo: vendorlogo1,
          heading: "Green Basket",
          images: [
            vendorlogo3_image1,
            vendorlogo3_image2,
            vendorlogo3_image3,
            vendorlogo3_image4,
          ],
        },
        {
          id: 5,
          logo: vendorlogo2,
          heading: "Green Basket",
          images: [
            vendorlogo3_image1,
            vendorlogo3_image2,
            vendorlogo3_image3,
            vendorlogo3_image4,
          ],
        },
        {
          id: 6,
          logo: vendorlogo1,
          heading: "Green Basket",
          images: [
            vendorlogo3_image1,
            vendorlogo3_image2,
            vendorlogo3_image3,
            vendorlogo3_image4,
          ],
        },
      ];

      setVendors(response);
    };

    fetchVendors();
  }, []);

  return (
    <div className="weeklytopvendors d-flex justify-content-center pt-3">
      <div className="container-fluid my-5" style={{ width: "90%" }}>
        <h1 className="weekiyheading mb-4">Weekly Top Vendors</h1>
        <div className="row">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="col-lg-4 col-md-6 mb-4">
              <div className={`vendor-card-wrapper gradient-${vendor.id}`}>
                <div className="card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-center mb-3 gap-2">
                    <Image
                      src={vendor.logo}
                      alt={vendor.heading}
                      width={50}
                      height={50}
                      style={{ width: 50, height: "auto" }}
                    />
                    <h4 className="font-weight-bold mb-0 text-center">
                      {vendor.heading}
                    </h4>
                  </div>
                  <p className="text-muted text-center">Delivery by 6:15am</p>
                  <div className="text-center">
                    <a href="#" className="btn btn-success mb-4">
                      Food Product
                    </a>
                  </div>
                  <div className="row">
                    {vendor.images.map((img: string, i: number) => (
                      <div className="col-3" key={i}>
                        <div className="card">
                          <Image
                            src={img}
                            alt={`Product ${i + 1}`}
                            className="img-fluid"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {vendors.length === 0 && (
            <div className="col-12 text-center">
              <p>Loading vendors...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyTopVenders;
