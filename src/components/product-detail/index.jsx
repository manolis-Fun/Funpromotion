"use client";

import { useState, useEffect, useMemo } from "react";
import ImageSection from "./image-section";
import Breadcrumbs from "./breadcrumbs";
import PrintingOptionIcons from "./printing-option-icons";
import PrintPositionDropdown from "./print-position-dropdown";
import CombineProducts from "./combine-products";

import {
  uniqueTechniques,
  uniquePositions,
  uniqueSizes,
  uniqueExtras,
  formatTechniqueLabel,
  getTechniqueColors,
  formatAttributeValue,
  findCheapestCombination,
  findCheapestForConstraints,
} from "@/utils/helpers";
import QuantityModal from "./quantity-modal";
import QuantityPricingModal from "./quantity-pricing-modal";
import QuantityDropdown from "./quantity-dropdown";
import InterestModal from "./interest-modal";
import MessageIcon from "@/icons/message-icon";
import { addToCart } from "@/utils/cart";
import { ChevronRightIcon, ChevronLeftIcon, CalculatorIcon } from "@heroicons/react/24/outline";

// Import new pricing system
import {
  calculateProductPricing,
  calculateMultipleQuantities,
  formatPrice
} from "@/utils/calculate-pricing";

// Import shipping calculation system
import {
  calculateProductShipping,
  getShippingOptions,
  formatShippingDays
} from "@/utils/calculate-shipping-days";

// Import shipping cost calculation system
import {
  calculateProductShippingCost,
  getShippingCostBreakdown,
  formatShippingCost
} from "@/utils/calculate-shipping-cost";
import SimilarProducts from "./similar-products";
import ProductBanner from '../product-banner';

// Base quantity tiers
const QUANTITY_TIERS = [
  { quantity: 50 },
  { quantity: 100 },
  { quantity: 250 },
  { quantity: 500 },
  { quantity: 1000 },
  { quantity: 2500 },
];

// Function to format delivery date range
const formatDeliveryDateRange = (days) => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + days);

  // Add 1-2 days for delivery window
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDate = (date) => {
    const day = dayNames[date.getDay()];
    const dateNum = date.getDate();
    const month = date.getMonth() + 1;
    return `${day} ${dateNum}/${month}`;
  };

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

// Normalization helpers
const norm = (v) => String(v ?? "").trim().toLowerCase();
const decodeMaybe = (v) => {
  try { return decodeURIComponent(v); } catch { return v; }
};

const normalizeVariation = (v) => {
  const map = Object.fromEntries(
    (v.attributes?.nodes || v.attributes || []).map(({ label, value }) => [
      norm(label),
      decodeMaybe(norm(value)),
    ])
  );
  return { ...v, __attrs: map };
};

