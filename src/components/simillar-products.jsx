import React from 'react'
import HeadingBar from './common/heading-bar'
import ProductCard from './common/productCard'
const SimilarProducts = ({ product }) => {
    const data = {
        title: 'Similar Products',
        line: true,
      fullWidth: true,
        
    }
  return (
    <section className='bg-[#f8f8f8]'>
       <div className='py-12 container mx-auto px-4'>
          <HeadingBar data={data} containerFull />
          <ProductCard products={product} />
    </div>
     </section>
  )
}

export default SimilarProducts
