"use client";
import React, { useState } from "react";
import { NoteBook } from "../icons/note-book";
import { Texture } from "../icons/texture";
import { Rotation } from "../icons/rotation";
import TechniqueAccordion from "./TechniqueAccordion";

const tabs = [
  { id: 1, name: "Description", icon: <NoteBook /> },
  { id: 2, name: "Specification", icon: <Texture /> },
  { id: 3, name: "Technique", icon: <Rotation /> }
];

const ProductBanner = ({ product }) => {
  const [activeTab, setActiveTab] = useState(2);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTabChange = (tabId) => {
    if (tabId !== activeTab) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveTab(tabId);
        setIsAnimating(false);
      }, 150);
    }
  };

  return (
    <section
      className="
        relative z-10 text-white overflow-hidden mt-10
        bg-gradient-to-br from-[#6A34BC] to-[#723FBF]
        px-4 pt-16 pb-24
        sm:px-6
        lg:px-8 lg:py-[300px] lg:mt-20
        min-h-[640px] lg:min-h-[1180px]
      "
    >
      {/* Background image */}
      <div
        style={{ backgroundImage: 'url(/images/bg-about.png)' }}
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20 lg:opacity-100"
      />

      {/* Top wave */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[105%] h-[60px] overflow-hidden leading-[0] lg:h-[130px]">
        <svg viewBox="0 0 1920 80" preserveAspectRatio="none" className="block w-full h-full fill-[#f8f8f8] [transform:scaleX(-1)]">
          <path d="M1920,60s-169.5,20-510,20S850.5,20,510,20,0,60,0,60V0H1920Z" />
        </svg>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[105%] h-[60px] overflow-hidden leading-[0] rotate-180 lg:h-[130px]">
        <svg viewBox="0 0 1920 80" preserveAspectRatio="none" className="block w-full h-full fill-[#f8f8f8] [transform:scaleX(-1)]">
          <path d="M1920,60s-169.5,20-510,20S850.5,20,510,20,0,60,0,60V0H1920Z" />
        </svg>
      </div>

      <div
        className="
          relative z-20 max-w-7xl mx-auto
          flex flex-col gap-6
          lg:flex-row lg:gap-12 lg:items-start
        "
      >
        {/* Tabs */}
        <div className="w-full lg:w-[30%]">
          {/* Mobile: square tiles, horizontal scroll, color-only state */}
          <div className="lg:hidden -mx-4 px-4">
            <div className="flex gap-6 justify-between overflow-x-auto no-scrollbar py-2">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className="flex flex-col items-center shrink-0"
                  >
                    <div
                      className={[
                        "w-[84px] h-[84px] rounded-2xl flex items-center justify-center",
                        "transition-colors duration-150",
                        active ? "bg-[#C59BE8]" : "bg-white"
                      ].join(" ")}
                    >
                      <span className={active ? "text-white" : "text-[#6B7280]"}>{tab.icon}</span>
                    </div>
                    <span
                      className={[
                        "mt-3 text-sm font-semibold",
                        "transition-colors duration-150",
                        active ? "text-white" : "text-white/80"
                      ].join(" ")}
                    >
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop: same layout, remove scale and translate so it stops overreacting */}
          <div className="hidden lg:block">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  className="flex items-center gap-2 mb-5 cursor-pointer"
                  onClick={() => handleTabChange(tab.id)}
                >
                  <div
                    className={[
                      "px-5 py-[22px] rounded-lg",
                      "transition-colors duration-150",
                      active ? "bg-[#C59BE8]" : "bg-[#EEEEEE] hover:bg-[#C59BE8]"
                    ].join(" ")}
                  >
                    <div className={active ? "text-white" : "text-[#757575]"}>
                      {tab.icon}
                    </div>
                  </div>
                  <p
                    className={[
                      "text-xl font-semibold",
                      "transition-colors duration-150",
                      active ? "text-white" : "text-[#EEEEEE]"
                    ].join(" ")}
                  >
                    {tab.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="w-full relative lg:w-[70%] min-h-[300px] lg:min-h-[400px]">
          <div className={`transition-opacity duration-150 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
            {/* Description */}
            {activeTab === 1 && (
              <div>
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-8">Description</h2>
                <div className="mt-2 lg:mt-4">
                  {product?.description ? (
                    <div
                      className="prose max-w-none text-white prose-invert prose-p:my-2"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  ) : (
                    <div className="text-white">
                      <p>No description available for this product.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specification */}
            {activeTab === 2 && (
              <div>
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-8">Specification</h2>

                <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6">GENERALLY</h3>

                    <div className="flex gap-3 mb-4 lg:gap-4 lg:mb-6">
                      <h4 className="text-base lg:text-lg font-semibold">Dimensions:</h4>
                      <p>07X25.5 CM</p>
                    </div>
                    <div className="flex gap-3 mb-4 lg:gap-4 lg:mb-6">
                      <h4 className="text-base lg:text-lg font-semibold">Net weight:</h4>
                      <p>0.264 GR</p>
                    </div>
                    <div className="flex gap-3 mb-4 lg:gap-4 lg:mb-6">
                      <h4 className="text-base lg:text-lg font-semibold">Gross weight:</h4>
                      <p>0.324 KG</p>
                    </div>
                    <div className="flex gap-3 mb-4 lg:gap-4 lg:mb-6">
                      <h4 className="text-base lg:text-lg font-semibold">Material:</h4>
                      <p>Stainless steel</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6">PACKAGING BOX</h3>

                    <div className="flex gap-3 mb-4 lg:gap-4 lg:mb-6">
                      <h4 className="text-base lg:text-lg font-semibold">Dimensions:</h4>
                      <p>6 X 46 X 28 CM</p>
                    </div>
                    <div className="flex gap-3 mb-4 lg:gap-4 lg:mb-6">
                      <h4 className="text-base lg:text-lg font-semibold">Weight:</h4>
                      <p>9617 0000</p>
                    </div>
                    <div className="flex gap-3 mb-4 lg:gap-4 lg:mb-6">
                      <h4 className="text-base lg:text-lg font-semibold">Volume:</h4>
                      <p>0.098 M3</p>
                    </div>
                    <div className="flex gap-3 mb-4 lg:gap-4 lg:mb-6">
                      <h4 className="text-base lg:text-lg font-semibold">Pieces contained in the box:</h4>
                      <p>60</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Technique */}
            {activeTab === 3 && (
              <div>
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-8">Technique</h2>
                <TechniqueAccordion />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductBanner;
