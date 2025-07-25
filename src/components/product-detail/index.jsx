"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import ImageSection from "./image-section";
import Breadcrumbs from "./breadcrumbs";
import PrintingOptionIcons from "./printing-option-icons";
import ProductPricing from "./product-pricing";
import { translateSizeLabel, fetchPricingData } from "@/utils/helpers";
import QuantityModal from "./quantity-modal";
import InterestModal from "./interest-modal";
import MessageIcon from "@/icons/message-icon";
import { addToCart } from "@/utils/cart";

const PRINTING_OPTIONS = [
  { label: "1 Color", value: "1-color" },
  { label: "2 Colors", value: "2-colors" },
  { label: "3 Colors", value: "3-colors" },
  { label: "4 Colors", value: "4-colors" },
  { label: "Embroidery", value: "embroidery" },
  { label: "Full Color", value: "full-color" },
  { label: "No Print", value: "no-print" },
];

const PRINTING_TECHNIQUE_COLORS = {
  "1-color": ["#7627b9"],
  "2-colors": ["#7627b9", "#1cb4cf"],
  "3-colors": ["#7627b9", "#1cb4cf", "#fbbf24"],
  "4-colors": ["#7627b9", "#1cb4cf", "#fbbf24", "#ef4444"],
  embroidery: ["#f59e42"],
  "full-color": ["gradient"],
  "no-print": ["#e5e7eb"],
};

// Base quantity tiers - prices will be loaded dynamically
const QUANTITY_TIERS = [
  { quantity: 50, staticDiscount: 0.0 },
  { quantity: 100, staticDiscount: 10.2 },
  { quantity: 250, staticDiscount: 16.3 },
  { quantity: 500, staticDiscount: 19.8 },
  { quantity: 1000, staticDiscount: 21.9 },
  { quantity: 2500, staticDiscount: 25.7 },
];

