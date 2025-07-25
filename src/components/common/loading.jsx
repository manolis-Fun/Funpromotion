import React from 'react'

const loading = () => {
  return (
    
      <section>
           <div className="max-w-7xl mx-auto px-4 py-16 mt-[200px]">
            <div className="flex flex-col items-start mb-6">
                <div className="flex items-center w-full">
                    <div className="h-12 w-48 bg-gray-200 animate-pulse rounded"></div>
                    <div className="ml-4 border-t border-dashed border-gray-300 w-full"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="aspect-w-1 aspect-h-1 bg-gray-200 animate-pulse"></div>
                        <div className="p-4">
                            <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>
                            <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-4"></div>
                            <div className="flex justify-between items-center">
                                <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                                <div className="h-10 w-28 bg-gray-200 animate-pulse rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
  )
}

export default loading