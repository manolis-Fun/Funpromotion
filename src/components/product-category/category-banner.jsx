"use client"
import React from "react";
import { FiArrowLeft, FiChevronRight } from "react-icons/fi";
import { FaGamepad, FaRegFileAlt, FaPaintBrush, FaPiggyBank, FaTag } from "react-icons/fa";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { categoryBannerCards } from '@/utils/data';
import 'swiper/css';
import 'swiper/css/navigation';
import WaveLine from "@/icons/wave-line";
import Link from "next/link";

const CategoryBanner = ({ sidebarData }) => {
  const getIconComponent = (iconName) => {
    const iconMap = {
      'FaGamepad': FaGamepad,
      'FaRegFileAlt': FaRegFileAlt,
      'FaPaintBrush': FaPaintBrush,
      'FaPiggyBank': FaPiggyBank,
    };
    return iconMap[iconName] || FaGamepad;
  };
  const subcategories = sidebarData.productCategories?.nodes?.[0]?.children?.nodes || [];

  return (
    <section className="bg-[#7B2CBF] relative text-white overflow-hidden pb-16 pt-[200px]">
      {/* Wave line */}
      <WaveLine />
      <div className="max-w-7xl mx-auto px-4 sm:px-8  relative z-10 text-center  mt-8">
        {sidebarData?.productCategories?.nodes?.[0]?.image?.sourceUrl && (
          <img
            className="h-16 w-20 mb-6 mx-auto"
            src={sidebarData?.productCategories?.nodes?.[0]?.image?.sourceUrl}
            alt={sidebarData?.productCategories?.nodes?.[0]?.image?.altText}
          />
        )}
        <div className="flex justify-center items-center space-x-3 mb-4">
          <Link href="/">
            <FiArrowLeft className="text-white text-2xl cursor-pointer" />
          </Link>
          <h1 className="text-3xl font-bold">{sidebarData?.productCategories?.nodes?.[0]?.name || ''}</h1>
        </div>
      </div>
      <div className='max-w-[1361px] mx-auto text-center'>
        <p>{sidebarData?.productCategories?.nodes?.[0]?.description || ''}</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 z-10 relative mb-12 mt-6">
        <Swiper
          modules={[Navigation]}
          spaceBetween={10}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 10,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 10,
            },
          }}
          className="category-banner-swiper"
        >
          {
            subcategories?.map((cat) => {
              const IconComponent = getIconComponent(cat?.icon || 'FaTag');
              return (
                <SwiperSlide key={cat.id}>
                  <div className="bg-white text-black rounded-xl flex items-center space-x-1 shadow-sm h-full p-2">
                    {cat?.image?.sourceUrl && (
                      <Image src={cat?.image?.sourceUrl} alt={cat?.image?.altText} width={20} height={20} />
                    )}
                    <div>
                      <p className="font-semibold">{cat.name}</p>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          <div className="swiper-button-prev !text-black !bg-white !w-10 !h-10 !rounded-full !shadow !border !border-gray-200 !flex !items-center !justify-center !absolute !top-[80px] !-translate-y-1/2 !left-[3px]">
          </div>
          <div className="swiper-button-next !text-black !bg-white !w-10 !h-10 !rounded-full !shadow !border !border-gray-200 !flex !items-center !justify-center !absolute !top-[80px] !-translate-y-1/2 !right-[3px]">
          </div>
        </Swiper>
      </div>
    </section>
  );
};

export default CategoryBanner;
