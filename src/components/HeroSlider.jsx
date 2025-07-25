'use client'

import React from 'react'
import Slider from 'react-slick'
import Navbar from './layout/navbar'
import Link from 'next/link'
import { HeroSlides } from '@/utils/data'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

export default function HeroSlider() {
  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  }

  return (
    <div className="w-full relative">
      <div className="absolute top-0 left-0 w-full z-10">
        <Navbar />
      </div>
      <Slider {...settings}>
        {HeroSlides.map((slide, index) => (
          <div key={index}>
            <div
              className="w-full px-6 md:px-20 text-white relative"
              style={{
                backgroundImage: `url(${slide.bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="max-w-[1170px] mx-auto h-[730px] pt-20 flex items-center justify-start">
                <div className="max-w-md text-left p-6 rounded-md">
                  <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-lg mb-6">{slide.desc}</p>
                  <Link href={slide.btnLink}>
                    <button className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200">
                      {slide.btnText}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}
