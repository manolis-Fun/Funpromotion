import React from 'react';
import ProductCard from './common/productCard';
import HeadingBar from './common/heading-bar';

export default function LatestProducts({ products = [] }) {
    const headingBarData = {
        title: 'Promotional and corporate gifts for your business',
        description: 'Choose from a wide range of original promotional and corporate gifts for businesses of all sizes. Corporate gifts can be customized with your company logo, ensuring your brand stands out.',
        line: false,
        fullWidth: true,
    }
    return (
        <div className="bg-[#f8f8f8] py-12 px-4">
            <div className='max-w-7xl mx-auto'>
           <HeadingBar data={headingBarData} />
            <ProductCard products={products} />
         </div>
        </div>
    );
} 