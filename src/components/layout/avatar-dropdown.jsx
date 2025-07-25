'use client';

import React from 'react';
import Link from 'next/link';
import { FiUser, FiPackage, FiTruck, FiMapPin, FiSettings, FiHeart, FiLogOut } from 'react-icons/fi';

const AvatarDropdown = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    const menuItems = [
        {
            title: 'Control panel',
            icon: <FiSettings className="w-5 h-5" />,
            href: '/control-panel'
        },
        {
            title: 'Orders',
            icon: <FiPackage className="w-5 h-5" />,
            href: '/orders'
        },
        {
            title: 'Transshipments',
            icon: <FiTruck className="w-5 h-5" />,
            href: '/transshipments'
        },
        {
            title: 'Addresses',
            icon: <FiMapPin className="w-5 h-5" />,
            href: '/addresses'
        },
        {
            title: 'Account details',
            icon: <FiUser className="w-5 h-5" />,
            href: '/account'
        },
        {
            title: 'Wishlist',
            icon: <FiHeart className="w-5 h-5" />,
            href: '/wishlist'
        },
        {
            title: 'Logout',
            icon: <FiLogOut className="w-5 h-5" />,
            href: '/logout',
            className: 'text-red-500 hover:text-red-600'
        }
    ];

    return (
        <div
            className="absolute top-full right-0  w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
            onMouseEnter={(e) => e.stopPropagation()}
        >
            {menuItems.map((item, index) => (
                <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 ${item.className || ''}`}
                    onClick={(e) => {
                        if (item.href === '/logout') {
                            e.preventDefault();
                            // Handle logout logic here
                            onClose();
                        }
                    }}
                >
                    <span className="text-gray-400">{item.icon}</span>
                    <span className="ml-3">{item.title}</span>
                </Link>
            ))}
        </div>
    );
};

export default AvatarDropdown; 