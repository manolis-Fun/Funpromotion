export function translateSizeLabel(value) {
  if (!value) return "-";
  let v = decodeURIComponent(value);
  v = v.replace(/έως|εώς|εως|ΕΩΣ|Έως/gi, "up to");
  v = v.replace(/εκ\.?/gi, "cm");
  v = v.replace(/χιλ\.?/gi, "mm");
  v = v.replace(/cm2|CM2/gi, "cm²");
  v = v.replace(/-+/g, "-").replace(/^-|-$/g, "").trim();
  return v;
}

/**
 * Format technique value to display label
 * @param {string} technique - technique value from variations (e.g., "1-color", "full-color")
 * @returns {string} formatted label (e.g., "1 Color", "Full Color")
 */
export function formatTechniqueLabel(technique) {
  if (!technique) return "";
  
  const labelMap = {
    "1-color": "1 Color",
    "2-colors": "2 Colors", 
    "3-colors": "3 Colors",
    "4-colors": "4 Colors",
    "embroidery": "Embroidery",
    "full-color": "Full Color",
    "no-print": "No Print",
    "leather-badge": "Leather Badge"
  };
  
  // Return mapped label or capitalize first letter as fallback
  return labelMap[technique] || technique.charAt(0).toUpperCase() + technique.slice(1).replace(/-/g, " ");
}

/**
 * Get colors for technique icon display
 * @param {string} technique - technique value from variations
 * @returns {string[]} array of colors for the technique
 */
export function getTechniqueColors(technique) {
  const colorMap = {
    "1-color": ["#7627b9"],
    "2-colors": ["#7627b9", "#1cb4cf"],
    "3-colors": ["#7627b9", "#1cb4cf", "#fbbf24"],
    "4-colors": ["#7627b9", "#1cb4cf", "#fbbf24", "#ef4444"],
    "embroidery": ["#f59e42"],
    "full-color": ["gradient"],
    "no-print": ["#e5e7eb"],
    "leather-badge": ["#8b4513"]
  };
  
  return colorMap[technique] || ["#6b7280"]; // Default gray
}

/**
 * Get unique attribute values from variations
 * @param {Array} nodes - variations array from GraphQL response
 * @param {string} attributeLabel - attribute label to extract (e.g., "technique", "position", "size", "extra")
 * @param {Object} [opts]
 * @param {boolean} [opts.caseInsensitive=true] - dedupe ignoring case
 * @param {boolean} [opts.sort=false] - sort alphabetically instead of input order
 * @param {boolean} [opts.includeEmpty=true] - include empty/null values
 * @returns {string[]} unique attribute values
 */
function uniqueAttributeValues(nodes, attributeLabel, { caseInsensitive = true, sort = false, includeEmpty = true } = {}) {
  const seen = new Set();
  const out = [];

  for (const node of nodes ?? []) {
    const attrs = node.attributes?.nodes ?? node.attributes ?? [];
    const attrValue = attrs.find(a => a.label === attributeLabel)?.value;
    
    if (attrValue == null || String(attrValue).trim() === "") {
      if (includeEmpty && !seen.has("")) {
        seen.add("");
        out.push("");
      }
      continue;
    }

    const key = caseInsensitive ? String(attrValue).trim().toLowerCase() : String(attrValue).trim();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(String(attrValue).trim());
    }
  }

  return sort ? [...out].sort((a, b) => a.localeCompare(b)) : out;
}

/**
 * Format attribute value for display (shows "None" for empty values)
 * @param {string} value - attribute value
 * @param {string} attributeType - type of attribute (for context-specific formatting)
 * @returns {string} formatted value
 */
export function formatAttributeValue(value, attributeType = "") {
  if (value == null || String(value).trim() === "") {
    return "None";
  }
  
  // For size values, use existing translateSizeLabel function
  if (attributeType === "size") {
    return translateSizeLabel(value);
  }
  
  return String(value).trim();
}

/**
 * Get unique "technique" values from variations in proper order
 * @param {Array} nodes - variations array from GraphQL response
 * @param {Object} [opts]
 * @param {boolean} [opts.caseInsensitive=true] - dedupe ignoring case
 * @returns {string[]} unique techniques in proper order (1-color, 2-colors, etc., then others, no-print last)
 */
