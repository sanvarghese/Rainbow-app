import Image from 'next/image'
import React from 'react'
import adv_first from '../../../../assets/images/advantage-first.png'
import adv_second from '../../../../assets/images/advantage-second.png'
import adv_third from '../../../../assets/images/advantage-third.png'
import adv_four from '../../../../assets/images/advantage-four.png'
import '../Advantages/Advantages.css'

const Advantages = () => {

  return (
       <div className="adv-container mt-4">
            <div className="adv-container-inner container-fluid">
                <div className="adv-row row justify-content-center g-3">
                    <div className="adv-col col-12 col-sm-6 col-lg-3">
                        <div className="adv-card adv-card-one">
                            <Image className="adv-img" src={adv_first} alt="Support Local" />
                            <span className="adv-text">Support Local</span>
                        </div>
                    </div>

                    <div className="adv-col col-12 col-sm-6 col-lg-3">
                        <div className="adv-card adv-card-two">
                            <Image className="adv-img" src={adv_second} alt="Eat Organic" />
                            <span className="adv-text">Eat Organic</span>
                        </div>
                    </div>

                    <div className="adv-col col-12 col-sm-6 col-lg-3">
                        <div className="adv-card adv-card-three">
                            <Image className="adv-img" src={adv_third} alt="Live Sustainable" />
                            <span className="adv-text">Live Sustainable</span>
                        </div>
                    </div>

                    <div className="adv-col col-12 col-sm-6 col-lg-3">
                        <div className="adv-card adv-card-four">
                            <Image className="adv-img" src={adv_four} alt="Add Sustainable" />
                            <span className="adv-text">Add Sustainable</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default Advantages
