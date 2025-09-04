import React, { useState } from 'react'
import Image from 'next/image'
const ImageSection = ({ product, selectedImage, setSelectedImage, mainImage, galleryImages }) => {
  const [verticalSliderIndex, setVerticalSliderIndex] = useState(0)
  const [horizontalSliderIndex, setHorizontalSliderIndex] = useState(0)
  const [hoveredImage, setHoveredImage] = useState(null)
  
  const allImages = [mainImage, ...galleryImages.filter(image => image !== mainImage)]
  const totalImages = allImages.length
  const verticalImagesPerView = 7
  const horizontalImagesPerView = 6
  
  const canScrollUp = verticalSliderIndex > 0
  const canScrollDown = totalImages > verticalImagesPerView && verticalSliderIndex < totalImages - verticalImagesPerView
  const canScrollLeft = horizontalSliderIndex > 0
  const canScrollRight = galleryImages.length > horizontalImagesPerView && horizontalSliderIndex < galleryImages.length - horizontalImagesPerView
  
  const handleVerticalScroll = (direction) => {
    if (direction === 'up' && canScrollUp) {
      setVerticalSliderIndex(verticalSliderIndex - 1)
    } else if (direction === 'down' && canScrollDown) {
      setVerticalSliderIndex(verticalSliderIndex + 1)
    }
  }
  
  const handleHorizontalScroll = (direction) => {
    if (direction === 'left' && canScrollLeft) {
      setHorizontalSliderIndex(horizontalSliderIndex - 1)
    } else if (direction === 'right' && canScrollRight) {
      setHorizontalSliderIndex(horizontalSliderIndex + 1)
    }
  }
  
  const visibleVerticalImages = allImages.slice(verticalSliderIndex, verticalSliderIndex + verticalImagesPerView)
  const visibleHorizontalImages = galleryImages.slice(horizontalSliderIndex, horizontalSliderIndex + horizontalImagesPerView)
  
  const displayImage = hoveredImage || selectedImage
  
  return (
    <div>
      <div className="space-y-4">
                    {/* Main Image with Gallery Overlay */}
                    <div className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <Image
                                src={displayImage}
                                alt={product.title}
                                width={600}
                                height={600}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Gallery Images - Vertical Slider */}
                        <div className="absolute top-4 left-4 flex flex-col items-center z-10">
                            {/* Up Arrow */}
                            {totalImages > verticalImagesPerView && (
                                <button
                                    onClick={() => handleVerticalScroll('up')}
                                    disabled={!canScrollUp}
                                    className={`mb-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${
                                        canScrollUp 
                                            ? 'hover:bg-gray-100 cursor-pointer' 
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                            )}
                            
                            {/* Images Container */}
                            <div className="flex flex-col space-y-2 overflow-hidden">
                                {visibleVerticalImages.map((image, index) => {
                                    const actualIndex = verticalSliderIndex + index
                                    const isMainImage = actualIndex === 0
                                    return (
                                        <button
                                            key={`vertical-${actualIndex}`}
                                            onClick={() => setSelectedImage(image)}
                                            onMouseEnter={() => setHoveredImage(image)}
                                            onMouseLeave={() => setHoveredImage(null)}
                                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shadow-lg ${
                                                selectedImage === image
                                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                                    : 'border-white hover:border-gray-300'
                                            }`}
                                        >
                                            <Image
                                                src={image}
                                                alt={isMainImage ? product.title : `${product.title} ${actualIndex}`}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    )
                                })}
                            </div>
                            
                            {/* Down Arrow */}
                            {totalImages > verticalImagesPerView && (
                                <button
                                    onClick={() => handleVerticalScroll('down')}
                                    disabled={!canScrollDown}
                                    className={`mt-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${
                                        canScrollDown 
                                            ? 'hover:bg-gray-100 cursor-pointer' 
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* More Colors Section with Horizontal Slider */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-6">More Colors</h2>
                        <div className="relative">
                            {/* Left Arrow */}
                            {galleryImages.length > horizontalImagesPerView && (
                                <button
                                    onClick={() => handleHorizontalScroll('left')}
                                    disabled={!canScrollLeft}
                                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${
                                        canScrollLeft 
                                            ? 'hover:bg-gray-100 cursor-pointer' 
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}
                            
                            {/* Images Grid */}
                            <div className="overflow-hidden">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {visibleHorizontalImages.map((image, index) => (
                                        <div 
                                            key={`horizontal-${horizontalSliderIndex + index}`} 
                                            className="group cursor-pointer"
                                            onClick={() => setSelectedImage(image)}
                                            onMouseEnter={() => setHoveredImage(image)}
                                            onMouseLeave={() => setHoveredImage(null)}
                                        >
                                            <div className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                                                selectedImage === image 
                                                    ? 'border-orange-500 ring-2 ring-orange-200' 
                                                    : 'border-gray-200 group-hover:border-orange-500'
                                            }`}>
                                                <Image
                                                    src={image}
                                                    alt={`${product.title} color variant ${horizontalSliderIndex + index + 1}`}
                                                    width={200}
                                                    height={200}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Right Arrow */}
                            {galleryImages.length > horizontalImagesPerView && (
                                <button
                                    onClick={() => handleHorizontalScroll('right')}
                                    disabled={!canScrollRight}
                                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${
                                        canScrollRight 
                                            ? 'hover:bg-gray-100 cursor-pointer' 
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
    </div>
  )
}

export default ImageSection
