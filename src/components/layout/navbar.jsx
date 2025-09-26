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
  FiMenu,
} from 'react-icons/fi';
import NavModal from './header-modal';
import SearchModal from '../common/searchModal';
import { menuSections, rootLinks } from '@/utils/data';
import AvatarDropdown from './avatar-dropdown';

const Navbar = React.memo(() => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [modalPosition, setModalPosition] = useState(null);
  const [isAvatarDropdownVisible, setIsAvatarDropdownVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          setIsScrolled(scrollPosition > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      {isSearchModalVisible && (
        <>
          {/* Top persistent search bar */}
          <div className="fixed top-0 left-0 right-0 z-[1015] bg-white shadow-md border-b">
            <div className="flex items-center justify-between px-4 lg:px-6 py-3">
              {/* Logo */}
              <Link href="/" className='cursor-pointer'>
                <div className="text-lg lg:text-xl leading-[24px] font-bold flex items-center">
                  <span className="text-[#FF6600]">FUN</span>
                  <span className="text-[#333333] ml-1">PROMOTION</span>
                </div>
              </Link>

              {/* Search bar */}
              <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
                <div className="relative flex items-center bg-[#f0f0f0] rounded-[12px] px-3 lg:px-4 py-2 border shadow-sm">
                  <FiSearch className="text-orange-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Search products…"
                    className="bg-transparent outline-none w-full text-sm"
                    value={searchQuery}
                    autoFocus
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsSearchModalVisible(false);
                        setSearchQuery('');
                      }
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
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  setIsSearchModalVisible(false);
                  setSearchQuery('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>
          
          {/* Search results container */}
          <div className="fixed top-16 left-0 right-0 bottom-0 z-[1010]">
            <SearchModal 
              query={searchQuery} 
              onClose={() => {
                setIsSearchModalVisible(false);
                setSearchQuery('');
              }} 
            />
          </div>
        </>
      )}

      {!isSearchModalVisible && (
        <div className={`fixed left-0 right-0 z-[999] transition-all duration-300 mx-0 lg:mx-10 mt-0 lg:mt-7 rounded-none lg:rounded-3xl bg-white shadow-md ${isScrolled ? 'top-[0px]' : 'top-[68px] lg:top-[68px]'}`}>
          {/* Desktop Top Bar */}
          <div className={`hidden lg:block transition-all duration-300 will-change-transform ${isScrolled ? 'transform scale-y-0 opacity-0 overflow-hidden origin-top' : 'transform scale-y-100 opacity-100'}`} style={{ height: isScrolled ? '0' : 'auto' }}>
            <div className="flex justify-between items-center px-5 py-4 inter-style">
              <Link href="/" className='cursor-pointer'>
                <div className="text-2xl leading-[32px] font-bold flex items-center ml-[30px]">
                  <span className="text-[#FF6600]">FUN</span>
                  <span className="text-[#333333] ml-1">PROMOTION</span>
                </div>
              </Link>

              <div className="relative flex items-center bg-[#f0f0f0] rounded-[12px] px-4 py-2 w-[50%] border">
                <FiSearch className="text-orange-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search products…"
                  className="bg-transparent outline-none w-full text-sm"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchModalVisible(true)}
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

          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-between px-4 py-3 mobile-menu-container">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:text-orange-500 transition-colors"
            >
              <FiMenu className="w-6 h-6" />
            </button>

            <Link href="/" className='cursor-pointer'>
              <div className="text-xl font-bold flex items-center">
                <span className="text-[#FF6600]">FUN</span>
                <span className="text-[#333333] ml-1">PROMOTION</span>
              </div>
            </Link>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSearchModalVisible(true)}
                className="p-2 hover:text-orange-500 transition-colors"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              <Link href="/cart" className="p-2 hover:text-orange-500 transition-colors">
                <div className="relative">
                  <FiShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center text-[10px]">
                    0
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[1000]"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Slide Menu */}
              <div className={`lg:hidden fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-[1001] transform transition-transform duration-300 ease-in-out mobile-menu-container`}>
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <Link href="/" className='cursor-pointer' onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="text-lg font-bold flex items-center">
                        <span className="text-[#FF6600]">FUN</span>
                        <span className="text-[#333333] ml-1">PROMOTION</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="px-4 py-4 space-y-4">
                      {/* Mobile Search */}
                      <div className="relative flex items-center bg-[#f0f0f0] rounded-[12px] px-4 py-2 border">
                        <FiSearch className="text-orange-500 mr-2" />
                        <input
                          type="text"
                          placeholder="Search products…"
                          className="bg-transparent outline-none w-full text-sm"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          onFocus={() => {
                            setIsSearchModalVisible(true);
                            setIsMobileMenuOpen(false);
                          }}
                        />
                      </div>

                      {/* Mobile Navigation */}
                      <nav className="space-y-1">
                        {rootLinks.map(link =>
                          link.href ? (
                            <Link
                              key={link.label}
                              href={link.href}
                              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#FF6600] hover:bg-gray-50 rounded-md transition-colors border-b border-gray-100"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {link.label}
                            </Link>
                          ) : (
                            <button
                              key={link.id}
                              className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#FF6600] hover:bg-gray-50 rounded-md transition-colors border-b border-gray-100"
                              onClick={() => {
                                const category = menuSections.find(section => section.id === link.id);
                                setActiveCategory(category);
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              {link.label}
                            </button>
                          )
                        )}
                      </nav>

                      {/* Mobile User Actions */}
                      <div className="border-t pt-4 mt-6">
                        <div className="space-y-3">
                          <Link
                            href="/profile"
                            className="flex items-center space-x-3 text-sm text-gray-600 hover:text-orange-500 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <FiUser className="w-5 h-5" />
                            <span>Account</span>
                          </Link>
                          <Link
                            href="/wishlist"
                            className="flex items-center space-x-3 text-sm text-gray-600 hover:text-orange-500 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <FiHeart className="w-5 h-5" />
                            <span>Wishlist</span>
                          </Link>
                        </div>

                        {/* Mobile Contact Info */}
                        <div className="mt-6 space-y-3 px-4">
                          <div className="flex items-center space-x-3">
                            <FiMail className="w-4 h-4 text-gray-400" />
                            <a href="mailto:sales@fun-promotion.gr" className="text-sm text-gray-600 hover:text-orange-500">
                              sales@fun-promotion.gr
                            </a>
                          </div>
                          <div className="flex items-center space-x-3">
                            <FiPhone className="w-4 h-4 text-gray-400" />
                            <a href="tel:+302102207424" className="text-sm text-gray-600 hover:text-orange-500">
                              +30 210 220 7424
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Desktop Category Menu - always visible */}
          <div className={`hidden lg:flex ${isScrolled ? 'justify-between px-10' : 'justify-center'} py-3 space-x-9 leading-[50px] text-[14px] font-bold text-gray-800 inter-style`}>
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
                      {activeCategory?.id === link.id && modalPosition && (
                        <div
                          className="fixed left-0 right-0"
                          style={{ top: isScrolled ? '120px' : '142px' }}
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
});

export default Navbar;
