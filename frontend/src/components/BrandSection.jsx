'use client'
import React from 'react'
import ImageSlider from '@/components/common/ImageSlider'
import { brandLogos } from '@/utils/data'
import HeadingBar from './common/heading-bar'

const BrandSection = () => {
 const headingBarData = {
  title: "Why combine corporate gifts with brands?",
  description: "Choosing promotional gifts from well-known brands with a logo is a strategic move that upgrades the image of your company. High-quality products from brands such as Sony, JBL or Chilly’s associate your company with reliability, innovation and prestige. In addition, such gifts enhance the positive impression on your customers and partners, offering practical value and strengthening your relationship with them.",
  line: true,
  fullWidth: true,
 }
 const defaultSettings = {
  infinite: true,
  autoplay: true,
  speed: 1500,
  autoplaySpeed: 2000,
  slidesToShow: 5,
  slidesToScroll: 1,
  arrows: false,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 768, settings: { slidesToShow: 2 } },
    { breakpoint: 480, settings: { slidesToShow: 1 } },
  ],
}
  return (
    <section className="bg-[#f5f5f5] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <HeadingBar data={headingBarData} />
        <ImageSlider logos={brandLogos} settings={defaultSettings} />
      </div>
    </section>
  )
}

export default BrandSection

