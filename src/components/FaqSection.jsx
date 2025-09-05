"use client";

import { faqs } from '@/utils/data';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function FaqSection() {
  
    const [openIndex, setOpenIndex] = useState(0);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    return (
        <div className="bg-[#f8f8f8] py-12 px-4 ">
            <div className="max-w-3xl mx-auto  mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
                    Frequently asked questions
                    <span className="flex-grow border-t border-gray-700 border-dashed ml-4"></span>
                </h2>
            </div>

            <div className="max-w-7xl mx-auto space-y-4">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-sm border border-gray-200"
                    >
                        <button
                            onClick={() => toggle(index)}
                            className="w-full flex justify-between items-center px-6 py-4 text-left text-gray-900 font-medium text-lg"
                        >
                            {faq.question}
                            <FiChevronDown
                                className={`text-orange-500 transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        {openIndex === index && (
                            <div className="px-6 pb-4 text-gray-600 text-sm">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 