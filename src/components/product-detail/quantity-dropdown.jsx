import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const QuantityDropdown = ({ 
  quantity, 
  setQuantity,
  onDropdownOpen,
  productPrices // Array of product pricing data from API
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customQuantity, setCustomQuantity] = useState('');
  const [customError, setCustomError] = useState('');
  const dropdownRef = useRef(null);

  // Standard quantity tiers
  const standardQuantities = [50, 100, 250, 500, 1000, 2500];
  
  // Format quantity for display (add comma for thousands)
  const formatQuantity = (qty) => {
    return qty >= 1000 ? qty.toLocaleString() : qty.toString();
  };

  // Get price data for a specific quantity
  const getPriceForQuantity = (qty) => {
    const result = productPrices?.find(p => p.quantity === qty);
    return result;
  };

  // Calculate discount percentage compared to the smallest quantity (50)
  const calculateDiscount = (qty) => {
    if (!productPrices || productPrices.length === 0) return null;
    
    const currentPrice = getPriceForQuantity(qty);
    const basePrice = getPriceForQuantity(50); // Compare to smallest quantity
    
    // More robust checking
    if (!currentPrice || !basePrice || 
        !currentPrice.finalProductPricePerUnit || 
        !basePrice.finalProductPricePerUnit ||
        basePrice.finalProductPricePerUnit <= 0) {
      return null;
    }
    
    const currentPriceValue = parseFloat(currentPrice.finalProductPricePerUnit);
    const basePriceValue = parseFloat(basePrice.finalProductPricePerUnit);
    
    // Only show discount if current price is actually lower
    if (currentPriceValue >= basePriceValue) return null;
    
    const discount = ((basePriceValue - currentPriceValue) / basePriceValue) * 100;
    return discount > 0.1 ? discount : null; // Only show if discount is meaningful (>0.1%)
  };

  const handleQuantitySelect = (qty) => {
    setQuantity(qty);
    setIsOpen(false);
    setCustomQuantity('');
    setCustomError('');
  };

  const handleCustomQuantitySubmit = () => {
    const customQty = parseInt(customQuantity, 10);
    if (!customQty || customQty < 1) {
      setCustomError('Please enter a valid quantity (minimum 1)');
      return;
    }
    if (customQty > 10000) {
      setCustomError('Maximum quantity is 10,000');
      return;
    }
    setQuantity(customQty);
    setCustomQuantity('');
    setCustomError('');
    setIsOpen(false);
  };

  const handleCustomQuantityKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCustomQuantitySubmit();
    }
  };

  const handleDropdownToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // Call API with all quantities when dropdown opens
    if (newIsOpen && onDropdownOpen) {
      onDropdownOpen(standardQuantities);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleDropdownToggle}
        className="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:bg-gray-50"
      >
        <span className="font-medium">{formatQuantity(quantity)} pieces</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-[500px] mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-700 border-b">
              <div>Select</div>
              <div>Pieces</div>
              <div>Price</div>
              <div>Discount</div>
              <div>Total</div>
            </div>
            
            {/* Standard quantities as table rows */}
            {standardQuantities.map((qty) => {
              const priceData = getPriceForQuantity(qty);
              const discount = calculateDiscount(qty);
              const isSelected = quantity === qty;
              
              return (
                <div
                  key={qty}
                  onClick={() => handleQuantitySelect(qty)}
                  className={`grid grid-cols-5 gap-2 px-3 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 text-sm ${
                    isSelected ? 'bg-orange-50' : ''
                  }`}
                >
                  {/* Checkbox Column */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by row click
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 pointer-events-none"
                    />
                  </div>
                  
                  {/* Pieces Column */}
                  <div className="flex items-center font-medium">
                    {formatQuantity(qty)}
                  </div>
                  
                  {/* Price Column */}
                  <div className="flex items-center text-gray-600">
                    {priceData ? `€${priceData.finalProductPricePerUnit?.toFixed(2) || '0.00'}` : '—'}
                  </div>
                  
                  {/* Discount Column */}
                  <div className="flex items-center">
                    {discount !== null && discount > 0 ? (
                      <span className="text-green-600 font-medium">
                        -{discount.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                  
                  {/* Total Column */}
                  <div className="flex items-center font-semibold text-gray-800">
                    {priceData ? `€${priceData.finalProductPrice?.toFixed(0) || '0'}` : '—'}
                  </div>
                </div>
              );
            })}
            
            {/* Custom quantity input */}
            <div className="border-t border-gray-200 p-3 mt-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Custom Quantity</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(e.target.value)}
                  onKeyPress={handleCustomQuantityKeyPress}
                  placeholder="Enter quantity"
                  min="1"
                  max="10000"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  onClick={handleCustomQuantitySubmit}
                  className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                >
                  Set
                </button>
              </div>
              {customError && (
                <p className="text-red-600 text-xs mt-1">{customError}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantityDropdown;