'use client'
import React, { useState, useEffect } from 'react'
import '../SubCategory/SubCategory.css'
import Image from 'next/image';
import Link from 'next/link';

const SubCategory = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const response = await fetch('/api/subcategories');
      const data = await response.json();
      if (data.success) {
        setSubCategories(data.subCategories);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className='products-section-home mb-5'>
        <div className="container-fluid text-center">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no subcategories, don't show the section
  if (subCategories.length === 0) {
    return null;
  }

  // Background classes array for cycling through different card styles
  const bgClasses = ['card-bg-1', 'card-bg-2', 'card-bg-3', 'card-bg-4'];
  const imgClasses = ['card-img', 'card-img2', 'card-img3', 'card-img4'];

  return (
    <section className='products-section-home mb-5'>
      <div className="container-fluid text-center">
        <div className="row justify-content-center product-list">
          {subCategories.map((subCategory, index) => (
            <div key={subCategory._id} className="col-12 col-md-6 col-custom-3 mt-4">
              <div className={`card fixed-card ${bgClasses[index % bgClasses.length]}`}>
                <div className="card-body">
                  <h4 className="card-title card-text ">
                    {subCategory.name.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {word}
                        {i === 0 && <br />}
                      </React.Fragment>
                    ))}
                  </h4>
                  <Link href={`/products?subcategory=${encodeURIComponent(subCategory.name)}&category=${encodeURIComponent(subCategory.parentCategory)}`}>
                    <button className="btn order-btn">Order Now</button>
                  </Link>
                  {subCategory.image ? (
                    <Image 
                      className={imgClasses[index % imgClasses.length]} 
                      src={subCategory.image} 
                      alt={subCategory.name} 
                      width={200}
                      height={200}
                    />
                  ) : (
                    <div className={`${imgClasses[index % imgClasses.length]} placeholder-image`}>
                      {/* Optional: Add a default icon or leave empty */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SubCategory