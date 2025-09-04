import React from 'react';

const QuantityModal = ({
    isQuantityDropdownOpen,
    setIsQuantityDropdownOpen,
    quantity,
    setQuantity,
    customQuantity,
    setCustomQuantity,
    quantityPricing,
    isLoadingPricing,
    QUANTITY_TIERS
}) => {
    const handleQuantitySelect = (selectedQuantity) => {
        setQuantity(selectedQuantity);
        setIsQuantityDropdownOpen(false);
    };

    const handleCustomQuantitySubmit = () => {
        const qty = parseInt(customQuantity);
        if (qty && qty > 0) {
            setQuantity(qty);
            setCustomQuantity("");
            setIsQuantityDropdownOpen(false);
        }
    };

    if (!isQuantityDropdownOpen) return null;

    return (
        <div className="absolute top-full left-0 mt-2 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                        Pieces
                    </div>
                    <div className="flex items-center">
                        Price €
                    </div>
                    <div className="flex items-center">
                        Discount %
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {QUANTITY_TIERS.map((tier) => {
                    const tierPricing = quantityPricing[tier.quantity] || { price: 0, staticDiscount: tier.staticDiscount };

                    // Calculate discounted price
                    const originalPrice = tierPricing.price;
                    const discountPercent = tierPricing.staticDiscount;
                    const discountAmount = (originalPrice * discountPercent) / 100;
                    const finalPrice = originalPrice - discountAmount;

                    return (
                        <div
                            key={tier.quantity}
                            className={`px-4 py-[2px] cursor-pointer hover:bg-gray-50 transition-colors ${quantity === tier.quantity ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                                }`}
                            onClick={() => handleQuantitySelect(tier.quantity)}
                        >
                            <div className="grid grid-cols-3 gap-4 items-center">
                                <div className="flex items-center">
                                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${quantity === tier.quantity
                                        ? 'border-orange-500 bg-orange-500'
                                        : 'border-gray-300'
                                        }`}>
                                        {quantity === tier.quantity && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="font-medium text-sm text-gray-700">{tier.quantity.toLocaleString()}</span>
                                </div>
                                <div className="font-bold text-sm text-gray-900">
                                    {isLoadingPricing ? (
                                        <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                                    ) : (
                                        <div className="flex flex-col">
                                            {discountPercent > 0 ? (
                                                <>
                                                    <span className="text-sm text-gray-400 line-through">{originalPrice.toFixed(2)} €</span>
                                                    <span className="text-orange-600 font-bold">{finalPrice.toFixed(2)} €</span>
                                                </>
                                            ) : (
                                                <span>{originalPrice.toFixed(2)} €</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="font-semibold text-sm text-orange-500">
                                    {isLoadingPricing ? (
                                        <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                                    ) : (
                                        `${tierPricing.staticDiscount.toFixed(1)} %`
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Custom Quantity Input */}
                <div className="p-4 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Εισάγετε τεμάχια"
                            value={customQuantity}
                            onChange={(e) => setCustomQuantity(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-600"
                            min="1"
                        />
                        <button
                            onClick={handleCustomQuantitySubmit}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuantityModal;