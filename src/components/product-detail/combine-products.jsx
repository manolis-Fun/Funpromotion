import React from 'react'
import HeadingBar from '../common/heading-bar'

export default function CombineProducts() {
  const data = {
    title: 'Combine it with...',
    line: false,
    fullWidth: true,

  }
  const products = [
    { id: 1, name: 'Hip-hop', price: '3.09€', image: '/images/imageWithoutBg.png' },
    { id: 2, name: 'Namib flask', price: '4.50€', image: '/images/imageWithoutBg.png' },
    { id: 3, name: 'Slimmy Flask', price: '2.99€', image: '/images/imageWithoutBg.png' }
  ]
  return (
    <section className='max-w-[1370px] mx-auto px-4 py-12'>
      <HeadingBar data={data} containerFull />
      <div className='flex gap-6 px-4 flex-wrap'>
        {products.map((product) => (
          <div key={product.id} className='border-[1px] shadow-md   flex bg-[#EAEAEA] rounded-lg p-4 gap-1 items-center w-full lg:w-fit'>
            <div className='w-[100px] h-[100px] bg-[#EAEAEA] flex items-center justify-center rounded'>
              <img
                src={product.image}
                className='max-w-full max-h-full object-contain'
                alt={product.name}
              />
            </div>
            <div className='flex flex-col'>
              <span className='text-center text-2xl font-semibold text-gray-600 mb-2 whitespace-nowrap'>
                {product.name}
              </span>
              <span className='text-xl font-bold text-orange-500'>{product.price}</span>
            </div>
          </div>
        ))}

      </div>
    </section>
  )
}
