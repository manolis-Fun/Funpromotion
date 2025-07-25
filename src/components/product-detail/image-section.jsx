import React from 'react'
import Image from 'next/image'
const ImageSection = ({ product, selectedImage, setSelectedImage, mainImage, galleryImages }) => {
  return (
    <div>
      <div className="space-y-4">
                    {/* Main Image with Gallery Overlay */}
                    <div className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <Image
                                src={selectedImage}
                                alt={product.title}
                                width={600}
                                height={600}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Gallery Images - Overlay in top-left corner */}
                        <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
                            {/* Main Product Image Thumbnail */}
                            <button
                                onClick={() => setSelectedImage(mainImage)}
                                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shadow-lg ${selectedImage === mainImage
                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                    : 'border-white hover:border-gray-300'
                                    }`}
                            >
                                <Image
                                    src={mainImage}
                                    alt={product.title}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            </button>

                            {/* Gallery Images */}
                            {galleryImages.filter(image => image !== mainImage).map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(image)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shadow-lg ${selectedImage === image
                                        ? 'border-blue-500 ring-2 ring-blue-200'
                                        : 'border-white hover:border-gray-300'
                                        }`}
                                >
                                    <Image
                                        src={image}
                                        alt={`${product.title} ${index + 1}`}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* More Colors Section - Moved here under the main image area */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-6">More Colors</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {/* Mock additional color variants */}
                            {galleryImages.slice(0, 6).map((image, index) => (
                                <div key={index} className="group cursor-pointer">
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group-hover:border-orange-500 transition-colors">
                                        <Image
                                            src={image}
                                            alt={`${product.title} color variant ${index + 1}`}
                                            width={200}
                                            height={200}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
    </div>
  )
}

export default ImageSection
