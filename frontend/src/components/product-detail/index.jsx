"use client";

import { useState, useEffect, useMemo } from "react";
import ImageSection from "./image-section";
import Breadcrumbs from "./breadcrumbs";
import PrintingOptionIcons from "./printing-option-icons";
import { translateSizeLabel, uniqueTechniques, uniquePositions, uniqueSizes, uniqueExtras, formatTechniqueLabel, getTechniqueColors, formatAttributeValue, findCheapestCombination, findCheapestForConstraints } from "@/utils/helpers";
import QuantityModal from "./quantity-modal";
import QuantityPricingModal from "./quantity-pricing-modal";
import QuantityDropdown from "./quantity-dropdown";
import InterestModal from "./interest-modal";
import MessageIcon from "@/icons/message-icon";
import { addToCart } from "@/utils/cart";


// Base quantity tiers - discounts will be calculated dynamically
const QUANTITY_TIERS = [
  { quantity: 50, staticDiscount: 0.0 },
  { quantity: 100, staticDiscount: 0.0 },
  { quantity: 250, staticDiscount: 0.0 },
  { quantity: 500, staticDiscount: 0.0 },
  { quantity: 1000, staticDiscount: 0.0 },
  { quantity: 2500, staticDiscount: 0.0 },
];

export default function 
ProductDetails({ product }) {
  // Product detail component

  const mainImage = product.images?.[0] || "/placeholder.jpg";
  const galleryImages = product.galleryImages?.length ? product.galleryImages : product.images || [];

  const [selectedImage, setSelectedImage] = useState(mainImage);
  const [quantity, setQuantity] = useState(100);
  const [customQuantity, setCustomQuantity] = useState("");
  const [isQuantityDropdownOpen, setIsQuantityDropdownOpen] = useState(false); // New state for dropdown
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false); // New state for interest modal
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false); // State for enhanced pricing modal
  const [productPrices, setProductPrices] = useState(null); // State for product prices

  const variations = useMemo(
    () =>
      (product.variations || []).map((v) => ({
        ...v,
        attributes: (v.attributes?.nodes || v.attributes || []).map(({ label, value }) => ({ label, value })),
      })),
    [product.variations]
  );

  // Find cheapest combination on page load
  const cheapestCombination = useMemo(() => {
    return findCheapestCombination(
      variations, 
      quantity, 
      product.priceMain, 
      product.singleProductFields?.brand, 
      product.singleProductFields?.manipulation
    );
  }, [variations, quantity, product.priceMain, product.singleProductFields?.brand, product.singleProductFields?.manipulation]);

  // Set initial state based on cheapest combination
  const [technique, setTechnique] = useState(() => cheapestCombination.technique);
  const [selectedPosition, setSelectedPosition] = useState(() => cheapestCombination.position);
  const [selectedSize, setSelectedSize] = useState(() => cheapestCombination.size);  
  const [selectedExtra, setSelectedExtra] = useState(() => cheapestCombination.extra);

  // Get available options with conditional filtering
  const techniques = useMemo(() => uniqueTechniques(variations), [variations]);
  
  const positions = useMemo(() => {
    const filteredByTechnique = variations.filter((v) => {
      const attrs = v.attributes?.nodes ?? v.attributes ?? [];
      return attrs.find((a) => a.label === "technique")?.value === technique;
    });
    return uniquePositions(filteredByTechnique);
  }, [variations, technique]);

  const sizes = useMemo(() => {
    const filteredVariations = variations.filter((v) => {
      const attrs = Object.fromEntries((v.attributes?.nodes || v.attributes || []).map((a) => [a.label, a.value]));
      return attrs.technique === technique && 
             (positions.length <= 1 || attrs.position === selectedPosition);
    });
    return uniqueSizes(filteredVariations);
  }, [variations, technique, positions, selectedPosition]);

  const extras = useMemo(() => {
    const filteredVariations = variations.filter((v) => {
      const attrs = Object.fromEntries((v.attributes?.nodes || v.attributes || []).map((a) => [a.label, a.value]));
      return attrs.technique === technique && 
             (positions.length <= 1 || attrs.position === selectedPosition) &&
             (sizes.length <= 1 || attrs.size === selectedSize);
    });
    return uniqueExtras(filteredVariations);
  }, [variations, technique, positions, selectedPosition, sizes, selectedSize]);

  // Update state when cheapest combination changes (quantity changes)
  useEffect(() => {
    setTechnique(cheapestCombination.technique);
    setSelectedPosition(cheapestCombination.position);
    setSelectedSize(cheapestCombination.size);
    setSelectedExtra(cheapestCombination.extra);
  }, [cheapestCombination]);

  // Hierarchical selection handlers
  const handleTechniqueChange = (newTechnique) => {
    // When technique changes, find cheapest combination for remaining attributes
    const cheapest = findCheapestForConstraints(
      variations,
      { technique: newTechnique },
      quantity,
      product.priceMain,
      product.singleProductFields?.brand,
      product.singleProductFields?.manipulation
    );
    
    setTechnique(newTechnique);
    setSelectedPosition(cheapest.position);
    setSelectedSize(cheapest.size);
    setSelectedExtra(cheapest.extra);
  };

  const handlePositionChange = (newPosition) => {
    // When position changes, find cheapest combination for size and extra
    const cheapest = findCheapestForConstraints(
      variations,
      { technique, position: newPosition },
      quantity,
      product.priceMain,
      product.singleProductFields?.brand,
      product.singleProductFields?.manipulation
    );
    
    setSelectedPosition(newPosition);
    setSelectedSize(cheapest.size);
    setSelectedExtra(cheapest.extra);
  };

  const handleSizeChange = (newSize) => {
    // When size changes, find cheapest extra
    const cheapest = findCheapestForConstraints(
      variations,
      { technique, position: selectedPosition, size: newSize },
      quantity,
      product.priceMain,
      product.singleProductFields?.brand,
      product.singleProductFields?.manipulation
    );
    
    setSelectedSize(newSize);
    setSelectedExtra(cheapest.extra);
  };

  const handleExtraChange = (newExtra) => {
    // Extra is the last attribute, no hierarchical selection needed
    setSelectedExtra(newExtra);
  };

  // Reset dependent selections when parent changes (fallback for edge cases)
  useEffect(() => {
    if (!positions.includes(selectedPosition)) {
      const newPosition = positions[0] || "";
      setSelectedPosition(newPosition);
    }
  }, [positions, selectedPosition]);

  useEffect(() => {
    if (!sizes.includes(selectedSize)) {
      const newSize = sizes[0] || "";
      setSelectedSize(newSize);
    }
  }, [sizes, selectedSize]);

  useEffect(() => {
    if (!extras.includes(selectedExtra)) {
      const newExtra = extras[0] || "";
      setSelectedExtra(newExtra);
    }
  }, [extras, selectedExtra]);

  const selectedVariation = useMemo(() => {
    const variation = variations.find((v) => {
      const attr = Object.fromEntries((v.attributes?.nodes || v.attributes || []).map((a) => [a.label, a.value]));
      return attr.technique === technique && 
             (positions.length <= 1 || attr.position === selectedPosition) &&
             (sizes.length <= 1 || attr.size === selectedSize) && 
             (extras.length <= 1 || attr.extra === selectedExtra);
    });


    return variation;
  }, [variations, technique, selectedPosition, selectedSize, selectedExtra, sizes, positions, extras]);


  // Call pricing APIs - print-price for printing techniques, product-price for final pricing
  const callPricingAPIs = async (quantities = [quantity || 100]) => {
    try {
      // Use exactly what's selected - no fallbacks since UI conditionally renders available options
      const currentPosition = selectedPosition;
      const currentSize = selectedSize;  
      const currentExtra = selectedExtra;
      
      
      let printPriceData = null;
      
      // Step 1: Call print-price API only if technique is NOT "no-print"
      if (technique !== 'no-print') {
        const printRequestBody = {
          quantity: quantities,
          technique: technique || '',
          position: currentPosition,
          size: currentSize,
          extra: currentExtra,
          variations: product.variations || [],
          manipulation: product.singleProductFields?.manipulation,
          basePrice: product.priceMain,
          brand: product.singleProductFields?.brand
        };

        const printResponse = await fetch('/api/print-price', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(printRequestBody),
        });
        
        printPriceData = await printResponse.json();
      }
      
      // Step 2: Call product-price API for each quantity with its corresponding print price
      const productPriceResults = [];
      
      for (const qty of quantities) {
        // Find the print price for this specific quantity
        const printDataForQty = printPriceData?.pricing?.find(p => p.quantity === qty);
        const printPricePerUnit = printDataForQty?.finalTotalPerUnit || 0;
        
        const productRequestBody = {
          totalPrintPricePerUnit: printPricePerUnit,
          quantity: [qty], // Single quantity for this call
          brand: product.singleProductFields?.brand,
          basePrice: product.priceMain
        };

        const productResponse = await fetch('/api/product-price', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productRequestBody),
        });
        
        const productPriceData = await productResponse.json();
        
        // Add the result to our collection
        if (productPriceData.pricing && productPriceData.pricing.length > 0) {
          productPriceResults.push(productPriceData.pricing[0]);
        }
      }
      
      // Store pricing data for display
      setProductPrices(productPriceResults);
      
    } catch (error) {
      // Handle error silently or with user-friendly message
    }
  };

  useEffect(() => {
    // Only call API if we have the essential parameters and derived arrays are ready
    if (quantity && technique && positions.length >= 0 && sizes.length >= 0 && extras.length >= 0) {
      callPricingAPIs();
    }
  }, [quantity, technique, selectedPosition, selectedSize, selectedExtra, positions, sizes, extras, product.variations]);

  // Handle dropdown open with all quantities
  const handleDropdownOpen = (quantities) => {
    callPricingAPIs(quantities);
  };


  return (
    <section className="bg-[#f8f8f8] pt-44">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs product={product} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ImageSection product={product} selectedImage={selectedImage} setSelectedImage={setSelectedImage} mainImage={mainImage} galleryImages={galleryImages} />
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="text-sm">
              Customer product code: <span className="text-gray-600">{product.id}</span>
            </p>
            <p className="text-sm">
              Supplier product code: <span className="text-red-500">P308.5801</span>
            </p>
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full w-fit">
              <span className="text-orange-500 font-semibold">{product.stockQuantity}</span> In Stock
            </div>
            <div className="space-y-6">
              {/* Step 1: Colors (Technique) - Always shown first */}
              {techniques.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">PRINTING TECHNIQUE</h3>
                  <div className="flex border border-gray-200 rounded-lg justify-between overflow-hidden w-fit">
                    {techniques.map((techniqueValue) => (
                      <button
                        key={techniqueValue}
                        onClick={() => handleTechniqueChange(techniqueValue)}
                        className={`flex flex-col items-center px-[18px] py-3 text-black ${technique === techniqueValue ? "bg-[#F5F5F5]" : "bg-white"}`}
                      >
                        <PrintingOptionIcons colors={getTechniqueColors(techniqueValue)} />
                        <span className="text-xs">{formatTechniqueLabel(techniqueValue)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Position - Only shown if technique is not no-print and has meaningful options */}
              {technique !== 'no-print' && positions.length > 0 && !(positions.length === 1 && positions[0] === '') && (
                <div>
                  <h3 className="font-medium mb-3">PRINT POSITION</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {positions.map((pos) => {
                      // Get position-specific data
                      const positionVariation = variations.find(v => 
                        v.attributes.find(a => a.label === "position")?.value === pos &&
                        v.attributes.find(a => a.label === "technique")?.value === technique
                      );
                      
                      const positionSize = positionVariation?.attributes.find(a => a.label === "size")?.value;
                      const positionImage = product.images?.[0] || "/placeholder.jpg";
                      
                      // Parse size information for display
                      const sizeDisplay = positionSize ? translateSizeLabel(positionSize) : "Standard";
                      
                      return (
                        <div key={pos} className="relative group">
                          <button
                            onClick={() => handlePositionChange(pos)}
                            className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                              selectedPosition === pos 
                                ? "border-orange-500 bg-orange-50" 
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div className="w-16 h-16 mb-2 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                <img
                                  src={positionImage}
                                  alt={`${pos} position`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-xs font-bold text-gray-800 uppercase mb-1">
                                {formatAttributeValue(pos)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {sizeDisplay}
                              </div>
                            </div>
                          </button>
                          
                          {/* Tooltip with larger image */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                <img
                                  src={positionImage}
                                  alt={`${formatAttributeValue(pos)} position preview`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="mt-2 text-center">
                                <div className="text-sm font-medium text-gray-800">
                                  {formatAttributeValue(pos)}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {sizeDisplay}
                                </div>
                              </div>
                              {/* Arrow pointing down */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Size - Only shown if technique is not no-print and has meaningful options */}
              {technique !== 'no-print' && sizes.length > 0 && !(sizes.length === 1 && sizes[0] === '') && (
                <div>
                  <h3 className="font-medium mb-3 text-lg">Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          selectedSize === size 
                            ? "bg-white border-orange-500 text-gray-800" 
                            : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {formatAttributeValue(size, "size")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Extra - Only shown if technique is not no-print and has meaningful options */}
              {technique !== 'no-print' && extras.length > 0 && !(extras.length === 1 && extras[0] === '') && (
                <div>
                  <h3 className="font-medium mb-3 text-lg">EXTRAS</h3>
                  <div className="flex flex-wrap gap-3">
                    {extras.map((extra) => (
                      <button
                        key={extra || "nothing"}
                        onClick={() => handleExtraChange(extra)}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          selectedExtra === extra 
                            ? "bg-white border-orange-500 text-gray-800" 
                            : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
{formatAttributeValue(extra).replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Pricing Section */}
              <div className="space-y-4">
                {/* Quantity Selector with Enhanced Pricing */}
                <div className="flex flex-wrap gap-4 items-start">
                  <QuantityDropdown
                    quantity={quantity}
                    setQuantity={setQuantity}
                    onDropdownOpen={handleDropdownOpen}
                    productPrices={productPrices}
                  />

                  

                  <button
                    onClick={async () => {
                      try {
                        // Add to cart with current selection

                        // Determine the correct product ID to use
                        let productIdToUse;
                        let variationAttributes = null;

                        // For "no-print" technique, use parent product ID (no variations needed)
                        if (technique === 'no-print') {
                          productIdToUse = product.id; // Use parent product ID
                          variationAttributes = null;  // No variation attributes needed
                        } else {
                          // For other techniques, use variation ID with attributes
                          productIdToUse = selectedVariation?.id || product.id;

                          // For variable products, ensure we have a variation selected
                          if (variations.length > 0 && !selectedVariation) {
                            alert('Please select all product options (size, position, etc.) before adding to cart.');
                            return;
                          }

                          // Prepare variation attributes for variable products
                          if (selectedVariation && selectedVariation.attributes) {
                            // Convert attributes array to object format, only including non-empty values
                            variationAttributes = {};
                            selectedVariation.attributes.forEach(attr => {
                              // Only include attributes that have actual values
                              if (attr.value && attr.value.trim() !== '') {
                                const attributeKey = `attribute_${attr.label.toLowerCase()}`;
                                variationAttributes[attributeKey] = attr.value;
                              }
                            });

                            // If no attributes have values, set to null
                            if (Object.keys(variationAttributes).length === 0) {
                              variationAttributes = null;
                            }
                          }
                        }


                        const res = await addToCart(
                          productIdToUse,
                          quantity,
                          variationAttributes
                        );


                        // Show success message
                        if (res.error) {
                          alert('Error: ' + res.message);
                        } else {
                          alert('Product added to cart successfully!');
                        }
                      } catch (err) {
                        alert('Failed to add product to cart: ' + err.message);
                      }
                    }}
                    className="bg-[#FF6600] font-semibold text-white px-6 py-2 hover:bg-orange-600 transition-colors"
                  >
                    Add to cart
                  </button>
                  
                </div>
{/* Small Price Panel - Shows price for selected quantity */}
                  {productPrices && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                      {productPrices.map((productData, index) => 
                        productData.quantity === quantity ? (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-600">{quantity} pieces</span>
                              <span className="text-xs text-gray-500">
                                €{productData.finalProductPricePerUnit?.toFixed(2) || '0.00'} per unit
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                €{productData.finalProductPrice?.toFixed(2) || '0.00'}
                              </div>
                              {/* Show discount if available */}
                              {(() => {
                                const basePrice = productPrices.find(p => p.quantity === 50);
                                if (!basePrice || !productData.finalProductPricePerUnit || !basePrice.finalProductPricePerUnit) {
                                  return null;
                                }
                                
                                const currentPriceValue = parseFloat(productData.finalProductPricePerUnit);
                                const basePriceValue = parseFloat(basePrice.finalProductPricePerUnit);
                                
                                // Only show discount if current price is actually lower
                                if (currentPriceValue >= basePriceValue) return null;
                                
                                const discount = ((basePriceValue - currentPriceValue) / basePriceValue) * 100;
                                
                                if (discount > 0.1) { // Only show if discount is meaningful
                                  return (
                                    <div className="text-sm text-green-600 font-medium">
                                      Save {discount.toFixed(1)}%
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                {/* Enhanced Pricing Modal */}
                <QuantityPricingModal
                  isOpen={isPricingModalOpen}
                  onClose={() => setIsPricingModalOpen(false)}
                  quantity={quantity}
                  setQuantity={setQuantity}
                />
                
                {/* Legacy Quantity Modal - Keep for backward compatibility */}
                <QuantityModal
                  isQuantityDropdownOpen={isQuantityDropdownOpen}
                  setIsQuantityDropdownOpen={setIsQuantityDropdownOpen}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  customQuantity={customQuantity}
                  setCustomQuantity={setCustomQuantity}
                  QUANTITY_TIERS={QUANTITY_TIERS}
                />
              </div>


              {/* Interest Button */}
              <button
                onClick={() => setIsInterestModalOpen(true)}
                className="w-full bg-orange-500 text-white py-4 px-6 rounded-lg hover:bg-orange-600 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <MessageIcon className="w-5 h-5" />
                <span>Are you interested in the product?</span>
              </button>
            </div>
          </div>
        </div>

        {/* Debug Panel - Top right, vertical layout */}
        <div className="fixed top-4 right-4 w-80 bg-orange-100 border-2 border-red-500 rounded-lg shadow-lg p-4 text-sm z-[99999] max-h-[calc(100vh-2rem)] overflow-y-auto">
          <h4 className="font-semibold text-red-600 mb-3">Debug Information</h4>
          
          <div className="space-y-2">
            <div><b>Base Price:</b> {product?.priceMain || 'N/A'} €</div>
            <div><b>Setup Cost per Unit:</b> 
              {(() => {
                if (!selectedVariation) return 'N/A';
                const metaData = selectedVariation.metaData || [];
                const setupCostData = metaData.find(m => m.key === '_price_print_setup');
                const setupCost = setupCostData ? parseFloat(setupCostData.value) : null;
                const setupCostPerUnit = setupCost && quantity ? (setupCost / quantity).toFixed(4) : 'N/A';
                return setupCostPerUnit !== 'N/A' ? 
                  `${setupCostPerUnit} € (${setupCost}/${quantity})` : 'N/A';
              })()}
            </div>
            <div><b>Matched Variation:</b> 
              {selectedVariation ? (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <div className="px-3 py-1 border border-gray-300 rounded-md text-xs bg-white">
                      #{selectedVariation.databaseId}
                    </div>
                    {(() => {
                      const attrs = selectedVariation.attributes?.nodes || selectedVariation.attributes || [];
                      return attrs.map((attr, index) => (
                        <div key={index} className="px-3 py-1 border border-gray-300 rounded-md text-xs bg-white">
                          {attr.label === 'technique' 
                            ? formatTechniqueLabel(attr.value)
                            : attr.label === 'size' 
                            ? translateSizeLabel(attr.value)
                            : formatAttributeValue(attr.value, attr.label)
                          }
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="text-xs font-medium text-blue-800">Price for {quantity}pcs: {(() => {
                    const metaData = selectedVariation.metaData || [];
                    // Find the right price tier for current quantity (exclude customer prices to match API)
                    const priceKey = metaData.find(m => {
                      const key = m.key;
                      if (!key?.startsWith('_price_print_')) return false;
                      // Skip customer prices since API uses preferCustomerPrice: false
                      if (key.endsWith('_customer')) return false;
                      const match = key.match(/^_price_print_(\d+)_((\d+)|infinity)$/);
                      if (!match) return false;
                      const min = Number(match[1]);
                      const max = match[2] === 'infinity' ? Infinity : Number(match[2]);
                      return quantity >= min && (max === Infinity ? true : quantity < max);
                    });
                    return priceKey ? `€${priceKey.value}` : 'N/A';
                  })()}</div>
                </div>
              ) : 'None'}
            </div>
            <div><b>Print Price:</b> 
              {productPrices?.find(p => p.quantity === quantity)?.printPricePerUnit?.toFixed(4) || 'N/A'} €
            </div>
            <div><b>Handling Cost:</b> {product?.singleProductFields?.manipulation || 0} €</div>
            <div><b>Print Multiplier:</b> 
              {productPrices?.find(p => p.quantity === quantity)?.brandMarkup?.printMarkup || 'N/A'}x
            </div>
            <div><b>Brand Multiplier:</b> 
              {productPrices?.find(p => p.quantity === quantity)?.brandMultiplier || 'N/A'}x
            </div>
            <div><b>Product Markup:</b> 
              {productPrices?.find(p => p.quantity === quantity)?.productMarkup || 'N/A'}x
            </div>
            
            {/* Final Price per Unit */}
            <div className="border-t border-gray-300 pt-2 mt-3">
              <div><b>Final Product Price per Unit:</b> 
                {productPrices?.find(p => p.quantity === quantity)?.finalProductPricePerUnit?.toFixed(4) || 'N/A'} €
              </div>
            </div>
          </div>
        </div>

        {/* Interest Modal */}
        <InterestModal isOpen={isInterestModalOpen} onClose={() => setIsInterestModalOpen(false)} />
      </div>
    </section>
  );
}
