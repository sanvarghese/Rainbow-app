"use client";
import React, { useEffect, useState } from 'react'
import specialoff from '../../../../assets/images/SpecialOFFER.jpg';
import '../SpecialOffer/SpecialOffer.css';
import Image from 'next/image';


const SpecialOffer = () => {
     const [seconds, setSeconds] = useState(18000);
    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (sec:number) => {
        const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
        const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
        const secs = String(sec % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };
  return (
     <div className="carousel special-offer mt-5">
            <Image src={specialoff} alt="Banner Image" className="carousel-image" />
            <div className="carousel-content-1">
                <p><b>Special discount offer for <br />vegetable items</b></p>
                <div className="timer">{formatTime(seconds)}</div>
            </div>
        </div>
  )
}

export default SpecialOffer
