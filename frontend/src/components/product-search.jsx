import React from 'react';
import SearchIcon from '@/icons/search-icon';

// components/ProductNotFound.jsx
export default function ProductNotFound() {
  return (
    <section className="bg-[#f8f8f8] py-8">
      <div className="max-w-3xl mx-auto flex items-center px-4">
        {/* icon */}
        <div className="flex-shrink-0">
          <SearchIcon className="h-16 w-16 text-orange-500" />
        </div>

        {/* text */}
        <div className="ml-6">
          <h2 className="text-3xl font-semibold">
            Didn't find the product you wanted?
          </h2>
          <p className="mt-2 text-gray-700">
            We have it! Call us at{' '}
            <a href="tel:+302102207424" className="font-medium text-gray-900">
              210 220 7424
            </a>{' '}
            or email us at{' '}
            <a
              href="mailto:sales@fun-promotion.gr"
              className="font-medium text-gray-900"
            >
              sales@fun-promotion.gr
            </a>
            , and a Fun Expert  will be there to help you.
          </p>
        </div>
      </div>
    </section>
  );
}
