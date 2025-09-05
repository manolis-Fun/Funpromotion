import React from 'react';
import { useForm } from "react-hook-form";
import PhoneIcon from '@/icons/phone-icon';
import EmailIcon from '@/icons/email-icon';
import LocationIcon from '@/icons/location-icon';
import FacebookIcon from '@/icons/facebook-icon';
import InstagramIcon from '@/icons/instagram-icon';
import LinkedInIcon from '@/icons/linkedin-icon';

const InterestModal = ({ isOpen, onClose }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    const onSubmit = (data) => {
        onClose();
        reset();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative">
                <div className="flex h-full bg-white">
                    {/* Left Side - Interest Form */}
                    <div className="w-1/2 p-8 pr-0 bg-white">
                        <h4 className="text-2xl font-bold mb-6 text-gray-800">INTEREST FORM</h4>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                    <input
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^\S+@\S+$/i,
                                                message: "Invalid email"
                                            }
                                        })}
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        {...register("phone")}
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                    <input
                                        {...register("company")}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    {...register("message")}
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                    placeholder="Tell us about your requirements..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-[#333333] text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                            >
                                SHIPMENT
                            </button>
                        </form>
                    </div>

                    {/* Right Side - Communication */}
                    <div className="w-1/2 p-8 m-10 bg-[#333333] text-white rounded-2xl">
                        <h4 className="text-2xl font-bold mb-6 text-white">COMMUNICATION</h4>

                        <p className="text-gray-300 mb-8 leading-relaxed">
                            Do you have any questions about a product? Do not hesitate to contact us via email or at the telephone numbers below.
                        </p>

                        <div className="space-y-6">
                            {/* Phone */}
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                    <PhoneIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <a href="tel:2102207424" className="text-lg hover:text-gray-300 transition-colors">
                                        210 220 7424
                                    </a>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                    <EmailIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <a href="mailto:sales@fun-promotion.gr" className="text-lg hover:text-gray-300 transition-colors">
                                        sales@fun-promotion.gr
                                    </a>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                    <LocationIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-lg">
                                        <p>10 Palestinis,</p>
                                        <p>23 Meandrou Alimos, Acharnes</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="flex items-center space-x-4 pt-4">
                                <div className="flex space-x-3">
                                    <a
                                        href="https://www.facebook.com/FunPromotion.gr/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                                        aria-label="Facebook social link"
                                    >
                                        <FacebookIcon className="w-5 h-5" />
                                    </a>
                                    <a
                                        href="https://www.instagram.com/funpromotion_gr/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors"
                                        aria-label="Instagram social link"
                                    >
                                        <InstagramIcon className="w-5 h-5" />
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/company/funpromotion/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-800 transition-colors"
                                        aria-label="Linkedin social link"
                                    >
                                        <LinkedInIcon className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterestModal; 