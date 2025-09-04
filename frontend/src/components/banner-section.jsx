import { BannerSectionData } from "@/utils/data";
import Link from "next/link";
import React from "react";

const BannerSection = () => {
    return (
        <section className="bg-[#f8f8f8]">
            <div className="max-w-7xl flex mx-auto gap-4 py-16 ">
                <div className="flex flex-col w-[60%] gap-4">
                    <div className="flex gap-4">
                        {BannerSectionData.slice(0, 2).map((item, index) => (
                            <Link href={item.link} key={index} className={`${index === 0 ? "w-[45%]" : "w-[55%]"} group relative w-full h-[287px] overflow-hidden rounded-lg`}>
                                <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition" />
                                <div
                                    className={`absolute ${
                                        index === 1 ? "top-10 text-white" : "bottom-10 text-[#494949]"
                                    } left-10 flex items-center justify-center  text-[32px] font-bold text-start whitespace-pre-wrap px-2`}
                                >
                                    {item.title}
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        {BannerSectionData.slice(3, 5).map((item, index) => (
                            <Link href={item.link} key={index} className={`group relative ${index === 0 ? "w-[70%]" : "w-[30%]"} h-[358px] overflow-hidden rounded-lg`}>
                                <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition" />
                                <div
                                    className={`absolute ${
                                        index === 0 ? "bottom-1/3 left-2 rotate-[270deg] text-white" : "bottom-10 left-2 text-start text-[#808080]"
                                    }  flex items-center justify-center  text-[32px] font-bold text-start whitespace-pre-wrap px-2`}
                                >
                                    {item.title}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="w-[40%] flex flex-col gap-4">
                    <Link href={BannerSectionData[2].link} className="group relative w-full h-[387px] overflow-hidden rounded-lg">
                        <img src={BannerSectionData[2].src} alt={BannerSectionData[2].title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition" />
                        <div className="absolute bottom-1/3 left-2 rotate-[270deg] flex items-center justify-center text-white text-[32px] font-bold text-start whitespace-pre-wrap px-2">
                            {BannerSectionData[2].title}
                        </div>
                    </Link>

                    <div className="flex gap-4">
                        {BannerSectionData.slice(5, 7).map((item, index) => (
                            <Link href={item.link} key={index} className={`group relative ${index === 0 ? "w-[45%]" : "w-[55%]"} h-[257px] overflow-hidden rounded-lg`}>
                                <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition" />
                                <div
                                    className={`absolute ${
                                        index === 0 ? "top-10 left-4 text-black/60"  : "bottom-10 right-4 text-end text-[#808080]"
                                    }  flex items-center justify-center text-[32px] font-bold text-start whitespace-pre-wrap px-2`}
                                >
                                    {item.title}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BannerSection;
