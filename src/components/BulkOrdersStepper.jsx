"use client";

import { useState } from "react";
import HeadingBar from "./common/heading-bar";

const steps = [
    {
        date: "18 APR",
        title: "Eco-friendly business gifts are the perfect choice…",
        description: "Ecological business gifts have the positive aspect that, in addition to promoting your company, they also care for the environment as they are made...",
        products: ["NATURAL", "LARGE LOAD"],
        image: "https://react.woth.gr/wp-content/uploads/2024/05/3-Simple-Steps-to-an-Eco-Friendly-Workplace.jpg",
        overlayText: "Eco-friendly business gifts are the perfect choice for your promotion!",
        overlayGradient: "linear-gradient(to top, rgba(106, 52, 188, 0.9) 10%, rgba(106, 52, 188, 0.3) 50%, rgba(0, 0, 0, 0) 100%)",
    },
    {
        date: "21 MAY",
        title: "Branded gifts increase visibility",
        description: "Personalized gifts keep your brand top of mind. With each use, customers recall your logo and service.",
        products: ["BRANDED MUGS", "USB DRIVES"],
        image: "https://react.woth.gr/wp-content/uploads/2024/05/mo9727-16-ambiant.jpg",
        overlayText: "Stand out with memorable corporate gifts!",
overlayGradient:"linear-gradient(to top, rgba(255, 119, 0, 0.9) 10%, rgba(255, 119, 0, 0.3) 50%, rgba(0, 0, 0, 0) 100%)"    },
    {
        date: "14 JUN",
        title: "Fast delivery, even for bulk",
        description: "We ensure timely delivery, even for 10,000+ items. Never miss a campaign deadline.",
        products: ["BULK EXPRESS", "LOGO PRINTED"],
        image: "https://react.woth.gr/wp-content/uploads/2024/05/Screenshot_1-1.jpg",
        overlayText: "Fast, reliable delivery for any order size!",
        overlayGradient:"linear-gradient(to top, rgba(0, 102, 177, 0.9) 10%, rgba(0, 102, 177, 0.3) 50%,rgba(0, 0, 0, 0) 100% )"
    },
    {
        date: "30 JUL",
        title: "Tailored solutions for every company",
        description: "No matter the size or industry, our team will help you select the ideal product mix for your goals.",
        products: ["CUSTOM KITS", "EMPLOYEE PACKS"],
        image: "https://react.woth.gr/wp-content/uploads/2024/05/high-angle-woman-having-picnic_23-2148523407.jpg",
        overlayText: "Customized packages made just for your team!",
        overlayGradient:"linear-gradient( to top,rgba(197, 70, 71, 0.9) 10%, rgba(197, 70, 71, 0.3) 50%, rgba(0, 0, 0, 0) 100%)"
    },
];

const NumberImages = [
    {
        img: "https://funpromotion.gr/wp-content/uploads/2024/07/post_slider-n1-before.png",
        activeImage: "https://funpromotion.gr/wp-content/uploads/2024/07/post_slider-n1.png",
        alt: "number 1",
        color: "#7343BB",
    },
    {
        img: "https://funpromotion.gr/wp-content/uploads/2024/07/post_slider-n2-before.png",
        activeImage: "https://funpromotion.gr/wp-content/uploads/2024/07/post_slider-n2.png",
        alt: "number 2",
        color: "#F67C22",
    },
    {
        img: "https://funpromotion.gr/wp-content/uploads/2024/07/post_slider-n3-before.png",
        activeImage: "https://funpromotion.gr/wp-content/uploads/2024/07/post_slider-n3.png",
        alt: "number 3",
        color: "#206FAF",
    },
    {
        img: "https://funpromotion.gr/wp-content/uploads/2024/07/post_slider-n4-before.png",
        activeImage: "https://funpromotion.gr/wp-content/uploads/2024/07/post_slider-n4.png",
        alt: "number 4",
        color: "#C55454",
    },
];
export default function BulkOrdersStepper() {
    const [active, setActive] = useState(0);

    const step = steps[active];
    const headerData = {
        title: "Bulk corporate orders",
        description:
            "Our organized process ensures that whether you need 10 or 10,000 gifts for your business, you will receive a perfect result with timely delivery. Ordering corporate gifts in wholesale quantities has never been easier!",
        line: true,
        fullWidth: true,
    };
    return (
        <section className="bg-[#f8f8f8] py-12 px-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto text-left mb-8">
                <HeadingBar data={headerData} />
            </div>

            {/* Card Section */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 inter-style">
                {/* Left content */}
                <div className="flex flex-col gap-4 border-l-2 border-[#7D4CC1] pl-4 w-full lg:w-[32%]">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-[12px] leading-[12px] inter-font font-semibold">
                        <span className="text-gray-800 bg-white rounded px-3 py-2 shadow-md">{step.date}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[20px] leading-[28px] font-extrabold manrope-font text-gray-900 mt-10">{step.title}</h3>

                    {/* Description */}
                    <div className="mt-10">
                        <p className="text-[15px] leading-[21px] inter-font text-gray-600    " style={{ display: "ruby", }}>
                            <img className="w-5 h-5 mr-2" src="https://funpromotion.gr/wp-content/uploads/2023/11/text-icon-posts.png" />
                            {step.description}
                        </p>
                    </div>

                    {/* Products */}
                    <div className="mt-10">
                        <div>
                            {/* <Image src={'https://funpromotion.gr/wp-content/uploads/2023/11/text-icon-posts.png'} alt={step.title} width={100} height={100} /> */}
                            <p className="text-[16px] leading-[24px] inter-font font-semibold mb-1 flex items-center gap-1">
                                <img className="w-5 h-5" src="https://funpromotion.gr/wp-content/uploads/2023/11/products-icon-posts.png" alt="" />
                                
                                Products</p>
                        </div>
                        {step.products.map((prod, i) => (
                            <p key={i} className="text-xs text-[#7D4CC1] font-semibold uppercase">
                                {prod}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Right image card */}
                <div className="relative rounded-xl overflow-hidden shadow-md w-full lg:w-[68%] h-[400px]">
                    <img src={step.image} alt="preview" className="w-full h-full object-cover" />
                    <div className={`absolute inset-0  flex items-end p-6`} style={{ background: step.overlayGradient }}>
                        <p className="text-white font-bold text-[22px] leading-[35px] inter-font">{step.overlayText}</p>
                    </div>
                </div>
            </div>

            {/* Step Numbers */}
            <div className="max-w-7xl mx-auto mt-10 pt-6 flex justify-around gap-10 border-t border-[#eee] relative">
                {NumberImages.map((num, i) => (
                    <div key={i} className="relative flex flex-col items-center" style={{ flex: 1 }}>
                        {/* Colored indicator bar */}
                        {active === i && (
                            <span
                                className="absolute -top-6 left-1/2 -translate-x-1/2"
                                style={{
                                    width: "290px",
                                    height: "1px",
                                    background: num.color,
                                    borderRadius: "2px",
                                    display: "block",
                                }}
                            />
                        )}
                        <button
                            onClick={() => setActive(i)}
                            className="flex flex-col items-center transition"
                            style={{
                                paddingTop: "8px",
                                background: "none",
                                boxShadow: "none",
                            }}
                        >
                            <img src={active === i ? num.activeImage : num.img} alt={num.alt} className="w-10 h-10" />
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
