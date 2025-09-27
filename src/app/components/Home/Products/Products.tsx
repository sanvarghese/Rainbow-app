'use client'
import React from 'react'
import cardimg from '../../../../assets/images/cardimg.png'
import cardimg2 from '../../../../assets/images/DryFR.png';
import cardimg3 from '../../../../assets/images/beauty.png';
import cardimg4 from '../../../../assets/images/Everyday.png';
import '../Products/products.css'
import Image from 'next/image';

const Products = () => {
  return (
     <section className='products-section-home  mb-5'>
            <div className="container-fluid text-center">
                <div className="row justify-content-center product-list">
                    <div className="col-12 col-md-6 col-custom-3 mt-4">
                        <div className="card card-bg-1 fixed-card">
                            <div className="card-body">
                                <h4 className="card-title card-text">Homely<br />Products</h4>
                                <button className="btn order-btn ">Order Now</button>
                                <Image className="card-img" src={cardimg} alt="Homely Products" />
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-custom-3 mt-4">
                        <div className="card card-bg-2 fixed-card">
                            <div className="card-body">
                                <h4 className="card-title card-text">Dry Fruit</h4>
                                <button className="btn order-btn ">Order Now</button>
                                <Image className="card-img2" src={cardimg2} alt="Dry Fruit" />
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-custom-3 mt-4">
                        <div className="card card-bg-3 fixed-card">
                            <div className="card-body">
                                <h4 className="card-title card-text">Beauty Products</h4>
                                <button className="btn order-btn ">Order Now</button>
                                <Image className="card-img3" src={cardimg3} alt="Beauty Products" />
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-custom-3 mt-4">
                        <div className="card card-bg-4 fixed-card">
                            <div className="card-body">
                                <h4 className="card-title card-text">Everyday<br />Special</h4>
                                <button className="btn order-btn ">Order Now</button>
                                <Image className="card-img4" src={cardimg4} alt="Everyday Special" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
  )
}

export default Products
