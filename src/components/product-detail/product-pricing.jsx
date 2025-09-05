"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { fetchPricingData } from "@/utils/helpers";


export default function ProductPricing({
    product,
    quantity = 250,
    selectedTechnique = "1-color",
    actualSelectedVariation,
    selectedSize,
    selectedPosition,
}) {
    const [productPrice, setProductPrice] = useState(null);
    const [printPrice, setPrintPrice] = useState(null);
    const [shippingDays, setShippingDays] = useState({
        regular: "5-7",
        express: "2-3",
    });
    const [shippingCost, setShippingCost] = useState(null);
    const [finalPrice, setFinalPrice] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // Static pricing mock data
    const pricing = {
        productTotal: 100.0,
        printTotal: 30.0,
        pricePerUnit: 0.52,
        customerPricePerUnit: 0.60,
        totalCost: 130.0,
        customerTotalCost: 150.0,
        currency: "€",
    };



    // Static tier pricing
    const tierPricing = [
        { quantity: "100", adminPricePerUnit: 0.7, pricePerUnit: 0.9, discountPercent: 5 },
        { quantity: "250", adminPricePerUnit: 0.65, pricePerUnit: 0.85, discountPercent: 8 },
        { quantity: "500", adminPricePerUnit: 0.6, pricePerUnit: 0.75, discountPercent: 12 },
        { quantity: "1000", adminPricePerUnit: 0.55, pricePerUnit: 0.65, discountPercent: 15 },
    ];

    useEffect(() => {
        const fetchPricing = async () => {
            
            setIsLoading(true);
            try {
                const res = await fetchPricingData({
                    brand: product.singleProductFields.brand,
                    priceMain: product.priceMain,
                    quantity,
                    selectedTechnique,
                    v1w1: product.singleProductFields.v1W1,
                    selectedVariation: actualSelectedVariation
                });

                setFinalPrice(res.finalPrice);
                setProductPrice(res.productPrice);
                setPrintPrice(res.printPrice);
                setShippingDays(res.shippingDays);
                setShippingCost(res.shippingCost);
            } catch (err) {
            } finally {
                setIsLoading(false);
            }
        };
        fetchPricing();
    }, [product, quantity, selectedTechnique, actualSelectedVariation, selectedSize, selectedPosition]);

    return (
        <div className="flex flex-col gap-6 min-w-[700px]">
            <div className="w-full ">
                <div className="flex gap-4">
                    <div className="bg-white w-[40%] rounded-xl border border-gray-200 p-4">

                        {/* Price Per Unit Display */}
                        <div className="flex items-center ">
                            <Image src="https://funpromotion.gr/wp-content/uploads/2023/10/price_per-icon.png" alt="euro" width={14} height={14} />
                            <div className="flex gap-2 items-center capitalize">
                                <span className="text-sm text-gray-600 font-bold ml-1">Price / pc:</span>
                                <span className="text-orange-500 font-bold text-xl">
                                    {finalPrice?.per_unit} €
                                </span>
                            </div>

                        </div>
                        <div className="flex gap-2 items-center capitalize  mb-2">
                            <span className="text-sm text-gray-600 font-bold ml-1">Sale Price:</span>
                            <span className="text-orange-500 font-bold text-xl">
                                {product.priceMainSale ? (
                                    `${parseFloat(product?.priceMainSale)} €`
                                ) : (
                                    <span className="text-gray-400 text-sm">No sale price</span>
                                )}
                            </span>
                        </div>

                        {/* Total Cost */}
                        <div className=" flex items-center mb-2">
                            <Image src="https://funpromotion.gr/wp-content/uploads/2023/10/price_per-icon.png" alt="euro" width={14} height={14} />
                            <div className="flex gap-2 items-center">
                                <span className="ml-1 text-sm font-medium text-gray-600">Total:</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-slate-600">
                                        {(finalPrice?.total_price)} €
                                    </span>
                                    <span className="text-sm text-gray-500">+ VAT</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Shipping Information */}
                    <div className="w-[60%]  rounded-xl border border-gray-200 p-4">
                        <div className='grid grid-cols-2 gap-4'>
                            <div className="flex flex-col">
                                <div className="w-full h-[70px] bg-purple-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-800">Regular Delivery</div>
                                    <div className="text-sm text-gray-500">
                                        {isLoading ? (
                                            <span className="animate-pulse">Loading...</span>
                                        ) : (
                                            `${shippingDays.regular} working days*`
                                        )}
                                    </div>
                                    <div className="text-sm font-bold text-gray-600 inline-block mt-1">Free shipping</div>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div className="w-full h-[70px] bg-gray-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-800">Express Delivery</div>
                                    <div className="text-sm text-gray-500">
                                        {isLoading ? (
                                            <span className="animate-pulse">Loading...</span>
                                        ) : (
                                            `${shippingDays.express} working days*`
                                        )}
                                    </div>
                                    <div className="text-sm font-bold text-purple-600 inline-block mt-1">
                                        {isLoading ? (
                                            <span className="animate-pulse">Loading...</span>
                                        ) : shippingCost?.costPerPiece > 0 ? (
                                            `+${shippingCost.costPerPiece}€ / piece`
                                        ) : (
                                            "Contact us"
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Debug Panel - Specific Values Only */}
            <div className="bg-gray-100 border rounded-lg p-4 mt-6 text-sm text-gray-700">
                <h4 className="font-semibold text-gray-900 mb-3">Debug Information</h4>
                
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div><b>Base Price:</b> {product?.priceMain || 'N/A'} €</div>
                        <div><b>Setup Cost per Unit:</b> {printPrice?.pricing?.[0]?.setupCostPerUnit?.toFixed(4) || 'N/A'} € 
                            {printPrice?.pricing?.[0]?.setupCost && quantity ? 
                                ` (${printPrice?.pricing?.[0]?.setupCost}/${quantity})` : ''}</div>
                        <div><b>Matched Variation:</b> {actualSelectedVariation?.databaseId || 'N/A'}</div>
                        <div><b>Print Price:</b> {printPrice?.pricing?.[0]?.printingCostPerUnit?.toFixed(4) || 'N/A'} €</div>
                    </div>
                    
                    <div className="space-y-2">
                        <div><b>Handling Cost:</b> {product?.singleProductFields?.manipulation || 0} €</div>
                        <div><b>Print Multiplier:</b> {printPrice?.pricing?.[0]?.brandMarkup?.printMarkup || 'N/A'}x</div>
                        <div><b>Brand Multiplier:</b> {printPrice?.pricing?.[0]?.brandMarkup?.priceMultiplier || 'N/A'}x</div>
                        <div><b>Product Markup:</b> {finalPrice?.breakdown?.markup || 'N/A'}x</div>
                    </div>
                </div>
            </div>

        </div>
    );
}
