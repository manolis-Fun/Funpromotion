import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const QuantityPricingModal = ({
    isOpen,
    onClose,
    quantity,
    setQuantity
}) => {
    if (!isOpen) return null;

    // Standard quantity tiers
    const standardQuantities = [50, 100, 250, 500, 1000, 2500];

    const handleQuantitySelect = (qty) => {
        setQuantity(qty);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Select Quantity</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {standardQuantities.map((qty) => (
                            <button
                                key={qty}
                                onClick={() => handleQuantitySelect(qty)}
                                className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                                    quantity === qty 
                                        ? 'border-orange-500 bg-orange-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-center">
                                    <div className="text-xl font-bold text-gray-900">{qty} pieces</div>
                                    <div className="text-sm text-gray-600 mt-1">Standard quantity</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuantityPricingModal;