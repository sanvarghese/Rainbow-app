import React from 'react'
import Image from 'next/image'
import ban_one from '../../../../assets/images/banner.png'
import '../OrderBanner/orderBanner.css'

const OrderBanner = () => {
  return (
  <section className="order-banner-home">
            <div className='container-fluid order-banner banner'>
                <div className="carousel">
                    <Image src={ban_one} alt="Banner Image" className="carousel-image" />
                    <div className="carousel-content">
                        <h2>WE DELIVER ACROSS<br></br> INDIA</h2>
                        <button type="button" className="carousel-button">Order now</button>
                    </div>
                </div>
            </div>
        </section>

  )
}

export default OrderBanner
