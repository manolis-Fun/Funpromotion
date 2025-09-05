"use client";

import { useState } from "react";

const AboutFunPromotion = () => {
  const [readMore, setReadMore] = useState(false);

  return (
    <section className="relative z-10 bg-gradient-to-br from-[#6A34BC] to-[#723FBF] py-[300px] px-4 sm:px-6 lg:px-8 text-white overflow-hidden">
      {/* Background image */}
      <div
        style={{ backgroundImage: "url(/images/bg-about.png)" }}
        className="absolute top-0 left-0 w-full h-full"
      ></div>

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

      <div className="relative z-20 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
        {/* Left content */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-2 manrope-font">About Funpromotion</h2>

          <p className="inter-style">
            Since 2005, Fun Promotion has specialized in wholesale promotional gifts and printing services, serving customers throughout Greece, Cyprus and Thessaloniki.
          </p>
          <p className="inter-style">Certified with ISO 9001/2008, we prioritize quality and customer satisfaction.</p>
          <p className="inter-style">
            We provide personalized, high-quality advertising solutions that enhance your corporate image, helping your business stand out in every collaboration.
          </p>
          <p className="inter-style">
            With many years of experience in the field of promotional gifts and more than 2,000 original promotional items with personality, you will definitely find what your business
            needs. We guarantee complete innovative and inventive ideas and suggestions.
          </p>

          <p className="inter-style">
            Stand out with original <strong>Promotional Gifts</strong>!{" "}
            <a href="/product-category/power-banks/" target="_blank" className="font-bold">
              Power Banks
            </a>{" "}
            –{" "}
            <a href="/product-category/usb-memory-flash/" target="_blank" className="font-bold">
              Promotional USB
            </a>{" "}
            –{" "}
            <a href="/product-category/technology-accessories/diafimistikoi-fortistes-kiniton/asirmatoi-fortistes-kiniton/" target="_blank" className="font-bold">
              Wireless Chargers
            </a>{" "}
            –{" "}
            <a href="/product-category/bags-amp-amp-trave/" target="_blank" className="font-bold">
              Promotional Bags
            </a>{" "}
            and many new ideas.
          </p>

          {/* Read More section */}
          {readMore && (
            <div className="space-y-4 inter-style">
              <p>
                With many years of experience in the field of promotional gifts and more than 2,000 original promotional items with personality, you will definitely find what your business
                needs.
              </p>
              <p>Discover Corporate Promotional Gifts for every available budget. From affordable giveaways to exclusive corporate presents, we cover all your needs.</p>
              <p>Our original products enhance your corporate image using high-quality printing. We can print your logo on any gift imaginable—just share your idea with us!</p>
              <p>Browse our website and find thousands of unique products to reward your customers—delivered fast throughout Greece and Cyprus.</p>
            </div>
          )}

          {/* Toggle button at bottom */}
          <button
            onClick={() => setReadMore(!readMore)}
            className=" text-white bg-[#444444] hover:bg-[#FF7700] px-2 py-1 rounded-md transition-all duration-300"
          >
            {readMore ? "Read less" : "Read more"}
          </button>
        </div>

        {/* Right card (static) */}
        <div className="lg:w- relative flex justify-center items-center">
          {/* orange offset */}
          <div className="absolute top-[-20px] right-[-20px] w-full h-full bg-[#FF7A00] "></div>

          {/* white panel */}
          <div className="relative bg-white shadow-lg p-8 w-full h-[575px]">
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-200 text-gray-800 w-full h-full">
      {[
        {
          src: "remote-working-blue-1.svg",
          alt: "Remote",
          text: "Bring remote\ncolleagues together",
        },
        {
          src: "award_3395949new.svg",
          alt: "Reward",
          text: "Reward\nyour best customers",
        },
        {
          src: "brotherhood_blue.svg",
          alt: "Impression",
          text: "Create\nunforgettable \nimpressions",
        },
        {
          src: "workplace-culture_blue.svg",
          alt: "Culture",
          text: "Strengthen\ncorporate culture",
        },
      ].map((item, idx) => (
        <div key={idx} className="p-6 flex flex-col items-center text-center">
          <img
            src={`https://funpromotion.gr/wp-content/uploads/2024/07/${item.src}`}
            alt={item.alt}
            className="w-16 h-16 mb-4"
          />
          <p className="font-bold whitespace-pre-line text-[#7B7B7B]">{item.text}</p>
        </div>
      ))}
    </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutFunPromotion;
