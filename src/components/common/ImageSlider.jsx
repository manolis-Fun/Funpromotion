'use client'
import React from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const defaultSettings = {
  infinite: true,
  autoplay: true,
  speed: 1500,
  autoplaySpeed: 2000,
  slidesToShow: 10,
  slidesToScroll: 1,
  arrows: false,
  responsive: [
    { breakpoint: 1280, settings: { slidesToShow: 6 } },
    { breakpoint: 1024, settings: { slidesToShow: 4 } },
    { breakpoint: 768, settings: { slidesToShow: 3 } },
    { breakpoint: 480, settings: { slidesToShow: 2 } },
  ],
}

const ImageSlider = ({ logos = [], settings = defaultSettings }) => (
  <Slider {...settings}>
    {logos.map((logo, idx) => (
      <div key={idx} className="h-[100px] flex items-center justify-center px-4">
        <img
          src={logo.src}
          alt={logo.alt}
          className="h-[60px] object-contain mx-auto"
        />
      </div>
    ))}
  </Slider>
)

export default ImageSlider
