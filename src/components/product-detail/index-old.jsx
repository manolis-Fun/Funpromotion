
"use client";

import { useState, useEffect, useMemo } from "react";
import ImageSection from "./image-section";
import Breadcrumbs from "./breadcrumbs";
import PrintingOptionIcons from "./printing-option-icons";
import {
  translateSizeLabel,
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

// Base quantity tiers
const QUANTITY_TIERS = [
  { quantity: 50, staticDiscount: 0.0 },
  { quantity: 100, staticDiscount: 0.0 },
  { quantity: 250, staticDiscount: 0.0 },
  { quantity: 500, staticDiscount: 0.0 },
  { quantity: 1000, staticDiscount: 0.0 },
  { quantity: 2500, staticDiscount: 0.0 },
];

/** Normalization helpers to match API behavior */
const norm = (v) => String(v ?? "").trim().toLowerCase();
const decodeMaybe = (v) => {
  try { return decodeURIComponent(v); } catch { return v; }
};

/** Convert variation to a normalized attribute object once */
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
  priceMarkups,
  priceMultipliers,
  quantityDefaults,
  shippingCosts,
  shippingDays,
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
  const [productPrices, setProductPrices] = useState(null);

  // Normalize once, so all comparisons are stable
  const variations = useMemo(
    () => (product.variations || []).map(normalizeVariation),
    [product.variations]
  );

  // Selections, store normalized values
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
  }, [
    variations,
    technique,
    positions,
    selectedPosition,
    sizes,
    selectedSize,
    selectedColor,
  ]);

  /** Core: pick the cheapest for given constraints, then set state */
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

    // Always normalize incoming
    const tech = norm(cheapest.technique || "");
    const pos = norm(cheapest.position || "");
    const size = decodeMaybe(norm(cheapest.size || ""));
    const ext = norm(cheapest.extra || "");

    // Always keep chosen technique from constraints if present
    if (constraints.technique) setTechnique(norm(constraints.technique));
    else if (tech) setTechnique(tech);

    if (overwrite.position) setSelectedPosition(pos);
    if (overwrite.size) setSelectedSize(size);
    if (overwrite.extra) setSelectedExtra(ext);

    // Try to sync color from the chosen variation when allowed
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

  /** Initial cheapest on mount or when variations change */
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
      // Generic cheapest if nothing returned
      setCheapest({ constraints: {}, qty: quantity });
    }
  }, [
    variations,
    product.priceMain,
    product.singleProductFields?.brand,
    product.singleProductFields?.manipulation,
  ]);

  /** Re-pick cheapest when quantity changes, because tiers can flip */
  useEffect(() => {
    if (!variations?.length || !technique) return;
    setCheapest({
      constraints: {
        technique,
        ...(selectedColor ? { color: selectedColor, colour: selectedColor } : {}),
        ...(selectedPosition ? { position: selectedPosition } : {}),
        ...(selectedSize ? { size: selectedSize } : {}),
        ...(selectedExtra ? { extra: selectedExtra } : {}),
      },
      qty: quantity,
      // On qty change, allow all to update to current cheapest
      overwrite: { position: true, size: true, extra: true, color: false },
    });
  }, [quantity]);

  /** Handlers, always keep the user’s direct choice, then fill rest with cheapest */
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
    setCheapest({
      constraints: {
        technique,
        position: newPosition,
        ...(selectedColor ? { color: selectedColor, colour: selectedColor } : {}),
      },
      overwrite: { position: false, size: true, extra: true, color: false },
    });
  };

  const handleSizeChange = (newSizeRaw) => {
    const newSize = decodeMaybe(norm(newSizeRaw));
    setSelectedSize(newSize);
    setCheapest({
      constraints: {
        technique,
        position: selectedPosition,
        size: newSize,
        ...(selectedColor ? { color: selectedColor, colour: selectedColor } : {}),
      },
      overwrite: { position: false, size: false, extra: true, color: false },
    });
  };

  const handleExtraChange = (newExtraRaw) => {
    setSelectedExtra(norm(newExtraRaw));
    // Keep user chosen extra, no re-pick here
  };

  /** Selected variation with tolerant matching, include size empty fallback */
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

  /** Only call pricing when we actually have enough info */
  const readyToPrice =
    !!technique &&
    (positions.length <= 1 || !!selectedPosition) &&
    (sizes.length <= 1 || !!selectedSize) &&
    (extras.length <= 1 || !!selectedExtra);

  const callPricingAPIs = async (quantities = [quantity || 100]) => {
    try {
      let printPriceData = null;

      if (technique !== "no-print") {
        const printRequestBody = {
          quantity: quantities,
          technique: technique || "",
          position: selectedPosition,
          size: selectedSize,
          extra: selectedExtra,
          // send original shape, API expects nodes with metaData and attributes.nodes
          variations: product.variations || [],
          manipulation: product.singleProductFields?.manipulation,
          basePrice: product.priceMain,
          brand: product.singleProductFields?.brand,
          priceMultipliers: priceMultipliers, // Add priceMultipliers data
        };

        const printResponse = await fetch("/api/print-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(printRequestBody),
        });

        printPriceData = await printResponse.json();
      }

      const productPriceResults = [];

      for (const qty of quantities) {
        const printDataForQty = printPriceData?.pricing?.find((p) => p.quantity === qty);
        const printPricePerUnit = printDataForQty?.finalTotalPerUnit || 0;

        const productRequestBody = {
          totalPrintPricePerUnit: printPricePerUnit,
          quantity: [qty],
          brand: product.singleProductFields?.brand,
          basePrice: product.priceMain,
          priceMarkups: priceMarkups, // Add priceMarkups data for dynamic product markup
          priceMultipliers: priceMultipliers, // Add priceMultipliers data for dynamic brand markup
        };

        const productResponse = await fetch("/api/product-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productRequestBody),
        });

        const productPriceData = await productResponse.json();
        if (productPriceData.pricing?.length) {
          productPriceResults.push(productPriceData.pricing[0]);
        }
      }

      setProductPrices(productPriceResults);
    } catch (error) {
      console.error("Error in callPricingAPIs:", error);
    }
  };

  // Pricing trigger, debounced a bit
  useEffect(() => {
    if (!readyToPrice) return;
    const id = setTimeout(() => callPricingAPIs(), 80);
    return () => clearTimeout(id);
  }, [
    readyToPrice,
    quantity,
    technique,
    selectedPosition,
    selectedSize,
    selectedExtra,
    product.variations,
    selectedColor,
  ]);
 
   console.log("Single prodcut=========>", product)
  return (
    <section className="bg-[#f8f8f8] pt-44">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <p className="text-sm">
              Customer product code: <span className="text-gray-600">{product.id}</span>
            </p>
            <p className="text-sm">
              Supplier product code: <span className="text-red-500">{product?.supplierCode}</span>
            </p>
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full w-fit">
              <span className="text-orange-500 font-semibold">{product.stockQuantity}</span> In Stock
            </div>

            <div className="space-y-6">
              {/* Technique */}
              {techniques.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">PRINTING TECHNIQUE</h3>
                  <div className="flex border border-gray-200 rounded-lg justify-between overflow-hidden w-fit">
                    {techniques.map((techniqueValue) => (
                      <button
                        key={techniqueValue}
                        onClick={() => handleTechniqueChange(techniqueValue)}
                        className={`flex flex-col items-center px-[18px] py-3 text-black ${norm(techniqueValue) === technique ? "bg-[#F5F5F5]" : "bg-white"}`}
                      >
                        <PrintingOptionIcons colors={getTechniqueColors(techniqueValue)} />
                        <span className="text-xs">{formatTechniqueLabel(techniqueValue)}</span>
                      </button>
                    ))}
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
                <div>
                  <h3 className="font-medium mb-3">PRINT POSITION</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {positions.map((pos) => {
                      const positionVariation = variations.find(
                        (v) => v.__attrs.position === norm(pos) && v.__attrs.technique === technique
                      );
                      const positionSize = positionVariation?.__attrs.size || "";
                      const positionImage = product.images?.[0] || "/placeholder.jpg";
                      const sizeDisplay = positionSize ? translateSizeLabel(positionSize) : "Standard";

                      return (
                        <div key={pos} className="relative group">
                          <button
                            onClick={() => handlePositionChange(pos)}
                            className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                              selectedPosition === norm(pos) ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div className="w-16 h-16 mb-2 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                <img src={positionImage} alt={`${pos} position`} className="w-full h-full object-cover" />
                              </div>
                              <div className="text-xs font-bold text-gray-800 uppercase mb-1">{formatAttributeValue(pos)}</div>
                              <div className="text-xs text-gray-600">{sizeDisplay}</div>
                            </div>
                          </button>

                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                <img src={positionImage} alt={`${formatAttributeValue(pos)} position preview`} className="w-full h-full object-cover" />
                              </div>
                              <div className="mt-2 text-center">
                                <div className="text-sm font-medium text-gray-800">{formatAttributeValue(pos)}</div>
                                <div className="text-xs text-gray-600">{sizeDisplay}</div>
                              </div>
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

              {/* Size */}
              {technique !== "no-print" && sizes.length > 0 && !(sizes.length === 1 && sizes[0] === "") && (
                <div>
                  <h3 className="font-medium mb-3 text-lg">Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          selectedSize === norm(decodeMaybe(size))
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
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          selectedExtra === norm(extra)
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
                    onDropdownOpen={(quantities) => callPricingAPIs(quantities)}
                    productPrices={productPrices}
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
                    className="bg-[#FF6600] font-semibold text-white px-6 py-2 hover:bg-orange-600 transition-colors"
                  >
                    Add to cart
                  </button>
                </div>

                {productPrices && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                    {productPrices.map((productData, index) =>
                      productData.quantity === quantity ? (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600">{quantity} pieces</span>
                            <span className="text-xs text-gray-500">
                              €
                              {productData.finalProductPricePerUnit?.toFixed(2) || "0.00"} per unit
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              €{productData.finalProductPrice?.toFixed(2) || "0.00"}
                            </div>
                            {(() => {
                              const basePrice = productPrices.find((p) => p.quantity === 50);
                              if (!basePrice || !productData.finalProductPricePerUnit || !basePrice.finalProductPricePerUnit) {
                                return null;
                              }
                              const currentPriceValue = parseFloat(productData.finalProductPricePerUnit);
                              const basePriceValue = parseFloat(basePrice.finalProductPricePerUnit);
                              if (currentPriceValue >= basePriceValue) return null;
                              const discount = ((basePriceValue - currentPriceValue) / basePriceValue) * 100;
                              if (discount > 0.1) {
                                return <div className="text-sm text-green-600 font-medium">Save {discount.toFixed(1)}%</div>;
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                )}

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

        {/* Debug Panel */}
        <div className="fixed top-4 right-4 w-80 bg-orange-100 border-2 border-red-500 rounded-lg shadow-lg p-4 text-sm z-[99999] max-h-[calc(100vh-2rem)] overflow-y-auto">
          <h4 className="font-semibold text-red-600 mb-3">Debug Information</h4>

          <div className="space-y-2">
            <div><b>Base Price:</b> {product?.priceMain || "N/A"} €</div>
            <div>
              <b>Setup Cost per Unit:</b>{" "}
              {(() => {
                if (!selectedVariation) return "N/A";
                const metaData = selectedVariation.metaData || [];
                const setupCostData = metaData.find((m) => m.key === "_price_print_setup");
                const setupCost = setupCostData ? parseFloat(setupCostData.value) : null;
                const setupCostPerUnit = setupCost && quantity ? (setupCost / quantity).toFixed(4) : "N/A";
                return setupCostPerUnit !== "N/A" ? `${setupCostPerUnit} € (${setupCost}/${quantity})` : "N/A";
              })()}
            </div>

            <div>
              <b>Matched Variation:</b>{" "}
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
                          {attr.label === "technique"
                            ? formatTechniqueLabel(attr.value)
                            : attr.label === "size"
                            ? translateSizeLabel(attr.value)
                            : formatAttributeValue(attr.value, attr.label)}
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="text-xs font-medium text-blue-800">
                    Price for {quantity}pcs:{" "}
                    {(() => {
                      const metaData = selectedVariation.metaData || [];
                      const priceKey = metaData.find((m) => {
                        const key = m.key;
                        if (!key?.startsWith("_price_print_")) return false;
                        if (key.endsWith("_customer")) return false;
                        const match = key.match(/^_price_print_(\d+)_((\d+)|infinity)$/);
                        if (!match) return false;
                        const min = Number(match[1]);
                        const max = match[2] === "infinity" ? Infinity : Number(match[2]);
                        return quantity >= min && (max === Infinity ? true : quantity < max);
                      });
                      return priceKey ? `€${priceKey.value}` : "N/A";
                    })()}
                  </div>
                </div>
              ) : (
                "None"
              )}
            </div>

            <div>
              <b>Print Price:</b>{" "}
              {productPrices?.find((p) => p.quantity === quantity)?.printPricePerUnit?.toFixed(4) || "N/A"} €
            </div>
            <div><b>Handling Cost:</b> {product?.singleProductFields?.manipulation || 0} €</div>
            <div><b>Print Multiplier:</b> {productPrices?.find((p) => p.quantity === quantity)?.brandMarkup?.printMarkup || "N/A"}x</div>
            <div><b>Brand Multiplier:</b> {productPrices?.find((p) => p.quantity === quantity)?.brandMultiplier || "N/A"}x</div>
            <div><b>Product Markup:</b> {productPrices?.find((p) => p.quantity === quantity)?.productMarkup || "N/A"}x</div>

            <div className="border-t border-gray-300 pt-2 mt-3">
              <div>
                <b>Final Product Price per Unit:</b>{" "}
                {productPrices?.find((p) => p.quantity === quantity)?.finalProductPricePerUnit?.toFixed(4) || "N/A"} €
              </div>
            </div>
          </div>
        </div>

        <InterestModal isOpen={isInterestModalOpen} onClose={() => setIsInterestModalOpen(false)} />
      </div>
    </section>
  );
}
