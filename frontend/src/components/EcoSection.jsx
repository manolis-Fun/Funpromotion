'use client';


const EcoSection = () => {
  return (
    <section className=" relative w-full py-[200px] pt-[70px] z-[7] bg-[radial-gradient(ellipse_at_top_left,_#4DAF3D_62%,_#6DB262_62%)] overflow-hidden ">
      <div style={{backgroundImage: 'url(/images/home-bg.png)'}} className='absolute top-0 left-0 w-full h-full  bg-center'>

      </div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[calc(100%+1.3px)] h-[130px] overflow-hidden leading-[0]">
        <svg viewBox="0 0 1920 80" preserveAspectRatio="none" className="block w-full h-full fill-[#f8f8f8]">
          <path d="M1920,60s-169.5,20-510,20S850.5,20,510,20,0,60,0,60V0H1920Z"></path>
        </svg>
      </div>


      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-center gap-12 relative z-10">

        <div className="w-full lg:w-1/2 flex justify-center" >
          <img src="https://react.woth.gr/wp-content/uploads/2024/08/home_eco_img_svg.svg" alt="Eco illustration" className="max-w-full h-auto" />
        </div>


        <div className="w-full lg:w-1/2 text-white">
          <h2 className="text-[36px] font-bold mb-6 manrope-font">ECO</h2>
          <p className="text-[14px] leading-[22px] mb-4 inter-style">
            Eco-friendly promotional gifts are the ideal solution for businesses that want to stand out and promote their eco-consciousness and culture. With products made from sustainable materials, you can offer your customers something unique and environmentally friendly.


          </p>
          <p className="text-[14px] leading-[22px] inter-style">
            For example, eco-friendly recyclable bags with your logo and even reusable water bottles printed with the names of your colleagues. Eco-friendly promotional gifts help you show that you care about the planet and create positive impressions. Choose smartly and contribute to a greener future!
          </p>
        </div>
      </div>


      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[calc(100%+1.3px)] h-[130px] overflow-hidden leading-[0] z-[-1]">
        <svg viewBox="0 0 1920 80" preserveAspectRatio="none" className="block w-full h-full fill-[#f8f8f8] rotate-180">
          <path d="M1920,60s-169.5,20-510,20S850.5,20,510,20,0,60,0,60V0H1920Z"></path>
        </svg>
      </div>

    </section>

  );
};

export default EcoSection;
