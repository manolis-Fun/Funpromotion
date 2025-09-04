'use client'
import React from 'react'
import ImageSlider from '@/components/common/ImageSlider'
import { TopLogos } from '@/utils/data'

const TopCompanies = () => {


    return (
        <section className='bg-[#f8f8f8]'>
            <h3 className="text-[20px] leading-[28px] font-semibold mb-8 manrope-font text-center text-[rgb(255,119,0)] pt-4 ">They trusted us.</h3>
            <ImageSlider logos={TopLogos} />
        </section>
    )
}

export default TopCompanies 