'use client'
import React from "react";
import "./topBannerLogo.css";
import Link from "next/link";
import { ArrowBack } from "@/icons/arrow-back";
import Navbar from "@/components/layout/navbar";
const ctaData = [
    {
        title: "Wireless Charging",
        url: "",
    },
    {
        title: "Wired Charging",
        url: "",
    },
    {
        title: "Solar Charging",
        url: "",
    },
    {
        title: "Ecological",
        url: "",
    },
];

const TopBannerLogo = () => (
    <div className="top-banner-logo overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full z-10">
            <Navbar />
        </div>
        <div className='pt-40'>
            <div className="max-w-[1370px] mx-auto px-4 flex flex-col items-center justify-center pt-12 pb-8">
                <img src="/images/menu-usb.png" alt="logo" className="w-11 h-11 text-white" />
                <div className=" text-left bg-opacity-40 rounded">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Link href="/">
                            <ArrowBack />{" "}
                        </Link>{" "}
                        <h2 className="text-4xl font-bold text-white text-center">Promotional power banks with Logo</h2>
                    </div>
                    <div className="mb-6 text-center">
                        <p className="text-white inline-flex text-sm line-clamp-2">
                            {`You are facing the familiar problem: The battery of your mobile phone, laptop or tablet is on the verge of exhaustion and there is no outlet nearby. In such moments, the types of technology, power banks emerge as the real saviors. And who will ... `}
                        </p>
                        <button className=" text-white font-medium ">+ Read more</button>
                    </div>

                    <div className="flex  items-center justify-around gap-4">
                        {ctaData.map((item, index) => (
                            <button key={index} className=" text-white text-sm px-6 py-2 rounded font-semibold">
                                {item.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default TopBannerLogo;