export default function ProductDetails({
  product,
  priceMarkups: initialPriceMarkups = null,
  priceMultipliers: initialPriceMultipliers = null,
  quantityDefaults,
  shippingCosts: initialShippingCosts = null,
  shippingDays: initialShippingDays = null,
}) {
  const mainImage = product.images?.[0] || "/placeholder.jpg";
  const galleryImages = product.galleryImages?.length
    ? product.galleryImages
    : product.images || [];

  const [selectedImage, setSelectedImage] = useState(mainImage);
  const [quantity, setQuantity] = useState(100);
  const [customQuantity, setCustomQuantity] = useState("");
  const [isQuantityDropdownOpen, setIsQuantityDropdownOpen] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isPricingPanelOpen, setIsPricingPanelOpen] = useState(false);
  const [isShippingPanelOpen, setIsShippingPanelOpen] = useState(false);
  const [isShippingCostPanelOpen, setIsShippingCostPanelOpen] = useState(false);
  const [isPriceFluctuationModalOpen, setIsPriceFluctuationModalOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Dynamic data state (lazy loaded)
  const [priceMarkups, setPriceMarkups] = useState(initialPriceMarkups);
  const [priceMultipliers, setPriceMultipliers] = useState(initialPriceMultipliers);
  const [shippingCosts, setShippingCosts] = useState(initialShippingCosts);
  const [shippingDays, setShippingDays] = useState(initialShippingDays);
  const [stockQuantity, setStockQuantity] = useState(product.stockQuantity);
  const [isDynamicDataLoading, setIsDynamicDataLoading] = useState(true);

  // Pricing state
  const [currentPricing, setCurrentPricing] = useState(null);
  const [quantityPricing, setQuantityPricing] = useState([]);

  // Shipping state
  const [currentShipping, setCurrentShipping] = useState(null);
  const [shippingOptions, setShippingOptions] = useState(null);

  // Shipping cost state
  const [currentShippingCost, setCurrentShippingCost] = useState(null);
  const [shippingCostBreakdown, setShippingCostBreakdown] = useState(null);

  // Normalize variations once
  const variations = useMemo(
    () => (product.variations || []).map(normalizeVariation),
    [product.variations]
  );

  // Selections
  const [technique, setTechnique] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedExtra, setSelectedExtra] = useState("");

  // Option lists
  const techniques = useMemo(() => uniqueTechniques(variations), [variations]);

  const availableColors = useMemo(() => {
    const set = new Set();
    for (const v of variations) {
      const a = v.__attrs;
      const color = a.color || a.colour || "";
      if (color) set.add(color);
    }
    return Array.from(set);
  }, [variations]);

  const positions = useMemo(() => {
    const filtered = variations.filter((v) => {
      const a = v.__attrs;
      const colorMatch =
        !selectedColor || a.color === selectedColor || a.colour === selectedColor;
      return a.technique === technique && colorMatch;
    });
    return uniquePositions(filtered);
  }, [variations, technique, selectedColor]);

  const sizes = useMemo(() => {
    const filtered = variations.filter((v) => {
      const a = v.__attrs;
      const colorMatch =
        !selectedColor || a.color === selectedColor || a.colour === selectedColor;
      const posOk = positions.length <= 1 || a.position === selectedPosition;
      return a.technique === technique && colorMatch && posOk;
    });
    return uniqueSizes(filtered);
  }, [variations, technique, positions, selectedPosition, selectedColor]);

  const extras = useMemo(() => {
    const filtered = variations.filter((v) => {
      const a = v.__attrs;
      const colorMatch =
        !selectedColor || a.color === selectedColor || a.colour === selectedColor;
      const posOk = positions.length <= 1 || a.position === selectedPosition;
      const sizeOk = sizes.length <= 1 || a.size === selectedSize;
      return a.technique === technique && colorMatch && posOk && sizeOk;
    });
    return uniqueExtras(filtered);
  }, [variations, technique, positions, selectedPosition, sizes, selectedSize, selectedColor]);

  // Helper to set cheapest option
  const setCheapest = ({
    constraints = {},
    qty = quantity,
    overwrite = { position: true, size: true, extra: true, color: true },
  } = {}) => {
    const cheapest = findCheapestForConstraints(
      variations,
      constraints,
      qty,
      product.priceMain,
      product.singleProductFields?.brand,
      product.singleProductFields?.manipulation
    );
    if (!cheapest) return;

    const tech = norm(cheapest.technique || "");
    const pos = norm(cheapest.position || "");
    const size = decodeMaybe(norm(cheapest.size || ""));
    const ext = norm(cheapest.extra || "");

    if (constraints.technique) setTechnique(norm(constraints.technique));
    else if (tech) setTechnique(tech);

    if (overwrite.position) setSelectedPosition(pos);
    if (overwrite.size) setSelectedSize(size);
    if (overwrite.extra) setSelectedExtra(ext);

    if (overwrite.color) {
      const chosen = variations.find((v) => {
        const a = v.__attrs;
        return (
          a.technique === tech &&
          (!pos || a.position === pos) &&
          (!size || a.size === size) &&
          (!ext || a.extra === ext)
        );
      });
      if (chosen) {
        const c = chosen.__attrs.color || chosen.__attrs.colour || "";
        if (c) setSelectedColor(c);
      }
    }
  };

  // Lazy load dynamic data after page is fully loaded
  useEffect(() => {
    // Wait for page to fully load
    if (typeof window === 'undefined') return;

    const loadDynamicData = async () => {
      try {
        setIsDynamicDataLoading(true);

        const response = await fetch(
          `/api/product-dynamic-data?productId=${product.id}`,
          {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch dynamic data');
        }

        const data = await response.json();

        // Update dynamic data
        if (data.priceMarkups) setPriceMarkups(data.priceMarkups);
        if (data.priceMultipliers) setPriceMultipliers(data.priceMultipliers);
        if (data.shippingCosts) setShippingCosts(data.shippingCosts);
        if (data.shippingDays) setShippingDays(data.shippingDays);
        if (data.stockQuantity !== undefined) setStockQuantity(data.stockQuantity);
      } catch (error) {
        console.error('Error loading dynamic data:', error);
      } finally {
        setIsDynamicDataLoading(false);
      }
    };

    // Use requestIdleCallback for better performance, fallback to setTimeout
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => loadDynamicData());
    } else {
      setTimeout(loadDynamicData, 100);
    }
  }, [product.id]);

  // Initial setup
  useEffect(() => {
    if (!variations?.length) return;

    const fastest = findCheapestCombination(
      variations,
      quantity,
      product.priceMain,
      product.singleProductFields?.brand,
      product.singleProductFields?.manipulation
    );

    if (fastest?.technique) {
      setTechnique(norm(fastest.technique || ""));
      setSelectedPosition(norm(fastest.position || ""));
      setSelectedSize(decodeMaybe(norm(fastest.size || "")));
      setSelectedExtra(norm(fastest.extra || ""));

      const chosen = variations.find((vv) => {
        const a = vv.__attrs;
        return (
          a.technique === norm(fastest.technique) &&
          (!fastest.position || a.position === norm(fastest.position)) &&
          (!fastest.size || a.size === decodeMaybe(norm(fastest.size))) &&
          (!fastest.extra || a.extra === norm(fastest.extra))
        );
      });
      if (chosen) {
        const c = chosen.__attrs.color || chosen.__attrs.colour || "";
        if (c) setSelectedColor(c);
      }
    } else {
      setCheapest({ constraints: {}, qty: quantity });
    }
  }, [variations, product.priceMain, product.singleProductFields?.brand, product.singleProductFields?.manipulation]);

  // Calculate pricing using new system
  const calculatePricing = () => {
    const selection = {
      technique,
      position: selectedPosition,
      size: selectedSize,
      extra: selectedExtra
    };

    // Calculate current price
    const pricing = calculateProductPricing({
      product,
      selection,
      quantity,
      priceMultipliers,
      priceMarkups
    });

    setCurrentPricing(pricing);

    // Calculate prices for all quantity tiers
    const quantities = QUANTITY_TIERS.map(t => t.quantity);
    const multiPricing = calculateMultipleQuantities(
      { product, selection, priceMultipliers, priceMarkups },
      quantities
    );

    setQuantityPricing(multiPricing);

    // Calculate shipping days
    try {
      const shipping = calculateProductShipping({
        product,
        selection,
        quantity,
        shippingDays
      });

      setCurrentShipping(shipping);
      setShippingOptions(getShippingOptions(shipping));
    } catch (error) {
      console.warn('Shipping calculation failed:', error);
      setCurrentShipping(null);
      setShippingOptions(null);
    }

    // Calculate shipping cost
    try {
      const shippingCostResult = calculateProductShippingCost({
        product,
        quantity,
        shippingCosts
      });

      setCurrentShippingCost(shippingCostResult);
      setShippingCostBreakdown(getShippingCostBreakdown(shippingCostResult));
    } catch (error) {
      console.warn('Shipping cost calculation failed:', error);
      setCurrentShippingCost(null);
      setShippingCostBreakdown(null);
    }
  };

  // Ready to calculate pricing?
  const readyToPrice =
    !!technique &&
    (positions.length <= 1 || !!selectedPosition) &&
    (sizes.length <= 1 || !!selectedSize) &&
    (extras.length <= 1 || !!selectedExtra) &&
    !isDynamicDataLoading &&
    priceMarkups &&
    priceMultipliers;

  // Calculate pricing when selections change
  useEffect(() => {
    if (!readyToPrice) return;
    calculatePricing();
  }, [
    readyToPrice,
    quantity,
    technique,
    selectedPosition,
    selectedSize,
    selectedExtra,
    selectedColor,
    isDynamicDataLoading,
    priceMarkups,
    priceMultipliers,
    shippingCosts,
    shippingDays,
  ]);

  // Handlers for selection changes
  const handleTechniqueChange = (newTechnique) => {
    const t = norm(newTechnique);
    setTechnique(t);
    setCheapest({
      constraints: {
        technique: t,
        ...(selectedColor ? { color: selectedColor, colour: selectedColor } : {}),
      },
      overwrite: { position: true, size: true, extra: true, color: true },
    });
  };

  const handleColorChange = (newColorRaw) => {
    const newColor = norm(newColorRaw);
    setSelectedColor(newColor);
    setCheapest({
      constraints: {
        technique,
        ...(newColor ? { color: newColor, colour: newColor } : {}),
      },
      overwrite: { position: true, size: true, extra: true, color: false },
    });
  };

  const handlePositionChange = (newPositionRaw) => {
    const newPosition = norm(newPositionRaw);
    setSelectedPosition(newPosition);

    // Check if current size and extra are still valid for the new position
    const validVariations = variations.filter((v) => {
      const a = v.__attrs;
      const colorMatch = !selectedColor || a.color === selectedColor || a.colour === selectedColor;
      return a.technique === technique && a.position === newPosition && colorMatch;
    });

    const currentSizeValid = validVariations.some(v => v.__attrs.size === selectedSize);
    const currentExtraValid = validVariations.some(v => v.__attrs.extra === selectedExtra);

    // Only reset size/extra if current selections are invalid for the new position
    if (!currentSizeValid || !currentExtraValid) {
      setCheapest({
        constraints: {
          technique,
          position: newPosition,
          ...(selectedColor ? { color: selectedColor, colour: selectedColor } : {}),
        },
        overwrite: {
          position: false,
          size: !currentSizeValid,
          extra: !currentExtraValid,
          color: false
        },
      });
    }
  };

  const handleSizeChange = (newSizeRaw) => {
    const newSize = decodeMaybe(norm(newSizeRaw));
    setSelectedSize(newSize);

    // Check if current extra is still valid for the new size
    const validVariations = variations.filter((v) => {
      const a = v.__attrs;
      const colorMatch = !selectedColor || a.color === selectedColor || a.colour === selectedColor;
      const posOk = positions.length <= 1 || a.position === selectedPosition;
      return a.technique === technique && colorMatch && posOk && a.size === newSize;
    });

    const currentExtraValid = validVariations.some(v => v.__attrs.extra === selectedExtra);

    // Only reset extra if current selection is invalid for the new size
    if (!currentExtraValid) {
      setCheapest({
        constraints: {
          technique,
          position: selectedPosition,
          size: newSize,
          ...(selectedColor ? { color: selectedColor, colour: selectedColor } : {}),
        },
        overwrite: { position: false, size: false, extra: true, color: false },
      });
    }
  };

  const handleExtraChange = (newExtraRaw) => {
    setSelectedExtra(norm(newExtraRaw));
  };

  // Selected variation
  const selectedVariation = useMemo(() => {
    const candidate = variations.find((v) => {
      const a = v.__attrs;
      const colorMatches =
        !selectedColor || a.color === selectedColor || a.colour === selectedColor;
      const posOk = positions.length <= 1 || a.position === selectedPosition;
      const sizeOk =
        sizes.length <= 1 ||
        a.size === selectedSize ||
        (!a.size && !selectedSize);
      const extraOk = extras.length <= 1 || a.extra === selectedExtra;

      return colorMatches && a.technique === technique && posOk && sizeOk && extraOk;
    });

    return candidate || null;
  }, [
    variations,
    technique,
    selectedPosition,
    selectedSize,
    selectedExtra,
    sizes,
    positions,
    extras,
    selectedColor,
  ]);
  console.log("single Product------------>", product)
  return (
    <section className="bg-[#f8f8f8] pt-44">
      <div className="max-w-[1370px] mx-auto px-4 py-8">
        <Breadcrumbs product={product} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ImageSection
            product={product}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            mainImage={mainImage}
            galleryImages={galleryImages}
          />
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <div className="flex items-center justify-between">
              <p className="text-sm">
                product code: <span className="text-gray-600">{product.productCode}</span>
              </p>
              <div className=" text-gray-500 font-semibold">
                {isDynamicDataLoading ? (
                  <span className="animate-pulse">Loading stock...</span>
                ) : (
                  <>
                    <span className="text-orange-500 font-medium">{stockQuantity}</span> In Stock
                  </>
                )}
              </div>
            </div>
            <div>
              {product?.description && (
                <div className="text-gray-700">
                  {(() => {
                    // Strip HTML tags for character counting
                    const plainText = product.description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
                    const shouldTruncate = plainText.length > 200;

                    if (!shouldTruncate) {
                      return (
                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                      );
                    }

                    if (!isDescriptionExpanded) {
                      // Get first 200 characters of plain text
                      const truncatedText = plainText.substring(0, 200).trim();

                      return (
                        <span>
                          {truncatedText}... {' '}
                          <button
                            onClick={() => setIsDescriptionExpanded(true)}
                            className="text-gray-700 hover:text-gray-900 font-semibold"
                          >
                            Read more
                          </button>
                        </span>
                      );
                    }

                    return (
                      <div>
                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                        <button
                          onClick={() => setIsDescriptionExpanded(false)}
                          className="text-gray-700 hover:text-gray-900 font-semibold mt-2 inline-block"
                        >
                          Show less
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="space-y-6">
              {/* Technique */}
              {techniques.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">PRINTING TECHNIQUE</h3>

                  {/* Desktop view - horizontal layout */}
                  <div className="hidden lg:flex border border-gray-200 rounded-lg justify-between overflow-hidden w-fit bg-white">
                    {techniques.map((techniqueValue) => {
                      const isActive = norm(techniqueValue) === technique;
                      return (
                        <button
                          key={techniqueValue}
                          onClick={() => handleTechniqueChange(techniqueValue)}
                          aria-pressed={isActive}
                          className={[
                            "group relative flex flex-col items-center py-3 text-black",
                            isActive ? "px-10" : "px-[18px] ",
                            "transition-all duration-300 ease-out",
                            "hover:bg-[#EAEAEA] ",
                            "",
                            isActive ? "bg-[#EAEAEA]  ring-black/5 " : "bg-white"
                          ].join(" ")}
                        >
                          <div className="transition-transform duration-300  ">
                            <PrintingOptionIcons colors={getTechniqueColors(techniqueValue)} />
                          </div>

                          <span
                            className={[
                              "text-xs mt-1 transition-colors duration-300",
                              " ",
                              isActive ? "text-black" : "text-gray-700"
                            ].join(" ")}
                          >
                            {formatTechniqueLabel(techniqueValue)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile/Tablet view - slider */}
                  <div className="lg:hidden">
                    <div
                      ref={(el) => {
                        if (el && technique) {
                          const activeIndex = techniques.findIndex(t => norm(t) === technique);
                          if (activeIndex !== -1) {
                            const buttons = el.querySelectorAll('button');
                            const activeButton = buttons[activeIndex];
                            if (activeButton) {
                              const containerWidth = el.offsetWidth;
                              const buttonLeft = activeButton.offsetLeft;
                              const buttonWidth = activeButton.offsetWidth;
                              const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
                              el.scrollTo({ left: scrollPosition, behavior: 'smooth' });
                            }
                          }
                        }
                      }}
                      className="flex border border-gray-200 rounded-lg overflow-x-auto w-full bg-white scrollbar-hide"
                    >
                      {techniques.map((techniqueValue) => {
                        const isActive = norm(techniqueValue) === technique;
                        return (
                          <button
                            key={techniqueValue}
                            onClick={() => handleTechniqueChange(techniqueValue)}
                            aria-pressed={isActive}
                            className={[
                              "group relative flex flex-col items-center py-3 text-black flex-shrink-0",
                              isActive ? "px-10" : "px-[18px]",
                              "transition-all duration-300 ease-out",
                              "hover:bg-[#EAEAEA]",
                              "",
                              isActive ? "bg-[#EAEAEA] ring-black/5" : "bg-white"
                            ].join(" ")}
                          >
                            <div className="transition-transform duration-300">
                              <PrintingOptionIcons colors={getTechniqueColors(techniqueValue)} />
                            </div>

                            <span
                              className={[
                                "text-xs mt-1 transition-colors duration-300",
                                "",
                                isActive ? "text-black" : "text-gray-700"
                              ].join(" ")}
                            >
                              {formatTechniqueLabel(techniqueValue)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}


              {/* Color */}
              {availableColors.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">COLOR</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleColorChange(c)}
                        className={`px-3 py-2 rounded border ${selectedColor === c ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white"}`}
                        title={c}
                      >
                        {formatAttributeValue(c)}
                      </button>
                    ))}
                    {selectedColor && (
                      <button
                        onClick={() => handleColorChange("")}
                        className="px-3 py-2 rounded border border-gray-300 bg-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Position */}
              {technique !== "no-print" && positions.length > 0 && !(positions.length === 1 && positions[0] === "") && (
                <PrintPositionDropdown
                  positions={positions}
                  selectedPosition={selectedPosition}
                  onPositionChange={handlePositionChange}
                  technique={technique}
                  variations={variations}
                  product={product}
                />
              )}

              {/* Size */}
              {technique !== "no-print" && sizes.length > 0 && !(sizes.length === 1 && sizes[0] === "") && (
                <div>
                  <h3 className="font-medium mb-3 text-lg">Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${selectedSize === norm(decodeMaybe(size))
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

              {/* Extras */}
              {technique !== "no-print" && extras.length > 0 && !(extras.length === 1 && extras[0] === "") && (
                <div>
                  <h3 className="font-medium mb-3 text-lg">EXTRAS</h3>
                  <div className="flex flex-wrap gap-3">
                    {extras.map((extra) => (
                      <button
                        key={extra || "nothing"}
                        onClick={() => handleExtraChange(extra)}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${selectedExtra === norm(extra)
                          ? "bg-white border-orange-500 text-gray-800"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                      >
                        {formatAttributeValue(extra).replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Pricing */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 items-start">
                  <QuantityDropdown
                    quantity={quantity}
                    setQuantity={setQuantity}
                    onDropdownOpen={() => { }}
                    productPrices={quantityPricing}
                  />

                  <button
                    onClick={async () => {
                      try {
                        let productIdToUse;
                        let variationAttributes = null;

                        if (technique === "no-print") {
                          productIdToUse = product.id;
                          variationAttributes = null;
                        } else {
                          const v = selectedVariation;
                          productIdToUse = v?.id || product.id;

                          if (variations.length > 0 && !v) {
                            alert("Please select all product options before adding to cart.");
                            return;
                          }

                          if (v?.attributes) {
                            variationAttributes = {};
                            (v.attributes?.nodes || v.attributes || []).forEach((attr) => {
                              if (attr.value && attr.value.trim() !== "") {
                                const attributeKey = `attribute_${attr.label.toLowerCase()}`;
                                variationAttributes[attributeKey] = attr.value;
                              }
                            });
                            if (!Object.keys(variationAttributes).length) variationAttributes = null;
                          }
                        }

                        const res = await addToCart(productIdToUse, quantity, variationAttributes);
                        if (res.error) alert("Error: " + res.message);
                        else alert("Product added to cart successfully!");
                      } catch (err) {
                        alert("Failed to add product to cart: " + err.message);
                      }
                    }}
                    className="bg-[#FF6600] font-semibold rounded-md text-white px-6 py-2 hover:bg-orange-600 transition-colors"
                  >
                    Add to cart
                  </button>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-6 w-full">
                  {/* Pricing Display */}
                  {isDynamicDataLoading ? (
                    <div className="w-full lg:w-[40%] p-4 bg-white rounded-lg border border-gray-200">
                      <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ) : currentPricing ? (
                    <div className="w-full lg:w-[40%] p-4 bg-white rounded-lg border border-gray-200  ">
                      <div className="flex items-center gap-2 mb-4">
                        <img src="https://p2p2k2n4.delivery.rocketcdn.me/wp-content/uploads/2023/10/price_per-icon.png" />
                        <span className="text-gray-700  font-medium">Price / pc.:</span>
                        <span className="text-[17px] font-bold text-orange-500">
                          {formatPrice(currentPricing.totalPrice).replace('€', '')} €
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-4 pt-4">
                        <img src="https://p2p2k2n4.delivery.rocketcdn.me/wp-content/uploads/2023/10/price_per-icon.png" />
                        <span className="text-gray-700 font-medium">Total:</span>
                        <span className="text-[17px] font-medium text-gray-800">
                          €{(currentPricing.totalPrice * quantity).toFixed(2)} + VAT
                        </span>
                      </div>

                      <button
                        onClick={() => setIsPriceFluctuationModalOpen(true)}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                        Price fluctuation
                      </button>
                    </div>
                  ) : null}

                  {/* Shipping Information */}
                  {isDynamicDataLoading ? (
                    <div className="w-full lg:w-[60%] grid grid-cols-2 gap-x-8 bg-white border border-gray-200 rounded-lg p-4">
                      <div className="animate-pulse space-y-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="animate-pulse space-y-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ) : shippingOptions && currentShipping ? (
                    <div className="w-full lg:w-[60%] grid grid-cols-2 gap-x-8 bg-white border border-gray-200 rounded-lg p-4 ">
                      <div className="group transition-all flex flex-col items-center">
                        <div className="flex justify-center mb-3">
                          <div className="w-12 h-12 bg-gray-300 cursor-pointer group-hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors">
                            <img src="https://p2p2k2n4.delivery.rocketcdn.me/wp-content/uploads/2023/10/shipping-regular.png" />
                          </div>
                        </div>
                        <h5 className="text-center font-semibold text-gray-800 mb-2">Simple delivery</h5>
                        <p className="text-center text-sm text-gray-600 mb-2">{formatDeliveryDateRange(currentShipping.deliveryDays.standard)}</p>
                        <p className="text-center text-base font-bold text-purple-600">
                          {currentShippingCost && currentShippingCost.total > 0
                            ? formatShippingCost(currentShippingCost.total)
                            : 'Free'}
                        </p>
                      </div>

                      <div className="group transition-all flex flex-col items-center">
                        <div className="flex justify-center mb-3">
                          <div className="w-12 h-12 bg-gray-300 cursor-pointer group-hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors">
                            <img src="https://p2p2k2n4.delivery.rocketcdn.me/wp-content/uploads/2023/10/shipping-express.png" />
                          </div>
                        </div>
                        <h5 className="text-center font-semibold text-gray-800 mb-2">Express delivery</h5>
                        <p className="text-center text-sm text-gray-600 mb-2">{formatDeliveryDateRange(currentShipping.deliveryDays.express)}</p>
                        <p className="text-center text-base font-bold text-purple-600">Contact us</p>
                      </div>
                    </div>
                  ) : null}

                </div>

                {/* Toggle Buttons */}
                <div className="flex flex-col lg:flex-row gap-2 mt-4">
                  {currentPricing && (
                    <button
                      onClick={() => setIsPricingPanelOpen(!isPricingPanelOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <CalculatorIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Show Pricing Formula</span>
                    </button>
                  )}

                  {shippingOptions && (
                    <button
                      onClick={() => setIsShippingPanelOpen(!isShippingPanelOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium">Show Shipping Formula</span>
                    </button>
                  )}

                  {shippingCostBreakdown && (
                    <button
                      onClick={() => setIsShippingCostPanelOpen(!isShippingCostPanelOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-sm font-medium">Show Shipping Cost Formula</span>
                    </button>
                  )}
                </div>

                <QuantityPricingModal
                  isOpen={isPricingModalOpen}
                  onClose={() => setIsPricingModalOpen(false)}
                  quantity={quantity}
                  setQuantity={setQuantity}
                />

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

        <InterestModal isOpen={isInterestModalOpen} onClose={() => setIsInterestModalOpen(false)} />

        {/* Collapsible Pricing Breakdown Side Panel */}
        <div className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-300 shadow-xl transform transition-transform duration-300 z-[9999] ${isPricingPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <CalculatorIcon className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Pricing Formula</h3>
              </div>
              <button
                onClick={() => setIsPricingPanelOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentPricing && (
                <div className="space-y-6">
                  {/* Formula Steps */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">Step-by-Step Calculation</h4>

                    {/* Step 1: Product Price */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">1. Final Product Price (no print)</h5>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Formula:</strong> Base Price × Brand Multiplier × Product Multiplier
                      </div>
                      <div className="text-sm bg-white p-2 rounded border font-mono">
                        {formatPrice(currentPricing.basePrice)} × {currentPricing.brandMultiplier} × {currentPricing.productMultiplier} = <strong>{formatPrice(currentPricing.finalProductPrice)}</strong>
                      </div>
                    </div>

                    {technique !== "no-print" && (
                      <>
                        {/* Step 2: Printing Cost */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-2">2. Printing Cost (before multiplier)</h5>
                          <div className="text-sm text-gray-700 mb-2">
                            <strong>Formula:</strong> Handle Cost + Printing for Qty + (Setup Cost ÷ Quantity)
                          </div>
                          <div className="text-sm bg-white p-2 rounded border font-mono">
                            {formatPrice(currentPricing.handleCost)} + {formatPrice(currentPricing.printingForQty)} + ({formatPrice(currentPricing.setupCost)} ÷ {quantity}) = <strong>{formatPrice(currentPricing.printingCost)}</strong>
                          </div>
                        </div>

                        {/* Step 3: Final Printing Cost */}
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h5 className="font-medium text-purple-800 mb-2">3. Final Printing Cost (after multiplier)</h5>
                          <div className="text-sm text-gray-700 mb-2">
                            <strong>Formula:</strong> Printing Cost × Print Multiplier
                          </div>
                          <div className="text-sm bg-white p-2 rounded border font-mono">
                            {formatPrice(currentPricing.printingCost)} × {currentPricing.printMultiplier} = <strong>{formatPrice(currentPricing.finalPrintingCost)}</strong>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Step 4: Total */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h5 className="font-medium text-orange-800 mb-2">4. Total Price</h5>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Formula:</strong> Final Product Price + Final Printing Cost
                      </div>
                      <div className="text-sm bg-white p-2 rounded border font-mono">
                        {formatPrice(currentPricing.finalProductPrice)} + {technique !== "no-print" ? formatPrice(currentPricing.finalPrintingCost) : formatPrice(0)} = <strong className="text-orange-600">{formatPrice(currentPricing.totalPrice)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Values Table */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Current Values</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-medium">{quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Price:</span>
                          <span className="font-medium">{formatPrice(currentPricing.basePrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Brand Multiplier:</span>
                          <span className="font-medium">×{currentPricing.brandMultiplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Product Multiplier:</span>
                          <span className="font-medium">×{currentPricing.productMultiplier}</span>
                        </div>
                        {technique !== "no-print" && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Handle Cost:</span>
                              <span className="font-medium">{formatPrice(currentPricing.handleCost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Printing Cost:</span>
                              <span className="font-medium">{formatPrice(currentPricing.printingForQty)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Setup Cost:</span>
                              <span className="font-medium">{formatPrice(currentPricing.setupCost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Print Multiplier:</span>
                              <span className="font-medium">×{currentPricing.printMultiplier}</span>
                            </div>
                          </>
                        )}
                        <div className="col-span-2 border-t pt-2 mt-2 flex justify-between font-semibold text-base">
                          <span>Total Price per Unit:</span>
                          <span className="text-orange-600">{formatPrice(currentPricing.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Breakdown Side Panel */}
        <div className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-300 shadow-xl transform transition-transform duration-300 z-[9999] ${isShippingPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Shipping Formula</h3>
              </div>
              <button
                onClick={() => setIsShippingPanelOpen(false)}
                className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentShipping && (
                <div className="space-y-6">
                  {/* Formula Overview */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Formula Overview</h4>
                    <div className="text-sm text-gray-700">
                      <div className="mb-2"><strong>Standard Shipping:</strong> Production Days + Standard Delivery = Total Days</div>
                      <div><strong>Express Shipping:</strong> Production Days + Express Delivery = Total Days</div>
                    </div>
                  </div>

                  {/* Step-by-Step Calculation */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">Step-by-Step Calculation</h4>

                    {/* Production Days */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">1. Production Days</h5>
                      <div className="text-sm text-gray-700 mb-2">
                        Based on brand, technique, and quantity
                      </div>
                      <div className="text-sm bg-white p-2 rounded border font-mono">
                        <strong>{currentShipping.productionDays} days</strong>
                      </div>
                    </div>

                    {/* Standard Shipping */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium text-purple-800 mb-2">2. Standard Shipping</h5>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Formula:</strong> Production Days + Standard Delivery Days
                      </div>
                      <div className="text-sm bg-white p-2 rounded border font-mono">
                        {currentShipping.productionDays} + {currentShipping.deliveryDays.standard - currentShipping.productionDays} = <strong className="text-purple-600">{currentShipping.deliveryDays.standard} days</strong>
                      </div>
                    </div>

                    {/* Express Shipping */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h5 className="font-medium text-orange-800 mb-2">3. Express Shipping</h5>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Formula:</strong> Production Days + Express Delivery Days
                      </div>
                      <div className="text-sm bg-white p-2 rounded border font-mono">
                        {currentShipping.productionDays} + {currentShipping.deliveryDays.express - currentShipping.productionDays} = <strong className="text-orange-600">{currentShipping.deliveryDays.express} days</strong>
                      </div>
                    </div>
                  </div>

                  {/* Debug Information */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Calculation Details</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-medium">{quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity Bucket:</span>
                          <span className="font-medium">{currentShipping.debug.quantityBucket}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Brand Index:</span>
                          <span className="font-medium">{currentShipping.debug.brandIndex || 'Default'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Technique Index:</span>
                          <span className="font-medium">{currentShipping.debug.techniqueIndex || 'Default'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Standard Base:</span>
                          <span className="font-medium">{currentShipping.debug.standardAdd} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Express Base:</span>
                          <span className="font-medium">{currentShipping.debug.expressAdd} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Extra Standard:</span>
                          <span className="font-medium">{currentShipping.debug.extraStandardAdd} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Extra Express:</span>
                          <span className="font-medium">{currentShipping.debug.extraExpressAdd} days</span>
                        </div>

                        <div className="col-span-2 border-t pt-3 mt-3">
                          <div className="flex justify-between font-semibold text-base mb-2">
                            <span>Standard Total:</span>
                            <span className="text-purple-600">{currentShipping.deliveryDays.standard} days</span>
                          </div>
                          <div className="flex justify-between font-semibold text-base">
                            <span>Express Total:</span>
                            <span className="text-orange-600">{currentShipping.deliveryDays.express} days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Cost Breakdown Side Panel */}
        <div className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-300 shadow-xl transform transition-transform duration-300 z-[9999] ${isShippingCostPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-50">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Shipping Cost Formula</h3>
              </div>
              <button
                onClick={() => setIsShippingCostPanelOpen(false)}
                className="p-2 hover:bg-green-200 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentShippingCost && (
                <div className="space-y-6">
                  {/* Formula Overview */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Formula Overview</h4>
                    <div className="text-sm text-gray-700">
                      <div className="mb-2"><strong>Volume Calculation:</strong> Weight per Unit × Quantity = Volume (kg)</div>
                      <div className="mb-2"><strong>Range Matching:</strong> Find range where Volume fits</div>
                      <div className="mb-2"><strong>Billable Weight:</strong> max(0, Volume - Minus)</div>
                      <div><strong>Final Cost:</strong> (Fix + Billable × Cost) × Markup</div>
                    </div>
                  </div>

                  {/* Step-by-Step Calculation */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">Step-by-Step Calculation</h4>

                    {/* Step 1: Volume Calculation */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">1. Volume Calculation</h5>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Formula:</strong> Weight per Unit × Quantity {currentShippingCost.debug?.volumeKg > (product?.weight || 0) * quantity ? "(rounded up)" : ""}
                      </div>
                      <div className="text-sm bg-white p-2 rounded border font-mono">
                        {(product?.singleProductFields?.v1W1 || product?.weight || 0)}kg × {quantity} = <strong>{currentShippingCost.debug?.volumeKg}kg</strong>
                      </div>
                    </div>

                    {/* Step 2: Range Matching */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium text-purple-800 mb-2">2. Range Matching</h5>
                      <div className="text-sm text-gray-700 mb-2">
                        Found range for volume {currentShippingCost.debug?.volumeKg}kg
                      </div>
                      <div className="text-sm bg-white p-2 rounded border">
                        <div><strong>Range:</strong> {currentShippingCost.debug?.min}kg - {currentShippingCost.debug?.max ? `${currentShippingCost.debug.max}kg` : 'unlimited'}</div>
                        <div><strong>Minus:</strong> {currentShippingCost.debug?.minus}kg</div>
                        <div><strong>Cost per kg:</strong> {formatShippingCost(currentShippingCost.debug?.cost || 0)}</div>
                        <div><strong>Fixed cost:</strong> {formatShippingCost(currentShippingCost.debug?.fix || 0)}</div>
                      </div>
                    </div>

                    {/* Step 3: Billable Weight */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h5 className="font-medium text-yellow-800 mb-2">3. Billable Weight Calculation</h5>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Formula:</strong> max(0, Volume - Minus)
                      </div>
                      <div className="text-sm bg-white p-2 rounded border font-mono">
                        max(0, {currentShippingCost.debug?.volumeKg}kg - {currentShippingCost.debug?.minus}kg) = <strong>{currentShippingCost.debug?.billableKg}kg</strong>
                      </div>
                    </div>

                    {/* Step 4: Base Cost */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h5 className="font-medium text-orange-800 mb-2">4. Base Cost Calculation</h5>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Formula:</strong> Fixed Cost + (Billable Weight × Cost per kg)
                      </div>
                      <div className="text-sm bg-white p-2 rounded border font-mono">
                        {formatShippingCost(currentShippingCost.debug?.fix || 0)} + ({currentShippingCost.debug?.billableKg}kg × {formatShippingCost(currentShippingCost.debug?.cost || 0)}) = <strong>{formatShippingCost((currentShippingCost.debug?.fix || 0) + (currentShippingCost.debug?.billableKg || 0) * (currentShippingCost.debug?.cost || 0))}</strong>
                      </div>
                    </div>

                    {/* Step 5: Final Cost with Markup */}
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h5 className="font-medium text-red-800 mb-2">5. Final Cost (with Markup)</h5>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Formula:</strong> Base Cost × Markup
                      </div>
                      <div className="text-sm bg-white p-2 rounded border font-mono">
                        {formatShippingCost((currentShippingCost.debug?.fix || 0) + (currentShippingCost.debug?.billableKg || 0) * (currentShippingCost.debug?.cost || 0))} × {currentShippingCost.debug?.markup} = <strong className="text-red-600">{formatShippingCost(currentShippingCost.total)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Values Table */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Current Values</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-medium">{quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weight per Unit:</span>
                          <span className="font-medium">{product?.singleProductFields?.v1W1 || product?.weight || 0}kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Volume:</span>
                          <span className="font-medium">{currentShippingCost.debug?.volumeKg}kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Brand:</span>
                          <span className="font-medium">{product?.singleProductFields?.brand || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Range Index:</span>
                          <span className="font-medium">{currentShippingCost.debug?.rangeIndex}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minus Value:</span>
                          <span className="font-medium">{currentShippingCost.debug?.minus}kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost per kg:</span>
                          <span className="font-medium">{formatShippingCost(currentShippingCost.debug?.cost || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fixed Cost:</span>
                          <span className="font-medium">{formatShippingCost(currentShippingCost.debug?.fix || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Markup:</span>
                          <span className="font-medium">×{currentShippingCost.debug?.markup}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Billable Weight:</span>
                          <span className="font-medium">{currentShippingCost.debug?.billableKg}kg</span>
                        </div>

                        <div className="col-span-2 border-t pt-3 mt-3">
                          <div className="flex justify-between font-semibold text-base mb-2">
                            <span>Total Cost:</span>
                            <span className="text-green-600">{formatShippingCost(currentShippingCost.total)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-base">
                            <span>Cost per Unit:</span>
                            <span className="text-green-600">{formatShippingCost(currentShippingCost.perPiece)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Backdrops */}
        {isPricingPanelOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-[9998]"
            onClick={() => setIsPricingPanelOpen(false)}
          />
        )}
        {isShippingPanelOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-[9998]"
            onClick={() => setIsShippingPanelOpen(false)}
          />
        )}
        {isShippingCostPanelOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-[9998]"
            onClick={() => setIsShippingCostPanelOpen(false)}
          />
        )}

        {/* Price Fluctuation Modal */}
        {isPriceFluctuationModalOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
              onClick={() => setIsPriceFluctuationModalOpen(false)}
            />

            {/* Modal positioned on the right side */}
            <div className="fixed right-0 top-0 bottom-0 w-[500px] max-w-[400px] mx-auto bg-white shadow-2xl z-[9999] overflow-y-auto">
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setIsPriceFluctuationModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Subtitle */}
              <div className="px-6 py-3 border-b border-gray-100">
                <h3 className="font-manrope font-semibold text-[36px] leading-[50px] text-[#242424] mt-4">Price fluctuation</h3>
                <h3 className="font-manrope font-semibold text-[18px] leading-[25px] text-[#242424] my-4">Order big, save even bigger!</h3>
                <p className="font-normal text-[14px] leading-[22px] text-[#777777]">
                  As you increase the size of your order, the cost per item decreases.
                  This is based on a 1 color print and does not include set up fees.
                  The larger percentage savings occur at these quantities:
                </p>
              </div>

              {/* Pricing Table */}
              <div className="p-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left pb-3 font-semibold text-gray-700">PIECES</th>
                      <th className="text-center pb-3 font-semibold text-gray-700">PRICE</th>
                      <th className="text-right pb-3 font-semibold text-gray-700">DISCOUNT RATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[50, 100, 250, 500, 1000, 2500, 5000, 10000].map((qty) => {
                      const priceData = quantityPricing?.find(p => p.quantity === qty);
                      const basePrice = quantityPricing?.find(p => p.quantity === 50);

                      const currentPriceValue = priceData?.totalPrice || priceData?.finalProductPricePerUnit || 0;
                      const basePriceValue = basePrice?.totalPrice || basePrice?.finalProductPricePerUnit || 0;

                      let discount = 0;
                      if (basePriceValue > 0 && currentPriceValue > 0 && currentPriceValue < basePriceValue) {
                        discount = ((basePriceValue - currentPriceValue) / basePriceValue) * 100;
                      }

                      return (
                        <tr key={qty} className="hover:bg-gray-50">
                          <td className="py-3 text-gray-600">▸ {qty >= 1000 ? qty.toLocaleString() : qty}</td>
                          <td className="py-3 text-center text-gray-800 font-medium">
                            {currentPriceValue > 0 ? `${currentPriceValue.toFixed(2)} €` : '—'}
                          </td>
                          <td className="py-3 text-right text-orange-500 font-medium">
                            % {discount.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      <CombineProducts/>
      <ProductBanner product={product} />
      {/* Similar Products Section */}
      <SimilarProducts product={product} />
    </section>
  );
}