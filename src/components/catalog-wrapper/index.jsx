"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "./catalogWrapper.css";

const SLIDES = [
    {
        link: "https://www.coolcatalogue.eu/np/cool2024/en/#p=I",
        image: "https://funpromotion.gr/wp-content/uploads/2024/07/cat_6.jpg",
    },
    {
        link: "https://www.cataloghi.cloud/ON2024_N_EN_SP/index.html",
        image: "https://funpromotion.gr/wp-content/uploads/2024/07/cat_1.jpg",
    },
    {
        link: "https://view.publitas.com/md-en/24-2_eoy-catalogue_eng-_vr/page/1",
        image: "https://funpromotion.gr/wp-content/uploads/logos/2024/10/md_25_b.jpg",
    },
    {
        link: "https://viewer.xdcollection.com/winter-2024/en/nop/",
        image: "https://funpromotion.gr/wp-content/uploads/logos/2024/10/xd_25_b.jpg",
    },
    {
        link: "https://coolcatalogue.eu/np/yes2024/en/#p=I",
        image: "https://funpromotion.gr/wp-content/uploads/logos/2024/10/yes_b.jpg",
    },
    {
        link: "https://catalog.hideagifts.com/hidea2024/our_nature-h24/np/8ZSQfXdq/?page=1",
        image: "https://funpromotion.gr/wp-content/uploads/2024/07/cat_7.jpg",
    },
    {
        link: "https://viewer.xdcollection.com/main-2024/en/nop/?page=1",
        image: "https://funpromotion.gr/wp-content/uploads/2024/07/cat_2.jpg",
    },
    {
        link: "https://view.publitas.com/md-en/01_24-1-gifts_eng_without-prices_vr/page/1",
        image: "https://funpromotion.gr/wp-content/uploads/2024/07/cat_3.jpg",
    },
    {
        link: "https://www.flipsnack.com/9FA75F58B7A/nonbranded-inspirationguide2024-english/full-view.html",
        image: "https://funpromotion.gr/wp-content/uploads/2024/07/cat_5.jpg",
    },
];

export function CatalogsWrapper() {
    return (
        <section className="relative bg-[#333333] bg-[url('/images/home-Cat-Mask.png')] bg-no-repeat bg-cover pt-[80px] pb-[100px] overflow-hidden">
            {/* Top pink wave */}
            <div className="absolute top-0 left-0 w-full overflow-hidden">
                <svg className="w-full h-[180px]" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path fill="#F7859C" d="M1920,60s-169.5,0-10,20S850.5,400,510,300,0,100,0,60V0H1920Z" />
                </svg>
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-6 flex flex-col-reverse lg:flex-row items-center gap-8">
                {/* Text */}
                <div className="w-full lg:w-1/2 text-white space-y-4">
                    <h2 className="text-[32px] leading-[40px]  font-bold manrope-font ">Catalogs</h2>
                    <p className="text-[14px] leading-[22px] inter-font max-w-[370px]">
                        Browse our diverse catalogs to find sophisticated gift ideas <br /> Discover original ideas and choices that will delight and be appreciated by your associates.
                    </p>
                    <a href="https://react.woth.gr/katalogoi/" className="inline-block bg-white text-black text-[15px]  leading-[22px] font-semibold px-6 py-2 rounded hover:bg-gray-100 transition">
                        View the catalogs
                    </a>
                </div>

                {/* Swiper coverflow */}
                <div className="w-full lg:w-1/2 ">
                    <Swiper
                        className="swiper-container-catalogs"
                        modules={[EffectCoverflow, Navigation]}
                        effect="coverflow"
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView= "auto"
                        initialSlide= {2}
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 100,
                            depth: 150,
                            modifier: 1.5,
                            initialSlide: 3,
                            slideShadows: true
                        }}
                        navigation
                    >
                        {SLIDES.map(({ href, image }, idx) => (
                            <SwiperSlide key={idx} className="swiper-slide-catalogs">
                                <a href={href} target="_blank" rel="noreferrer">
                                    <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden shadow-xl">
                                        <Image src={image} alt="Catalog Image" fill className="object-cover" />
                                    </div>
                                </a>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            {/* Bottom white wave */}
            <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden rotate-180">
            <svg className="w-full h-[180px]" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path fill="#F8F8F8" d="M1920,60s-169.5,0-10,20S850.5,0,40,300,0,100,0,60V0H1920Z" />
                </svg>
            </div>
        </section>
    );
}
