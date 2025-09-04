'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({
    currentPage = 1,
    totalPages = 1,
    onPageChange
}) => {
    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Add first page
        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => onPageChange(1)}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 hover:text-orange-500"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(
                    <span key="start-ellipsis" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700">
                        ...
                    </span>
                );
            }
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-semibold rounded-lg ${currentPage === i
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-900 hover:text-orange-500'
                        }`}
                >
                    {i}
                </button>
            );
        }

        // Add last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <span key="end-ellipsis" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700">
                        ...
                    </span>
                );
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => onPageChange(totalPages)}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 hover:text-orange-500"
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-x-1 my-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-orange-500 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
            >
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="inline-flex items-center gap-x-1">
                {renderPageNumbers()}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-orange-500 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
            >
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
        </div>
    );
};

export default Pagination; 