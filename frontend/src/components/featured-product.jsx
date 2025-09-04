import React from 'react';
import ProductCard from './common/productCard';
import HeadingBar from './common/heading-bar';

export default function FeaturedProduct({ products = [] }) {
    const headingBarData = {
        title: 'Promotional gifts with your company logo printed on them',
        description: 'Promote your company\'s brand with promotional gifts. With our high-quality printing services, your company logo will take center stage on gifts that are practical, stylish and memorable.',
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