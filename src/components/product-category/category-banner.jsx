"use client"
import React, { useState } from "react";
import { FiArrowLeft, FiChevronRight } from "react-icons/fi";
import { FaGamepad, FaRegFileAlt, FaPaintBrush, FaPiggyBank, FaTag } from "react-icons/fa";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { categoryBannerCards } from '@/utils/data';
import { useRefinementList, useInstantSearch } from 'react-instantsearch';
import 'swiper/css';
import 'swiper/css/navigation';
import WaveLine from "@/icons/wave-line";
import Link from "next/link";

// Categories Banner Component
const CategoriesBanner = ({ categories = [] }) => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const getIconForCategory = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('bamboo') || name.includes('eco')) return FaGamepad;
    if (name.includes('carabiner') || name.includes('metal')) return FaRegFileAlt;
    if (name.includes('plastic') || name.includes('bottle')) return FaPaintBrush;
    return FaTag;
  };

  // Only use provided categories, no fallback
  const categoriesToShow = categories;

  if (categoriesToShow.length === 0) return null;

  // Show navigation if there are more items than can be displayed on any screen size
  // Mobile (1 item): show if > 1 items
  // Tablet (2-3 items): show if > 2-3 items
  // Desktop (4 items): show if > 4 items
  const showNavigation = categoriesToShow.length > 1;

  return (
    <div className="max-w-7xl mx-auto px-12 sm:px-16 relative z-10 mb-8">
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={1}
        navigation={showNavigation ? {
          nextEl: '.categories-swiper-button-next',
          prevEl: '.categories-swiper-button-prev',
        } : false}
        onSwiper={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        onSlideChange={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 16,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 16,
          },
        }}
        className="categories-banner-swiper"
      >
        {categoriesToShow.map((category, index) => {
          const IconComponent = getIconForCategory(category.name);
          
          return (
            <SwiperSlide key={category.name || index}>
              <Link href={`/product-category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="bg-white text-black rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 h-16 flex items-center">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800">{category.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{category.count} products</p>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}

        {showNavigation && (
          <>
            <div className={`categories-swiper-button-prev !text-gray-500 !bg-gray-100 !w-10 !h-10 !rounded-full !flex !items-center !justify-center !absolute !top-4 !left-3 !z-10 hover:!bg-gray-200 hover:!text-gray-700 !transition-all !cursor-pointer ${isBeginning ? '!opacity-0 !pointer-events-none' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className={`categories-swiper-button-next !text-gray-500 !bg-gray-100 !w-10 !h-10 !rounded-full !flex !items-center !justify-center !absolute !top-4 !right-3 !z-10 hover:!bg-gray-200 hover:!text-gray-700 !transition-all !cursor-pointer ${isEnd ? '!opacity-0 !pointer-events-none' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </>
        )}
      </Swiper>
    </div>
  );
};

const CategoryBanner = ({ sidebarData, categories }) => {
  const [mainIsBeginning, setMainIsBeginning] = useState(true);
  const [mainIsEnd, setMainIsEnd] = useState(false);

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
          onSwiper={(swiper) => {
            setMainIsBeginning(swiper.isBeginning);
            setMainIsEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setMainIsBeginning(swiper.isBeginning);
            setMainIsEnd(swiper.isEnd);
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
          <div className={`swiper-button-prev !text-black !bg-white !w-10 !h-10 !rounded-full !shadow !border !border-gray-200 !flex !items-center !justify-center !absolute !top-[80px] !-translate-y-1/2 !left-[3px] ${mainIsBeginning ? '!opacity-0 !pointer-events-none' : ''}`}>
          </div>
          <div className={`swiper-button-next !text-black !bg-white !w-10 !h-10 !rounded-full !shadow !border !border-gray-200 !flex !items-center !justify-center !absolute !top-[80px] !-translate-y-1/2 !right-[3px] ${mainIsEnd ? '!opacity-0 !pointer-events-none' : ''}`}>
          </div>
        </Swiper>
      </div>
      
      {/* Categories Section */}
      <CategoriesBanner categories={categories} />
    </section>
  );
};

export default CategoryBanner;
