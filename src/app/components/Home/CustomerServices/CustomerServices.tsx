import React from 'react'
import '../CustomerServices/CustomerService.css'
import services1 from '../../../../assets/images/services_1.png'
import services2 from '../../../../assets/images/services_2.png'
import services3 from '../../../../assets/images/services_3.png'
import services4 from '../../../../assets/images/services_4.png'
import Image from 'next/image'

const CustomerServices = () => {
  return (
   <div className="container-fluid mt-5" id='services-container'>
            <div className="row justify-content-center">
                <div className="col-12 col-sm-6 col-md-6 col-lg-3">
                    <div className="service-box">
                        <Image className="service-img" src={services1} alt="Free Shipping" />
                        <div>
                            <span className="heading1">Free Shipping</span>
                          
                            <p className="content1">Free shipping all over the US</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-md-6 col-lg-3">
                    <div className="service-box">
                        <Image className="service-img" src={services2} alt="Satisfaction" />
                        <div>
                            <span className="heading1">100% Satisfaction</span>
                            
                            <p className="content1">Free shipping all over the US</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-md-6 col-lg-3">
                    <div className="service-box">
                        <Image className="service-img" src={services3} alt="Secure Payments" />
                        <div>
                            <span className="heading1">Secure Payments</span>
                          
                            <p className="content1">Free shipping all over the US</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-md-6 col-lg-3">
                    <div className="service-box">
                        <Image className="service-img" src={services4} alt="Support" />
                        <div>
                            <span className="heading1">24/7 Support</span>
                            
                            <p className="content1">Free shipping all over the US</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default CustomerServices
