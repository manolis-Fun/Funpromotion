"use client";
import React, { useState, memo } from "react";

const techniqueData = [
  [
    {
      id: "L0",
      title: "Engraving",
      image: "https://p2p2k2n4.delivery.rocketcdn.me/wp-content/uploads/2023/09/single-product-tabs-accordion-1.svg",
      description:
        "The laser engraving technique offers precision and detail. This method is perfect for metal objects, wood - Bamboo and glass, providing a unique and distinctive look that highlights the product's inner color. making it ideal for corporate promotional gifts."
    },
    {
      id: "L1",
      title: "Rotogravure",
      image: "https://p2p2k2n4.delivery.rocketcdn.me/wp-content/uploads/2023/09/single-product-tabs-accordion-2.svg",
      description:
        "Gravure printing is a process that creates an elegant and distinctive embossed design on a variety of materials. This method is ideal for leather, paper and fabrics, offering an elegant and luxurious aesthetic to corporate gifts."
    },
    {
      id: "L2",
      title: "Digital printing",
      image: "https://p2p2k2n4.delivery.rocketcdn.me/wp-content/uploads/2023/09/single-product-tabs-accordion-3.svg",
      description:
        "Digital printing offers flexibility and fast delivery, making it ideal for colorful and demanding artwork regardless of quantity. It offers vibrant colors and high print quality, suitable for a variety of materials."
    }
  ],
  [
    {
      id: "R0",
      title: "Silkscreen printing",
      image: "https://p2p2k2n4.delivery.rocketcdn.me/wp-content/uploads/2023/09/single-product-tabs-accordion-4.svg",
      description:
        "Screen printing is ideal for applying designs and logos to any surface and various materials. This method ensures vibrant and lasting results with great accuracy in your pantone colors, ideal for corporate promotion."
    },
    {
      id: "R1",
      title: "Embroidery",
      image: "https://p2p2k2n4.delivery.rocketcdn.me/wp-content/uploads/2023/09/single-product-tabs-accordion-5.svg",
      description:
        "Embroidery adds a sense of luxury and durability to corporate gifts. Ideal for clothing and fabrics, embroidery is the perfect choice to create an impressive and professional look."
    },
    {
      id: "R2",
      title: "Thermoprinting",
      image: "https://p2p2k2n4.delivery.rocketcdn.me/wp-content/uploads/2023/09/single-product-tabs-accordion-6.svg",
      description:
        "Hot stamping is a printing process where heat is used to transfer metallic or colored foil to a surface. Ideal for leather, paper and plastic, hot stamping creates a shiny and striking appearance, perfect for adding a luxurious touch."
    }
  ]
];

// CSS-only accordion. No layout effects. No reflow thrash.
const AccordionItem = memo(function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left flex items-center justify-between rounded-lg transition-colors duration-200"
      >
        <div className="flex items-center gap-4">
          <div className="w-[70px] h-[70px] rounded-lg flex items-center justify-center">
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              draggable={false}
              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <span className={`font-semibold text-lg ${isOpen ? "text-white" : "text-white/70"}`}>
            {item.title}
          </span>
        </div>

        <svg
          className={`w-6 h-6 text-white transition-transform duration-200 ${isOpen ? "rotate-45" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* max-h trick for smooth open/close without JS measuring */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          isOpen ? "max-h-[320px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-2">
          <p className="text-white text-opacity-90 leading-relaxed text-sm">{item.description}</p>
        </div>
      </div>
    </div>
  );
});

const TechniqueAccordion = () => {
  // separate state per column so they never step on each other
  const [openLeftId, setOpenLeftId] = useState(null);
  const [openRightId, setOpenRightId] = useState(null);

  const toggleLeft = id => setOpenLeftId(prev => (prev === id ? null : id));
  const toggleRight = id => setOpenRightId(prev => (prev === id ? null : id));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
      <div>
        {techniqueData[0].map(item => (
          <AccordionItem
            key={item.id}
            item={item}
            isOpen={openLeftId === item.id}
            onToggle={() => toggleLeft(item.id)}
          />
        ))}
      </div>

      <div>
        {techniqueData[1].map(item => (
          <AccordionItem
            key={item.id}
            item={item}
            isOpen={openRightId === item.id}
            onToggle={() => toggleRight(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TechniqueAccordion;
