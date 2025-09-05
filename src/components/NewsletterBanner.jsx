export default function NewsletterBanner() {
    return (
        <section className="relative bg-[#28A9D1] text-white overflow-hidden">
            {/* Top wave SVG */}
            <svg
                className="absolute top-0 left-0 w-full"
                viewBox="0 0 1440 120"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                <path
                    d="M0,0 C360,80 1080,80 1440,0 L1440,0 L0,0 Z"
                    fill="#f8f8f8"
                />
            </svg>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 mt-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-4 manrope-font">
                        NEWSLETTER
                        <div className="flex items-center gap-1">
                            <span className="w-28 h-px bg-white" />
                            <span className="w-10 h-px border-t border-dashed border-white" />
                        </div>
                    </h2>
                </div>

                <p className="mt-4 text-sm md:text-base text-white max-w-lg inter-style">
                    Subscribe to our list and be the first to know about our current offers.
                </p>
            </div>
        </section>
    );
} 