export function uniqueTechniques(nodes, { caseInsensitive = true } = {}) {
  const techniques = uniqueAttributeValues(nodes, "technique", { caseInsensitive, sort: false, includeEmpty: false });
  
  // Define the desired order
  const colorOrder = ["1-color", "2-colors", "3-colors", "4-colors"];
  const lastTechnique = "no-print";
  
  const ordered = [];
  const remaining = [];
  
  // First, add numbered color techniques in order
  colorOrder.forEach(colorTech => {
    if (techniques.includes(colorTech)) {
      ordered.push(colorTech);
    }
  });
  
  // Then add other techniques (excluding no-print)
  techniques.forEach(tech => {
    if (!colorOrder.includes(tech) && tech !== lastTechnique) {
      remaining.push(tech);
    }
  });
  
  // Sort remaining techniques alphabetically
  remaining.sort((a, b) => a.localeCompare(b));
  ordered.push(...remaining);
  
  // Add no-print last if it exists
  if (techniques.includes(lastTechnique)) {
    ordered.push(lastTechnique);
  }
  
  return ordered;
}

/**
 * Get unique "position" values from variations (empty/"None" values shown last)
 * @param {Array} nodes - variations array from GraphQL response
 * @param {Object} [opts]
 * @param {boolean} [opts.caseInsensitive=true] - dedupe ignoring case
 * @param {boolean} [opts.sort=false] - sort alphabetically instead of input order
 * @param {boolean} [opts.includeEmpty=true] - include empty positions
 * @returns {string[]} unique positions with empty values last
 */
export function uniquePositions(nodes, { caseInsensitive = true, sort = false, includeEmpty = true } = {}) {
  const positions = uniqueAttributeValues(nodes, "position", { caseInsensitive, sort, includeEmpty });
  
  // Separate empty and non-empty values
  const nonEmpty = positions.filter(pos => pos !== "");
  const hasEmpty = positions.includes("");
  
  // Sort non-empty positions if requested
  if (sort) {
    nonEmpty.sort((a, b) => a.localeCompare(b));
  }
  
  // Return with empty/"None" at the end
  return hasEmpty ? [...nonEmpty, ""] : nonEmpty;
}

/**
 * Get unique "size" values from variations (empty/"None" values shown last)
 * @param {Array} nodes - variations array from GraphQL response
 * @param {Object} [opts]
 * @param {boolean} [opts.caseInsensitive=true] - dedupe ignoring case
 * @param {boolean} [opts.sort=false] - sort alphabetically instead of input order
 * @param {boolean} [opts.includeEmpty=true] - include empty sizes
 * @returns {string[]} unique sizes with empty values last
 */
export function uniqueSizes(nodes, { caseInsensitive = true, sort = false, includeEmpty = true } = {}) {
  const sizes = uniqueAttributeValues(nodes, "size", { caseInsensitive, sort, includeEmpty });
  
  // Separate empty and non-empty values
  const nonEmpty = sizes.filter(size => size !== "");
  const hasEmpty = sizes.includes("");
  
  // Sort non-empty sizes if requested
  if (sort) {
    nonEmpty.sort((a, b) => a.localeCompare(b));
  }
  
  // Return with empty/"None" at the end
  return hasEmpty ? [...nonEmpty, ""] : nonEmpty;
}

/**
 * Get unique "extra" values from variations (empty/"None" values shown last)
 * @param {Array} nodes - variations array from GraphQL response
 * @param {Object} [opts]
 * @param {boolean} [opts.caseInsensitive=true] - dedupe ignoring case
 * @param {boolean} [opts.sort=false] - sort alphabetically instead of input order
 * @param {boolean} [opts.includeEmpty=true] - include empty extras
 * @returns {string[]} unique extras with empty values last
 */
export function uniqueExtras(nodes, { caseInsensitive = true, sort = false, includeEmpty = true } = {}) {
  const extras = uniqueAttributeValues(nodes, "extra", { caseInsensitive, sort, includeEmpty });
  
  // Separate empty and non-empty values
  const nonEmpty = extras.filter(extra => extra !== "");
  const hasEmpty = extras.includes("");
  
  // Sort non-empty extras if requested
  if (sort) {
    nonEmpty.sort((a, b) => a.localeCompare(b));
  }
  
  // Return with empty/"None" at the end
  return hasEmpty ? [...nonEmpty, ""] : nonEmpty;
}

/**
 * Find the cheapest attribute combination from all variations
 * @param {Array} variations - Product variations array
 * @param {number} quantity - Quantity to calculate price for (default: 250)
 * @param {string} basePrice - Product base price
 * @param {string} brand - Product brand
 * @param {string} manipulation - Handling cost
 * @returns {Object} Cheapest combination with technique, position, size, extra and total cost
 */
/**
 * Find the cheapest combination for given constraints (hierarchical selection)
 * @param {Array} variations - Product variations array
 * @param {Object} constraints - Partial constraints { technique?, position?, size?, extra? }
 * @param {number} quantity - Quantity to calculate price for
 * @param {string} basePrice - Product base price  
 * @param {string} brand - Product brand
 * @param {string} manipulation - Handling cost
 * @returns {Object} Cheapest combination for the constraints
 */
export function findCheapestForConstraints(variations, constraints = {}, quantity = 100, basePrice = 0, brand = "Unknown", manipulation = 0) {
  if (!variations || variations.length === 0) {
    return {
      technique: constraints.technique || "1-color",
      position: constraints.position || "",
      size: constraints.size || "",
      extra: constraints.extra || "",
      totalCost: parseFloat(basePrice) || 0,
      variation: null
    };
  }

  // Get all available options
  const allTechniques = uniqueTechniques(variations);
  const allPositions = uniquePositions(variations);
  const allSizes = uniqueSizes(variations);
  const allExtras = uniqueExtras(variations);

  // Filter techniques (exclude no-print unless explicitly requested)
  const availableTechniques = constraints.technique ? 
    [constraints.technique] : 
    allTechniques.filter(t => t !== 'no-print');

  let cheapestCombination = null;
  let lowestCost = Infinity;

  // Helper functions (same as before)
  const getBrandMarkup = (brandName) => {
    const BRAND_MARKUPS = {
      "Xindao": { priceMultiplier: 1.1, printMarkup: 1.4 },
      "Stricker": { priceMultiplier: 1, printMarkup: 0.99 },
      "Midocean": { priceMultiplier: 1, printMarkup: 1 },
      "PF": { priceMultiplier: 1, printMarkup: 1 },
      "Mdisplay": { priceMultiplier: 1, printMarkup: 1 },
      "Stock": { priceMultiplier: 1, printMarkup: 1 },
      "kits": { priceMultiplier: 1, printMarkup: 1 }
    };
    return BRAND_MARKUPS[brandName] || { priceMultiplier: 1, printMarkup: 1 };
  };

  const findPriceTier = (metaData, qty) => {
    if (!metaData) return null;
    for (const item of metaData) {
      if (!item.key?.startsWith('_price_print_')) continue;
      const match = item.key.match(/^_price_print_(\d+)_((\d+)|infinity)(?:_customer)?$/);
      if (!match) continue;
      const min = Number(match[1]);
      const max = match[2] === 'infinity' ? Infinity : Number(match[2]);
      if (qty >= min && (max === Infinity ? true : qty < max)) {
        return parseFloat(item.value) || 0;
      }
    }
    return 0;
  };

  const getSetupCost = (metaData) => {
    if (!metaData) return 0;
    const setupData = metaData.find(m => m.key === '_price_print_setup');
    return setupData ? parseFloat(setupData.value) || 0 : 0;
  };

  // Calculate cost for each possible combination within constraints
  for (const technique of availableTechniques) {
    const positionsToTry = constraints.position ? [constraints.position] : allPositions;
    
    for (const position of positionsToTry) {
      const sizesToTry = constraints.size ? [constraints.size] : allSizes;
      
      for (const size of sizesToTry) {
        const extrasToTry = constraints.extra !== undefined ? [constraints.extra] : allExtras;
        
        for (const extra of extrasToTry) {
          // Find matching variation
          const matchingVariation = variations.find((v) => {
            const attrs = Object.fromEntries((v.attributes?.nodes || v.attributes || []).map((a) => [a.label, a.value]));
            return attrs.technique === technique && 
                   attrs.position === position &&
                   attrs.size === size && 
                   attrs.extra === extra;
          });

          if (matchingVariation) {
            // Calculate printing costs
            const metaData = matchingVariation.metaData || [];
            const printCostPerUnit = findPriceTier(metaData, quantity);
            const setupCost = getSetupCost(metaData);
            const handlingCost = parseFloat(manipulation) || 0;
            
            // Calculate total cost
            const setupCostPerUnit = setupCost / quantity;
            const handlingCostPerUnit = handlingCost / quantity;
            const basePrintCostPerUnit = setupCostPerUnit + printCostPerUnit + handlingCostPerUnit;
            
            const brandMarkup = getBrandMarkup(brand);
            const printCostWithMarkup = basePrintCostPerUnit * brandMarkup.printMarkup;
            const totalCost = parseFloat(basePrice) + printCostWithMarkup;

            // Check if this is the cheapest combination
            if (totalCost < lowestCost) {
              lowestCost = totalCost;
              cheapestCombination = {
                technique,
                position,
                size,
                extra,
                totalCost,
                variation: matchingVariation
              };
            }
          }
        }
      }
    }
  }

  console.log('Cheapest combination for constraints:', constraints, '→', cheapestCombination);
  return cheapestCombination || {
    technique: constraints.technique || availableTechniques[0] || "1-color",
    position: constraints.position || allPositions[0] || "",
    size: constraints.size || allSizes[0] || "",
    extra: constraints.extra || allExtras[0] || "",
    totalCost: parseFloat(basePrice) || 0,
    variation: null
  };
}

export function findCheapestCombination(variations, quantity = 100, basePrice = 0, brand = "Unknown", manipulation = 0) {
  if (!variations || variations.length === 0) {
    return {
      technique: "1-color",
      position: "",
      size: "",
      extra: "",
      totalCost: parseFloat(basePrice) || 0,
      variation: null
    };
  }

  const allTechniques = uniqueTechniques(variations);
  const allPositions = uniquePositions(variations);
  const allSizes = uniqueSizes(variations);
  const allExtras = uniqueExtras(variations);

  console.log('Finding cheapest combination from:', {
    techniques: allTechniques,
    positions: allPositions, 
    sizes: allSizes,
    extras: allExtras,
    quantity,
    basePrice,
    brand
  });

  let cheapestCombination = null;
  let lowestCost = Infinity;

  // Helper to get brand markup
  const getBrandMarkup = (brandName) => {
    const BRAND_MARKUPS = {
      "Xindao": { priceMultiplier: 1.1, printMarkup: 1.4 },
      "Stricker": { priceMultiplier: 1, printMarkup: 0.99 },
      "Midocean": { priceMultiplier: 1, printMarkup: 1 },
      "PF": { priceMultiplier: 1, printMarkup: 1 },
      "Mdisplay": { priceMultiplier: 1, printMarkup: 1 },
      "Stock": { priceMultiplier: 1, printMarkup: 1 },
      "kits": { priceMultiplier: 1, printMarkup: 1 }
    };
    return BRAND_MARKUPS[brandName] || { priceMultiplier: 1, printMarkup: 1 };
  };

  // Helper to find price tier for quantity
  const findPriceTier = (metaData, qty) => {
    if (!metaData) return null;
    
    for (const item of metaData) {
      if (!item.key?.startsWith('_price_print_')) continue;
      
      const match = item.key.match(/^_price_print_(\d+)_((\d+)|infinity)(?:_customer)?$/);
      if (!match) continue;
      
      const min = Number(match[1]);
      const max = match[2] === 'infinity' ? Infinity : Number(match[2]);
      
      if (qty >= min && (max === Infinity ? true : qty < max)) {
        return parseFloat(item.value) || 0;
      }
    }
    return 0;
  };

  // Helper to get setup cost
  const getSetupCost = (metaData) => {
    if (!metaData) return 0;
    const setupData = metaData.find(m => m.key === '_price_print_setup');
    return setupData ? parseFloat(setupData.value) || 0 : 0;
  };

  // Calculate cost for each possible combination (excluding no-print)
  for (const technique of allTechniques) {
    // Skip no-print technique - we want the cheapest PRINTING option
    if (technique === 'no-print') continue;
    
    for (const position of allPositions) {
      for (const size of allSizes) {
        for (const extra of allExtras) {
          // Find matching variation
          const matchingVariation = variations.find((v) => {
            const attrs = Object.fromEntries((v.attributes?.nodes || v.attributes || []).map((a) => [a.label, a.value]));
            return attrs.technique === technique && 
                   attrs.position === position &&
                   attrs.size === size && 
                   attrs.extra === extra;
          });

          let totalCost = parseFloat(basePrice) || 0;

          if (matchingVariation) {
            // Calculate printing costs
            const metaData = matchingVariation.metaData || [];
            const printCostPerUnit = findPriceTier(metaData, quantity);
            const setupCost = getSetupCost(metaData);
            const handlingCost = parseFloat(manipulation) || 0;
            
            // Calculate total print cost
            const setupCostPerUnit = setupCost / quantity;
            const handlingCostPerUnit = handlingCost / quantity;
            const basePrintCostPerUnit = setupCostPerUnit + printCostPerUnit + handlingCostPerUnit;
            
            // Apply brand markup to print cost
            const brandMarkup = getBrandMarkup(brand);
            const printCostWithMarkup = basePrintCostPerUnit * brandMarkup.printMarkup;
            
            // Add to base price
            totalCost = parseFloat(basePrice) + printCostWithMarkup;
          } else {
            // No matching variation - skip this combination
            continue;
          }

          // Check if this is the cheapest combination
          if (totalCost < lowestCost) {
            lowestCost = totalCost;
            cheapestCombination = {
              technique,
              position,
              size,
              extra,
              totalCost,
              variation: matchingVariation
            };
          }
        }
      }
    }
  }

  console.log('Cheapest printing combination found:', cheapestCombination);
  return cheapestCombination || {
    technique: allTechniques.find(t => t !== 'no-print') || allTechniques[0] || "1-color",
    position: allPositions[0] || "",
    size: allSizes[0] || "",
    extra: allExtras[0] || "",
    totalCost: parseFloat(basePrice) || 0,
    variation: null
  };
}


