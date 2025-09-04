import React from "react";
import Link from "next/link";

const ProductCard = ({ products }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[420px] ">
      {products?.map((product, index) => {
        // Get the proper price from singleProductFields if available
        const displayPrice = product?.singleProductFields?.priceMainSale ||
          product?.singleProductFields?.priceMain ||
          product?.price ||
          'N/A';

        return (
          <Link key={index} href={`/product/${product?.slug}`}>
            <div className="group cursor-pointer bg-[#F9F9F9] rounded-xl border border-gray-200 p-4 flex flex-col text-center hover:shadow transition  z-10 absolute w-[300px]">

              {/* Media: Image (default) and Video (on hover) */}
              <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-white">

                {(product?.stockQuantity === null || product?.stockQuantity === 0) && (
                  <div className="absolute top-2 left-2 capitalize text-black font-bold text-sm border-black border-2 py-2 px-3 rounded-[40px] w-fit bg-white ">
                    Sold Out
                  </div>
                )}
                {product?.image?.sourceUrl ? (
                  <><img
                    src={product?.image?.sourceUrl}
                    alt={product?.name}
                    className="w-full h-full max-w-[259px] max-h-[259px] object-cover group-hover:hidden"

                  />
                    <video
                      className="w-full h-full object-cover absolute top-0 left-0 hidden group-hover:block"
                      src="https://storage.googleapis.com/product_videos/single%20sided%20full%20Colour%20Box1.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                    /></>
                ) : (
                  <div className="w-full h-full bg-white rounded max-w-[259px] max-h-[259px] min-h-[259px] min-w-[259px] group-hover:hidden "></div>
                )}
                <div className="absolute top-2 right-2 transform translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-in-out z-10">
                  <button className="bg-white p-2 rounded-lg shadow-lg hover:scale-110 transition-transform duration-200">
                    <img src="/images/heart.svg" className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h3
                className="text-gray-900 font-semibold mt-8 leading-[26px] justify-start text-lg mb-2 manrope-font"
                style={{ textAlign: "left" }}
              >
                {product?.title?.length > 21
                  ? product?.title.slice(0, 21)
                  : product?.title || product?.name}
              </h3>

              <span className="text-[#FF7700] text-sm py-2 text-start font-semibold h-9">
                {displayPrice}
              </span>

              <div className="hidden group-hover:flex items-center mb-2 font-bold text-gray-500 leading-[18px] text-[13px] manrope-font ">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 manrope-font"></div>
                In stock: ({product?.stockQuantity ? product?.stockQuantity : 0})
              </div>

              <div
                className="text-gray-500 mt text-sm py-2 border-t-[1px] border-gray-200 hidden group-hover:block text-left"
                dangerouslySetInnerHTML={{
                  __html: product?.shortDescription?.replace(/\n$/, "") || "",
                }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductCard;

