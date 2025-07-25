import React from "react";

const HeadingBar = ({ data , containerFull }) => {
    return (
        <section className="bg-[#f8f8f8]">
            <div className={`${!containerFull === true ? 'max-w-7xl mx-auto ' : 'container mx-auto px-4'} pb-10`}>
                <div className="">
                    <h2 className="text-4xl mb-2 tracking-[1px] font-bold  flex items-center gap-4 capitalize">
                        {data?.title} {data?.line === true && <div className="mt-1 bg-[#3f3f3f] h-[3px] w-[300px]"></div>}
                    </h2>
                    <p className={`${data?.fullWidth === true ? 'w-full' : 'max-w-[950px]'} text-gray-600 inter-style text-[14px] leading-[22px]`}>
                        {data?.description}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default HeadingBar;
