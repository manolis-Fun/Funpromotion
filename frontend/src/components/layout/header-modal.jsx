'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { menuSections } from '@/utils/data';

const NavModal = ({ category, isVisible, onClose, position, isScrolled }) => {
    if (!isVisible) return null;

    const currentSection = menuSections.find(section => section.id === category?.id);
    if (!currentSection) return null;

    return (
        <div
            className={`max-w-[800px] w-full absolute ${isScrolled ? '-top-[25px]' : 'top-[100px]'} bg-white rounded-lg border shadow-lg shadow-black z-50`}
            style={{
                left: `${position?.x}px`,
                transform: `translateX(-50%)`,
            }}
        >
            <div className="px-12 py-8 relative">
                {/* Arrow indicator at the top */}
                <div className="absolute -top-6 rotate-180 left-1/2 transform -translate-x-1/2">
                    {/* <div className="w-6 h-6 bg-white rounded-sm rotate-45 shadow-lg">
                    </div> */}
                    <img src="/images/arrowDown_filled.png" alt="arrow" className='w-full h-full' />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                    {currentSection.items.map((item, index) => (
                        <Link
                            href={item.href}
                            key={index}
                            className="group flex flex-col items-start space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            <div className="w-12 h-12 relative mb-3">
                                <Image
                                    src={`https://react.woth.gr${item.icon}`}
                                    alt={item.title}
                                    width={48}
                                    height={48}
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <h3 className="text-gray-900 font-medium group-hover:text-[#FF6600] text-base">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {item.subtitle}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NavModal; 