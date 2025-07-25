'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiSearch,
  FiMail,
  FiPhone,
  FiUser,
  FiHeart,
  FiShoppingCart,
  FiX,
} from 'react-icons/fi';
import NavModal from './header-modal';
import SearchModal from '../common/searchModal';
import { menuSections, rootLinks } from '@/utils/data';
import AvatarDropdown from './avatar-dropdown';

const Navbar = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [modalPosition, setModalPosition] = useState(null);
  const [isAvatarDropdownVisible, setIsAvatarDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scrolling when search modal is open
  useEffect(() => {
    if (isSearchModalVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSearchModalVisible]);

  const handleCategoryHover = (category) => {
    setHoveredCategory(category);
    setIsModalVisible(true);
  };

  const handleModalLeave = () => {
    setIsModalVisible(false);
    setHoveredCategory(null);
  };

  const handleMouseEnter = (category, event) => {
    if (category) {
      setActiveCategory(category);
      const rect = event.currentTarget.getBoundingClientRect();
      setModalPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom
      });
    }
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
    setModalPosition(null);
  };

  const showAvatarDropdown = () => {
    setIsAvatarDropdownVisible(true);
  };

  const hideAvatarDropdown = () => {
    setIsAvatarDropdownVisible(false);
  };

  return (
    <>
      {isSearchModalVisible ? (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[1000]"
            onClick={() => setIsSearchModalVisible(false)}
          />
          <div className="fixed top-10 left-1/2 transform -translate-x-1/2 w-full max-w-[60%] z-[1010] px-4">
            <div className="relative flex items-center bg-[#f0f0f0] rounded-[12px] px-4 py-2 border shadow-lg">
              <FiSearch className="text-orange-500 mr-2" />
              <input
                type="text"
                placeholder="Search products…"
                className="bg-transparent outline-none w-full text-sm"
                value={searchQuery}
                autoFocus
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchModalVisible(true)}
                onBlur={() => {
                  setTimeout(() => setIsSearchModalVisible(false), 200)
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="ml-2 bg-purple-500 text-white rounded-full p-[2px] focus:outline-none"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FiX className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="z-[1020] mt-2">
              <SearchModal query={searchQuery} onClose={() => setIsSearchModalVisible(false)} />
            </div>
          </div>
        </>
      ) : (
        <div className={`fixed left-0 right-0 z-[999] transition-all duration-300 mx-10 mt-7 rounded-3xl bg-white shadow-md ${isScrolled ? 'top-[10px]' : 'top-[60px]'}`}>
          <div className={`transition-all duration-300 ${isScrolled ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-[200px] opacity-100'}`}>
            <div className="flex justify-between items-center px-5 py-4 inter-style">
              <Link href="/" className='cursor-pointer'>
                <div className="text-2xl leading-[32px] font-bold flex items-center ml-[30px]">
                  <span className="text-[#FF6600]">FUN</span>
                  <span className="text-[#333333] ml-1">PROMOTION</span>
                </div>
              </Link>

              <div className="relative flex items-center bg-[#f0f0f0] rounded-[12px] px-4 py-2 w-[50%] border  ">
                <FiSearch className="text-orange-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search products…"
                  className="bg-transparent outline-none w-full text-sm"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchModalVisible(true)}
                  onBlur={() => {
                    setTimeout(() => setIsSearchModalVisible(false), 200)
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="ml-2 bg-purple-500 text-white rounded-full p-[2px] focus:outline-none"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                )}
                {isSearchModalVisible && (
                  <SearchModal query={searchQuery} onClose={() => setIsSearchModalVisible(false)} />
                )}
              </div>

              <div className="flex items-center space-x-6">
                {/* Contact Information */}
                <div className="flex items-center space-x-4 mr-4">
                  <div className="flex items-center space-x-2">
                    <FiMail className="w-4 h-4 text-gray-400" />
                    <a href="mailto:sales@fun-promotion.gr" className="text-sm text-gray-400 font-semibold hover:text-orange-500 transition-colors">
                      sales@fun-promotion.gr
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    <a href="tel:+302102207424" className="text-sm text-gray-400 font-semibold hover:text-orange-500 transition-colors">
                      +30 210 220 7424
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div
                    className="relative"
                    ref={dropdownRef}
                    onMouseEnter={showAvatarDropdown}
                    onMouseLeave={hideAvatarDropdown}
                  >
                    <button
                      className="p-2 hover:text-orange-500 transition-colors"
                    >
                      <FiUser className="w-6 h-6" />
                    </button>
                    <AvatarDropdown
                      isVisible={isAvatarDropdownVisible}
                      onClose={() => setIsAvatarDropdownVisible(false)}
                    />
                  </div>
                  <Link href="/wishlist" className="p-2 hover:text-orange-500 transition-colors">
                    <FiHeart className="w-6 h-6" />
                  </Link>
                  <Link href="/cart" className="p-2 hover:text-orange-500 transition-colors">
                    <div className="relative">
                      <FiShoppingCart className="w-6 h-6" />
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        0
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Category Menu - always visible */}
          <div className={`flex ${isScrolled ? 'justify-between px-10' : 'justify-center'} py-3 space-x-9 leading-[50px] text-[14px] font-bold text-gray-800 inter-style`}>
            {/* Logo - only visible when scrolled */}
            {isScrolled && (
              <Link href="/" className='cursor-pointer'>
                <div className="text-2xl leading-[32px] font-bold flex items-center">
                  <span className="text-[#FF6600]">FUN</span>
                  <span className="text-[#333333] ml-1">PROMOTION</span>
                </div>
              </Link>
              
            )}
            {/* Navigation Links */}
            <div className="flex space-x-9">
              <nav className="flex items-center space-x-6 py-4 text-sm uppercase">
                {rootLinks.map(link =>
                  link.href ? (
                    <Link key={link.label} href={link.href} className="hover:text-[#FF6600] transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <div
                      key={link.id}
                      className="relative group"
                      onMouseEnter={(e) => handleMouseEnter(menuSections.find(section => section.id === link.id), e)}
                    >
                      <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-500">
                        {link.label}
                      </button>
                      {activeCategory?.id === link.id && (
                        <div
                          className="fixed left-0 right-0"
                          style={{ top: '142px' }}
                          onMouseLeave={handleMouseLeave}
                        >
                          <NavModal
                            category={activeCategory}
                            isVisible={true}
                            onClose={() => setActiveCategory(null)}
                            position={modalPosition}
                            isScrolled={isScrolled}
                          />
                        </div>
                      )}
                    </div>
                  )
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