export async function fetchPricingData({ brand, priceMain, quantity, selectedTechnique, v1w1, selectedVariation }) {
  try {
    // Format technique for API calls
    const formattedTechnique = selectedTechnique?.replace('-', ' ') || '1 color';

    // Extract variation attributes for API calls
    const variationSize = selectedVariation?.attributes?.find(attr => attr.label === 'size')?.value || '';
    const variationPosition = selectedVariation?.attributes?.find(attr => attr.label === 'position')?.value || '';
    const variationId = selectedVariation?.id || '';

    // Build API URLs with variation parameters
    let printPriceUrl = `/api/print-price?brand=${brand}&technique=${formattedTechnique}&quantity=${quantity}`;
    if (variationId) printPriceUrl += `&variation_id=${variationId}`;
    if (variationSize) printPriceUrl += `&size=${encodeURIComponent(variationSize)}`;
    if (variationPosition) printPriceUrl += `&position=${encodeURIComponent(variationPosition)}`;

    const [productRes, printRes, shippingRes, shippingCostRes] = await Promise.all([
      fetch(`/api/product-price?brand=${brand}&price_main=${priceMain}&quantity=${quantity}`),
      fetch(printPriceUrl),
      fetch(`/api/shipping-days?brand=${brand}&printing=${formattedTechnique}&quantity=${quantity}`),
      fetch(`/api/shipping-cost?brand=${brand}&quantity=${quantity}&v1w1=${v1w1}`)
    ]);

    const [productData, printData, shippingData, shippingCostData] = await Promise.all([
      productRes.json(),
      printRes.json(),
      shippingRes.json(),
      shippingCostRes.json()
    ]);

    const breakdown = {
      product_price: productData?.breakdown?.product_price || 0,
      markup: productData?.breakdown?.markup || 1,
      printing: {
        cost: printData?.cost || 0,
        costPerItem: printData?.costPerItem || 0,
        totalCost: printData?.totalCost || 0,
        handleCost: printData?.breakdown?.handleCost || 0,
        setupCost: printData?.breakdown?.setupCost || 0,
        setupCostPerItem: printData?.breakdown?.setupCostPerItem || 0,
        printCostPerItem: printData?.breakdown?.printCostPerItem || 0,
        baseCostPerItem: printData?.breakdown?.baseCostPerItem || 0,
        brandMarkup: printData?.breakdown?.brandMarkup || 1,
        totalBaseCost: printData?.breakdown?.totalBaseCost || 0
      },
      shipping: {
        days: shippingData?.regular || "5-7",
        cost: shippingCostData?.total || 0,
        per_unit: shippingCostData?.costPerPiece || 0
      }
    };

    const productPart = breakdown.product_price * breakdown.markup;
    const printingPart = breakdown.printing.costPerItem || 0;
    const shippingPart = breakdown.shipping.per_unit;

    const perUnit = parseFloat((productPart + printingPart + shippingPart).toFixed(2));
    const totalPrice = parseFloat((perUnit * quantity).toFixed(2));

    const structuredFinal = {
      total_price: totalPrice,
      per_unit: perUnit,
      breakdown,
      cached: productData?.cached || false,
      source: productData?.source || "calculated"
    };

    // Format shipping days properly
    const formatShippingDays = (days) => {
      if (!days || days === null || days === -1) return "Contact us";
      if (typeof days === 'number') return `${days}`;
      return days;
    };

    const regularDays = formatShippingDays(shippingData?.totalStandardDays || shippingData?.standardShippingDays) || "5-7";
    const expressDays = formatShippingDays(shippingData?.totalExpressDays || shippingData?.expressShippingDays) || "2-3";

    return {
      finalPrice: structuredFinal,
      productPrice: productData,
      printPrice: printData,
      shippingDays: {
        regular: regularDays,
        express: expressDays
      },
      shippingCost: {
        costPerPiece: shippingCostData?.cost || 0,
        total: shippingCostData?.total || 0,
        volume: shippingCostData?.volume || 0
      }
    };
  } catch (err) {
    console.error("Error fetching pricing data:", err);
    throw err;
  }
}
