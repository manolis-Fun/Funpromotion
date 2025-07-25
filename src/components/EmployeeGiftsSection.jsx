"use client";
import Image from "next/image";
import HeadingBar from "./common/heading-bar";

export function EmployeeGiftsSection() {

  const headingBarData = {
        title: "Business gifts for every occasion",
        description:
            "From holidays to employee anniversaries, our collection of promotional corporate gifts ensures you have the ideal choice for every event. Whatever the occasion, we have the right logo gifts to meet your company's needs.",
        line: true,
    };
    return (
        <section className="bg-[#f8f8f8]">
            <HeadingBar data={headingBarData} />
            <div className="relative mt-[80px] pb-[40px] bg-[#F7859C]  overflow-hidden">
                {/* Top sweet wave */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[calc(100%+1.3px)] h-[130px] overflow-hidden leading-[0]">
                    <svg viewBox="0 0 1920 80" preserveAspectRatio="none" className="block w-full h-full fill-[#f8f8f8] [transform:scaleX(-1)]">
                        <path d="M1920,60s-169.5,20-510,20S850.5,20,510,20,0,60,0,60V0H1920Z" />
                    </svg>
                </div>

                {/* Content */}
                <div>
                    <div className="relative z-20 max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-8">
                        {/* text */}
                        <div className="absolute top-[130px] left-[-50px]  flex flex-col p-10 space-y-4 bg-white w-[426px] h-[326px] rounded-lg">
                            <h2 className="text-[32px] font-bold leading-[40px] text-[#FF7700]  ">Employee gifts.</h2>
                            <h3 className="text-[22px] leading-[28px] font-semibold  manrope-font ">Explore a new experience.</h3>
                            <p className="text-[14px] leading-[22px] inter-font ">
                                Create your own welcome kit for your colleagues! Choose from a variety of corporate gifts and personalize your selection with your branding.
                            </p>
                            <a href="/product-category/welcome-kits-for-employees/" className="inline-block bg-black text-white text-sm font-medium px-4 py-2 rounded w-[70px]">
                                More
                            </a>
                        </div>

                        {/* image */}
                        <div className="w-full h-[600px] flex justify-center">
                            <Image src="https://react.woth.gr/wp-content/uploads/2024/08/box-home.webp" alt="Welcome kit box" width={1033} height={650} className="rounded-lg object-cover" priority />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
