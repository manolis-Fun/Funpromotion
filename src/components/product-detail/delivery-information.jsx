import React from 'react';
import CheckIcon from '@/icons/check-icon';
import ClockIcon from '@/icons/clock-icon';
import CheckCircleIcon from '@/icons/check-circle-icon';

const DeliveryInformation = () => {
    return (
        <div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Delivery Information</h3>
                <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-sm">
                            <div className="font-medium">Free Shipping</div>
                            <div className="text-gray-600">On orders over 50€</div>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <ClockIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-sm">
                            <div className="font-medium">Fast Processing</div>
                            <div className="text-gray-600">Same day processing</div>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircleIcon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-sm">
                            <div className="font-medium">Quality Guarantee</div>
                            <div className="text-gray-600">100% satisfaction guaranteed</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeliveryInformation
