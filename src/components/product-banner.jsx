"use client";
import React from "react";
import { NoteBook } from "../icons/note-book";
import { Texture } from "../icons/texture";
import { Rotation } from "../icons/rotation";

const tabs = [
  { id: 1, name: "Προδιαγραφές", icon: <NoteBook /> },
  { id: 2, name: "Τεχνικές", icon: <Texture /> },
  { id: 3, name: "Responibility", icon: <Rotation /> },
];

const ProductBanner = ({ product }) => {
  return (
    <section className="relative z-10 bg-gradient-to-br from-[#6A34BC] to-[#723FBF] py-[300px] px-4 sm:px-6 lg:px-8 text-white overflow-hidden">
      {/* Background image */}
      <div style={{ backgroundImage: "url(/images/bg-about.png)" }} className="absolute top-0 left-0 w-full h-full"></div>

      {/* Top wave */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[calc(100%+1.3px)] h-[130px] overflow-hidden leading-[0]">
        <svg viewBox="0 0 1920 80" preserveAspectRatio="none" className="block w-full h-full fill-[#f8f8f8] [transform:scaleX(-1)]">
          <path d="M1920,60s-169.5,20-510,20S850.5,20,510,20,0,60,0,60V0H1920Z" />
        </svg>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[calc(100%+1.3px)] h-[130px] overflow-hidden leading-[0] rotate-180">
        <svg viewBox="0 0 1920 80" preserveAspectRatio="none" className="block w-full h-full fill-[#f8f8f8] [transform:scaleX(-1)]">
          <path d="M1920,60s-169.5,20-510,20S850.5,20,510,20,0,60,0,60V0H1920Z" />
        </svg>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto flex gap-12 items-start">
        <div className="w-[30%]">
          {tabs.map((tab) => (
            <div key={tab.id} className="flex items-center gap-2 mb-5 group">
              <div className="px-5 py-[22px] rounded-lg bg-[#EEEEEE] hover:bg-[#C59BE8] transition-colors duration-200">
                <div className="text-[#757575] group-hover:text-white transition-colors duration-200">
                  {tab.icon}
                </div>
              </div>
              <div > <p className="text-[#EEEEEE] text-sm font-semibold">{tab.name}</p> </div>
            </div>
          ))}
        </div>

        <div className="w-[70%]">
          <div className="flex justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-8">GENERALLY</h2>
            <div className="flex gap-4 mb-6">
              <h3 className="text-lg font-semibold">Dimensions: </h3>
              <p> 07X25.5 CM</p>
            </div>
            <div className="flex gap-4 mb-6">
              <h3 className="text-lg font-semibold">Net weight: </h3>
              <p>0.264 GR</p>
            </div>
            <div className="flex gap-4 mb-6">
              <h3 className="text-lg font-semibold">Gross weight: </h3>
              <p> 0.324 KG</p>
            </div>
            <div className="flex gap-4 mb-6">
              <h3 className="text-lg font-semibold">Material:</h3>
              <p>Stainless steel</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-8">PACKAGING BOX</h2>
            <div className="flex gap-4 mb-6">
              <h3 className="text-lg font-semibold">Dimensions: </h3>
              <p> 6 X 46 X 28 CM</p>
            </div>
            <div className="flex gap-4 mb-6">
              <h3 className="text-lg font-semibold">Weight</h3>
              <p> 9617 0000</p>
            </div>
            <div className="flex gap-4 mb-6">
              <h3 className="text-lg font-semibold">Volume</h3>
              <p> 0.098 M3</p>
            </div>
            <div className="flex gap-4 mb-6">
              <h3 className="text-lg font-semibold" >Pieces contained in the box:</h3>
              <p> 60</p>
            </div>
          </div>
          </div>
          {/* Product Description */}
        <div className="">
                <div className=" ">
                    <nav className="flex">
                        <button className="py-2 px-1 text-2xl font-bold text-white">
                            Description
                        </button>
                    </nav>
                </div>
                <div className="mt-1 ml-2">
                    {product?.description ? (
                        <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    ) : (
                        <div className="text-white">
                            <p>No description available for this product.</p>
                        </div>
                    )}
                </div>
            </div>
        </div> 
      </div>
    </section>
  );
};

export default ProductBanner;
