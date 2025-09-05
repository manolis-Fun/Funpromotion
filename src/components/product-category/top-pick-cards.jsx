import React from 'react'
import { ProductCard } from './ProductGridWithColorFilter'

const TopPickCards = ({data}) => {
  return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {data?.map((product, index) => (
              <ProductCard key={index} product={product} />
          ))}
    </div>
  )
}

export default TopPickCards