export default function ProductDetails({ product }) {
  const mainImage = product.images?.[0] || "/placeholder.jpg";
  const galleryImages = product.galleryImages?.length ? product.galleryImages : product.images || [];

  const [selectedImage, setSelectedImage] = useState(mainImage);
  const [quantity, setQuantity] = useState(250);
  const [customQuantity, setCustomQuantity] = useState("");
  const [userRole] = useState("customer");
  const [quantityPricing, setQuantityPricing] = useState({});
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [basePriceReference, setBasePriceReference] = useState(25.37); // Base price for discount calculation
  const [isQuantityDropdownOpen, setIsQuantityDropdownOpen] = useState(false); // New state for dropdown
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false); // New state for interest modal

  const variations = useMemo(
    () =>
      (product.variations || []).map((v) => ({
        ...v,
        attributes: v.attributes.map(({ label, value }) => ({ label, value })),
      })),
    [product.variations]
  );

  const techniques = useMemo(() => [...new Set(variations.map((v) => v.attributes.find((a) => a.label === "technique")?.value).filter(Boolean))], [variations]);

  const [technique, setTechnique] = useState(() => (techniques.includes("no-print") ? "no-print" : techniques[0] || ""));

  useEffect(() => {
    if (!techniques.includes(technique)) setTechnique(techniques[0] || "");
  }, [techniques, technique]);

  const filteredVariations = useMemo(() => variations.filter((v) => v.attributes.find((a) => a.label === "technique")?.value === technique), [variations, technique]);

  const sizes = useMemo(() => [...new Set(filteredVariations.map((v) => v.attributes.find((a) => a.label === "size")?.value).filter(Boolean))], [filteredVariations]);

  const positions = useMemo(() => [...new Set(filteredVariations.map((v) => v.attributes.find((a) => a.label === "position")?.value).filter(Boolean))], [filteredVariations]);

  const [selectedSize, setSelectedSize] = useState(() => sizes[0] || "");
  const [selectedPosition, setSelectedPosition] = useState(() => positions[0] || "");

  useEffect(() => {
    if (!sizes.includes(selectedSize)) setSelectedSize(sizes[0] || "");
    if (!positions.includes(selectedPosition)) setSelectedPosition(positions[0] || "");
  }, [sizes, positions, selectedSize, selectedPosition]);

  const selectedVariation = useMemo(() => {
    const variation = filteredVariations.find((v) => {
      const attr = Object.fromEntries(v.attributes.map((a) => [a.label, a.value]));
      return attr.technique === technique && (sizes.length <= 1 || attr.size === selectedSize) && (positions.length <= 1 || attr.position === selectedPosition);
    });

    // Debug logging
    console.log('🔍 Variation Selection Debug:', {
      technique,
      selectedSize,
      selectedPosition,
      filteredVariations,
      foundVariation: variation,
      variationId: variation?.id,
      allVariations: variations,
      // NEW: Detailed attribute debugging
      variationAttributes: variation?.attributes,
      firstVariationAttrs: variations[0]?.attributes,
      availableSizes: sizes,
      availablePositions: positions
    });

    return variation;
  }, [filteredVariations, technique, selectedSize, selectedPosition, sizes, positions, variations]);

  const getAttr = (label) => selectedVariation?.attributes.find((a) => a.label === label)?.value || "-";

  const mockVariationData = useMemo(
    () =>
      selectedVariation && {
        id: selectedVariation.id,
        printing_technique_field: technique,
        max_printing_size: getAttr("size"),
        price_print_1_3: 0.5,
        price_print_3_5: 0.45,
        price_print_5_10: 0.4,
        price_print_10_25: 0.35,
        price_print_25_50: 0.3,
        price_print_50_100: 0.25,
        price_print_100_250: 0.2,
        price_print_250_500: 0.18,
        price_print_500_1000: 0.15,
        price_print_1000_2500: 0.12,
        price_print_2500_5000: 0.1,
        price_print_5000_10000: 0.08,
        price_print_10000_infinity: 0.06,
        price_print_setup: 25,
      },
    [selectedVariation, technique]
  );

  // Load pricing for all quantity tiers
  useEffect(() => {
    const loadPricingForAllTiers = async () => {
      if (!product.singleProductFields?.brand || !product.priceMain) return;

      setIsLoadingPricing(true);
      const pricing = {};

      try {
        // Fetch pricing for each quantity tier
        await Promise.all(
          QUANTITY_TIERS.map(async (tier) => {
            try {
              const res = await fetchPricingData({
                brand: product.singleProductFields.brand,
                priceMain: product.priceMain,
                quantity: tier.quantity,
                selectedTechnique: technique,
                v1w1: product.singleProductFields.v1W1,
              });

              const basePrice = res.finalPrice?.breakdown?.product_price || product.priceMain || 0;

              // Calculate discount based on base price (first tier)
              if (tier.quantity === 50) {
                setBasePriceReference(basePrice);
              }

              pricing[tier.quantity] = {
                price: basePrice,
                staticDiscount: tier.staticDiscount, // Use static discount from tier
                totalPrice: res.finalPrice?.total_price || basePrice * tier.quantity,
              };
            } catch (error) {
              // Fallback pricing if API fails
              const fallbackPrices = {
                50: 25.37,
                100: 22.77,
                250: 21.23,
                500: 20.35,
                1000: 19.8,
                2500: 18.85,
              };

              pricing[tier.quantity] = {
                price: fallbackPrices[tier.quantity] || product.priceMain || 0,
                staticDiscount: tier.staticDiscount, // Use static discount from tier
                totalPrice: (fallbackPrices[tier.quantity] || product.priceMain || 0) * tier.quantity,
              };
            }
          })
        );

        setQuantityPricing(pricing);
      } catch (error) {
        console.error("Error loading pricing:", error);
      } finally {
        setIsLoadingPricing(false);
      }
    };

    loadPricingForAllTiers();
  }, [product, technique]);

  const handleCustomQuantitySubmit = () => {
    const qty = parseInt(customQuantity);
    if (qty && qty > 0) {
      setQuantity(qty);
      setCustomQuantity("");
    }
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
              {/* Technique */}
              <div>
                <h3 className="font-medium mb-3">PRINTING TECHNIQUE</h3>
                <div className="flex border border-gray-200 rounded-lg justify-between overflow-hidden w-fit">
                  {PRINTING_OPTIONS.filter((opt) => techniques.includes(opt.value)).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTechnique(opt.value)}
                      className={`flex flex-col items-center px-[18px] py-3 text-black ${technique === opt.value ? "bg-[#F5F5F5]" : "bg-white"}`}
                    >
                      <PrintingOptionIcons colors={PRINTING_TECHNIQUE_COLORS[opt.value]} />
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Size */}
              {sizes.length > 1 && (
                <div>
                  <h3 className="font-medium mb-3">PRINT SIZE</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-2 py-[6px] rounded-3xl text-xs border ${selectedSize === size ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 border-gray-300"
                          }`}
                      >
                        {translateSizeLabel(size)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Position */}
              {positions.length > 1 && (
                <div>
                  <h3 className="font-medium mb-3">PRINT POSITION</h3>
                  <div className="flex flex-wrap gap-2">
                    {positions.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setSelectedPosition(pos)}
                        className={`px-2 py-[6px] rounded-3xl text-xs border ${selectedPosition === pos ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 border-gray-300"
                          }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Dropdown Button */}
              <div className="relative">
                <div className="flex items-center border border-orange-600 overflow-hidden rounded-lg w-fit">
                  <button
                    onClick={() => setIsQuantityDropdownOpen(!isQuantityDropdownOpen)}
                    className="flex items-center justify-between w-48 px-4 py-2 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-500">{quantity} Pieces</span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isQuantityDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        // Debug: Log current state
                        console.log('Current selection state:', {
                          selectedVariation,
                          technique,
                          selectedSize,
                          selectedPosition,
                          productId: product.id
                        });

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

                        console.log('Adding to cart with data:', {
                          id: productIdToUse,
                          quantity: quantity,
                          attributes: variationAttributes,
                          isNoprint: technique === 'no-print',
                          productId: product.id,
                          variationId: selectedVariation?.id
                        });

                        const res = await addToCart(
                          productIdToUse,
                          quantity,
                          variationAttributes
                        );

                        console.log("Cart response:", res);

                        // Show success message
                        if (res.error) {
                          alert('Error: ' + res.message);
                        } else {
                          alert('Product added to cart successfully!');
                        }
                      } catch (err) {
                        console.error("Failed to add to cart:", err);
                        alert('Failed to add product to cart: ' + err.message);
                      }
                    }}
                    className="bg-[#FF6600] font-semibold text-white px-6 py-2 hover:bg-orange-600 transition-colors"
                  >
                    Add to cart
                  </button>
                </div>

                <QuantityModal
                  isQuantityDropdownOpen={isQuantityDropdownOpen}
                  setIsQuantityDropdownOpen={setIsQuantityDropdownOpen}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  customQuantity={customQuantity}
                  setCustomQuantity={setCustomQuantity}
                  quantityPricing={quantityPricing}
                  isLoadingPricing={isLoadingPricing}
                  QUANTITY_TIERS={QUANTITY_TIERS}
                />
              </div>

              {/* Pricing */}
              <div>
                {mockVariationData ? (
                  <ProductPricing product={product} selectedVariation={mockVariationData} quantity={quantity} selectedTechnique={technique} userRole={userRole} />
                ) : (
                  <p className="text-center text-gray-500">Please select product options to view pricing.</p>
                )}
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

        {/* Interest Modal */}
        <InterestModal isOpen={isInterestModalOpen} onClose={() => setIsInterestModalOpen(false)} />
      </div>
    </section>
  );
}
