// Technique-specific pricing multipliers (different techniques have different costs)
const TECHNIQUE_MULTIPLIERS = {
  'no-print': 0,
  '1-color': 1.0,     // Base multiplier
  '2-colors': 1.3,    // 30% more expensive
  '3-colors': 1.5,    // 50% more expensive  
  '4-colors': 1.7,    // 70% more expensive
  'full-color': 2.0,  // 100% more expensive
  'embroidery': 1.8,  // 80% more expensive
  'laser': 1.2,       // 20% more expensive
  'screen-print': 1.1, // 10% more expensive
  'pad-print': 1.0,   // Same as 1-color
  'transfer': 1.4     // 40% more expensive
};

// Position-specific pricing multipliers (different positions have different costs)
const POSITION_MULTIPLIERS = {
  'front': 1.0,           // Base position
  'back': 1.0,            // Same as front
  'front-back': 1.6,      // 60% more for both sides
  'sleeve': 1.2,          // 20% more expensive
  'chest': 1.0,           // Same as front
  'pocket': 0.8,          // 20% cheaper (smaller area)
  'bottom': 1.3,          // 30% more expensive
  'all-over': 2.5         // 150% more expensive
};

// Size-specific pricing multipliers (larger sizes cost more)
const SIZE_MULTIPLIERS = {
  'small': 0.8,     // 20% cheaper
  'medium': 1.0,    // Base size
  'large': 1.2,     // 20% more expensive
  'extra-large': 1.4, // 40% more expensive
  'xxl': 1.6,       // 60% more expensive
  '5cm': 0.7,       // Small print area
  '10cm': 1.0,      // Standard print area  
  '15cm': 1.3,      // Large print area
  '20cm': 1.6,      // Extra large print area
  '25cm': 2.0       // Maximum print area
};

// Brand configuration from PHP (lines 613-636)
const BRAND_CONFIG = {
  'Midocean': {
    priceMultiplier: 1.55, // 55% markup as per specification
    printMultiplier: 1.8,
    id: 'mP',
  },
  'Xindao': {
    priceMultiplier: 1.4,
    printMultiplier: 1.7,
    id: 'xP',
  },
  'Stricker': {
    priceMultiplier: 1.6,
    printMultiplier: 1.9,
    id: 'sP',
  },
  'PF': {
    priceMultiplier: 1.60, // 60% markup as per specification
    printMultiplier: 1.75,
    id: 'pP',
  },
  'kits': {
    priceMultiplier: 1.3,
    printMultiplier: 1.6,
    id: 'kP',
    specialSetupHandling: true,
  },
  'Stock': {
    priceMultiplier: 1.2,
    printMultiplier: 1.5,
    id: 'stoP',
    specialPricing: true,
  },
  'Chillys': {
    priceMultiplier: 1.7,
    printMultiplier: 2.0,
    id: 'chiP',
    specialPricing: true,
  },
  'Mdisplay': {
    priceMultiplier: 1.35,
    printMultiplier: 1.65,
    id: 'mdiP',
    specialPricing: true,
  }
};

// Price tier multipliers (lines 673-949)
const PRICE_TIER_MULTIPLIERS = {
  // Tier 0.01-1 (€0.01-€0.50)
  '0.01-0.50': {
    base: { '1': 3.5, '25': 3.2, '50': 3.0, '100': 2.8, '250': 2.6, '500': 2.4, '1000': 2.2, '2500': 2.0, '5000': 1.8, '10000': 1.6 },
  },
  // Tier 0.50-1 (€0.51-€1.00)
  '0.50-1.00': {
    base: { '1': 3.2, '25': 3.0, '50': 2.8, '100': 2.6, '250': 2.4, '500': 2.2, '1000': 2.0, '2500': 1.8, '5000': 1.6, '10000': 1.4 },
  },
  // Tier 1-2.5 (€1.01-€2.50)
  '1.00-2.50': {
    base: { '1': 3.0, '25': 2.8, '50': 2.6, '100': 2.4, '250': 2.2, '500': 2.0, '1000': 1.8, '2500': 1.6, '5000': 1.4, '10000': 1.2 },
  },
  // Continue for other tiers...
  '2.50-5.00': {
    base: { '1': 2.8, '25': 2.6, '50': 2.4, '100': 2.2, '250': 2.0, '500': 1.8, '1000': 1.6, '2500': 1.4, '5000': 1.2, '10000': 1.0 },
  }
};

// Special brand pricing for Stock (lines 673-810)
const STOCK_PRICING = {
  '0-1.22': {
    base: { '1': 4.2, '25': 3.8, '50': 3.5, '100': 3.2, '250': 2.9, '500': 2.6, '1000': 2.3, '2500': 2.0 }
  },
  '1.22-3.05': {
    base: { '1': 3.8, '25': 3.4, '50': 3.1, '100': 2.8, '250': 2.5, '500': 2.2, '1000': 1.9, '2500': 1.6 }
  },
  // Add other ranges as needed
};

const tierMap = {
  _price_print_setup: "setup",
  _price_print_1_3: "1-3",
  _price_print_3_5: "3-5",
  _price_print_5_10: "5-10",
  _price_print_10_25: "10-25",
  _price_print_25_50: "25-50",
  _price_print_50_100: "50-100",
  _price_print_100_250: "100-250",
  _price_print_250_500: "250-500",
  _price_print_500_1000: "500-1000",
  _price_print_1000_2500: "1000-2500",
  _price_print_2500_5000: "2500-5000",
  _price_print_5000_10000: "5000-10000",
  _price_print_10000_infinity: "10000+",
};

function extractPrintingPrices(metaData) {
  const prices = {};
  
  // Handle case where metaData is undefined, null, or not an array
  if (!metaData || !Array.isArray(metaData)) {
    // Return default pricing structure if metaData is not available
    return {
      "setup": 25,
      "1-3": 8.5,
      "3-5": 7.5,
      "5-10": 6.5,
      "10-25": 5.5,
      "25-50": 4.5,
      "50-100": 3.5,
      "100-250": 2.5,
      "250-500": 1.5,
      "500-1000": 1.2,
      "1000-2500": 1.0,
      "2500-5000": 0.9,
      "5000-10000": 0.8,
      "10000+": 0.7
    };
  }
  
  for (const { key, value } of metaData) {
    if (tierMap[key] && value !== null) {
      prices[tierMap[key]] = parseFloat(value);
    }
  }
  return prices;
}

function getPriceForQty(prices, qty) {
  const ranges = Object.keys(prices)
    .filter(k => k !== "setup")
    .map(k => {
      if (k === "10000+") {
        return { min: 10000, max: Infinity, price: prices[k] };
      }
      const [min, max] = k.split("-").map(n => parseInt(n));
      return { min, max: max || min, price: prices[k] };
    })
    .sort((a, b) => a.min - b.min);

  return ranges.find(r => qty >= r.min && qty <= r.max)?.price ?? null;
}

// Calculate brand-based customer pricing (lines 673-949)
function calculateCustomerPrice(basePrice, brand, quantity) {
  const config = BRAND_CONFIG[brand];
  if (!config) return basePrice * 2.5; // Default fallback

  let multiplier = config.priceMultiplier;
  
  // Special pricing logic for Stock brand
  if (brand === 'Stock') {
    if (basePrice <= 1.22) {
      const tier = STOCK_PRICING['0-1.22'];
      multiplier = getQuantityMultiplier(tier.base, quantity);
    } else if (basePrice <= 3.05) {
      const tier = STOCK_PRICING['1.22-3.05'];
      multiplier = getQuantityMultiplier(tier.base, quantity);
    }
    // Add other price ranges as needed
  }
  // Special pricing for Chillys
  else if (brand === 'Chillys') {
    if (quantity < 100) multiplier = 2.2;
    else if (quantity < 250) multiplier = 2.0;
    else if (quantity < 500) multiplier = 1.8;
    else multiplier = 1.6;
  }
  // Special pricing for Mdisplay
  else if (brand === 'Mdisplay') {
    if (basePrice < 150) multiplier = 1.4;
    else if (basePrice < 500) multiplier = 1.25;
    else multiplier = 1.15;
  }
  // Standard pricing for other brands - only apply tier multipliers for very low prices
  else {
    // Only apply additional multipliers for products under €1
    // For higher value products, just use the brand multiplier
    if (basePrice <= 0.50) {
      const tier = PRICE_TIER_MULTIPLIERS['0.01-0.50'];
      multiplier = getQuantityMultiplier(tier.base, quantity);
    } else if (basePrice <= 1.00) {
      const tier = PRICE_TIER_MULTIPLIERS['0.50-1.00'];
      multiplier = getQuantityMultiplier(tier.base, quantity);
    } else {
      // For products over €1, only use the brand multiplier
      multiplier = 1.0;
    }
  }
  
  return basePrice * config.priceMultiplier * multiplier;
}

// Helper function to get quantity multiplier
function getQuantityMultiplier(tierBase, quantity) {
  const keys = Object.keys(tierBase).map(Number).sort((a, b) => a - b);
  
  for (let i = keys.length - 1; i >= 0; i--) {
    if (quantity >= keys[i]) {
      return tierBase[keys[i].toString()];
    }
  }
  
  return tierBase['1']; // fallback to base multiplier
}

// Calculate printing setup cost with brand logic (lines 613-636)
function calculateSetupCost(basePrintSetup, brand, technique) {
  const config = BRAND_CONFIG[brand];
  if (!config) return basePrintSetup;
  
  let setupCost = basePrintSetup;
  
  // Special handling for kits brand
  if (config.specialSetupHandling && brand === 'kits') {
    setupCost = basePrintSetup * config.printMultiplier;
  } else if (technique !== 'no-print') {
    setupCost = basePrintSetup * config.printMultiplier + 30;
  }
  
  return setupCost;
}

// Calculate shipping days (lines 949-1148)
function calculateShippingDays(brand, technique, quantity) {
  const baseDays = {
    'Stock': { standard: 1, express: -1 },
    'Mdisplay': { standard: 6, express: 3 },
    'default': { standard: 4, express: 3 }
  };
  
  const base = baseDays[brand] || baseDays.default;
  
  const techniqueMultipliers = {
    '1-color': { standard: 5, express: 5 },
    '2-colors': { standard: 6, express: 6 },
    '3-colors': { standard: 6, express: 6 },
    '4-colors': { standard: 6, express: 6 },
    'laser': { standard: 4, express: 4 },
    'embroidery': { standard: 7, express: 7 },
    'full-color': { standard: 4, express: 4 },
    'no-print': { standard: 0, express: 0 }
  };
  
  const multiplier = techniqueMultipliers[technique] || { standard: 4, express: 3 };
  
  // Quantity adjustments
  let quantityAdjustment = 0;
  if (quantity >= 2500) quantityAdjustment += 2;
  else if (quantity >= 1000) quantityAdjustment += 1;
  
  return {
    standard: base.standard + multiplier.standard + quantityAdjustment,
    express: base.express + multiplier.express + quantityAdjustment
  };
}

// Calculate shipping costs (lines 1518-1784)
function calculateShippingCost(brand, v1w1, quantity) {
  const totalWeight = (v1w1 || 0) * quantity;
  const roundedWeight = Math.ceil(totalWeight);
  
  if (roundedWeight <= 0) {
    return { regular: 0, express: 0 };
  }
  
  let expressCost = 0;
  
  // Brand-specific shipping calculations
  if (brand === 'Midocean') {
    if (roundedWeight <= 1) {
      expressCost = 15.08;
    } else if (roundedWeight <= 5) {
      expressCost = ((roundedWeight - 1) * 5.32 + 15.75);
    } else if (roundedWeight <= 10) {
      expressCost = ((roundedWeight - 5) * 3.41 + 36.86);
    }
    // Add more weight ranges as needed
  } else if (brand === 'Stricker') {
    if (roundedWeight <= 1.5) {
      expressCost = 5;
    } else if (roundedWeight <= 5) {
      expressCost = 15;
    } else if (roundedWeight <= 6) {
      expressCost = 29.42;
    }
    // Add more weight ranges as needed
  }
  // Add other brands as needed
  
  const perUnitCost = quantity > 0 ? Math.ceil((expressCost / quantity) * 100) / 100 : 0;
  
  return {
    regular: 0, // Free regular shipping
    express: expressCost,
    expressPerUnit: perUnitCost
  };
}

/**
 * Calculate comprehensive pricing with all business logic
 * @param {Object} params - Calculation parameters
 * @param {number} params.quantity - Quantity to calculate for
 * @param {number} params.basePrice - Base product price
 * @param {Array} params.metaData - Product metadata containing pricing tiers
 * @param {string} params.brand - Brand name for pricing rules
 * @param {string} params.technique - Printing technique
 * @param {string} params.position - Print position (front, back, sleeve, etc.)
 * @param {string} params.size - Print size (small, medium, large, etc.)
 * @param {string} params.extra - Extra options
 * @param {boolean} params.isCustomer - Calculate customer pricing
 * @param {number} params.v1w1 - Product weight for shipping
 * @param {number} params.manipulation - Manipulation cost
 * @returns {Object} Calculated pricing details
 */
export function calculateVariationPrice({
  quantity,
  basePrice,
  metaData = null,
  brand = 'Midocean',
  technique = 'no-print',
  position = null,
  size = null,
  extra = null,
  isCustomer = true,
  v1w1 = 0,
  manipulation = 0
}) {
  // Extract printing prices from metadata
  const printingPrices = extractPrintingPrices(metaData);
  const unitPrintPrice = getPriceForQty(printingPrices, quantity);
  
  if (unitPrintPrice === null) {
    throw new Error(`No pricing found for quantity ${quantity}`);
  }
  
  // Calculate costs
  const basePrintSetup = printingPrices.setup || 0;
  const setupCost = calculateSetupCost(basePrintSetup, brand, technique);
  const setupCostPerUnit = quantity > 0 ? setupCost / quantity : 0;
  
  // Calculate manipulation cost
  const manipulationCostPerUnit = manipulation || 0;
  const totalManipulationCost = manipulationCostPerUnit * quantity;
  
  // Handle cost as per specification (fixed 0.10)
  const handleCostPerUnit = technique !== 'no-print' ? 0.10 : 0;
  
  // Calculate base prices
  let finalBasePrice = basePrice;
  let finalPrintPrice = unitPrintPrice;
  
  // For no-print technique, use base prices without customer markup
  if (technique === 'no-print') {
    const unitPrice = basePrice;
    const totalPrice = unitPrice * quantity;
    
    return {
      quantity,
      unitPrice: unitPrice, // Keep full precision
      totalPrice: totalPrice, // Keep full precision
      breakdown: {
        basePrice: basePrice, // Keep full precision
        discountedBasePrice: basePrice, // Keep full precision
        printingCostPerUnit: 0,
        setupCostPerUnit: 0,
        setupCostTotal: 0,
        manipulationCostPerUnit: 0,
        totalManipulationCost: 0,
        extraCostPerUnit: 0
      },
      shipping: {
        regular: 0,
        express: 0,
        expressPerUnit: 0
      },
      shippingDays: {
        standard: 4,
        express: 3
      },
      appliedFactors: {
        brand,
        technique,
        isCustomer,
        brandMultiplier: 1.0, // No multiplier for no-print
        printMultiplier: 0
      }
    };
  }
  
  if (isCustomer) {
    finalBasePrice = calculateCustomerPrice(basePrice, brand, quantity);
    
    // Apply technique, position, and size multipliers to print price
    let printPriceWithMultipliers = unitPrintPrice;
    // console.log(`💰 CUSTOMER PRICING - Base print price: ${unitPrintPrice}`);
    // console.log(`🔍 DEBUG - Received parameters: technique="${technique}", position="${position}", size="${size}", extra="${extra}"`);
    
    // Apply technique multiplier
    const techniqueMultiplier = TECHNIQUE_MULTIPLIERS[technique] || 1.0;
    printPriceWithMultipliers *= techniqueMultiplier;
    // console.log(`🎨 Applied technique multiplier for "${technique}": ${techniqueMultiplier}x = ${printPriceWithMultipliers.toFixed(4)}`);
    
    // Apply position multiplier if provided
    if (position) {
      const positionKey = position.toLowerCase();
      const positionMultiplier = POSITION_MULTIPLIERS[positionKey] || 1.0;
      printPriceWithMultipliers *= positionMultiplier;
      // console.log(`📍 Position "${position}" → key "${positionKey}" → multiplier ${positionMultiplier}x = ${printPriceWithMultipliers.toFixed(4)}`);
      if (positionMultiplier === 1.0 && !POSITION_MULTIPLIERS[positionKey]) {
        // console.warn(`⚠️ No position multiplier found for "${positionKey}". Available positions:`, Object.keys(POSITION_MULTIPLIERS));
      }
    } else {
      // console.log(`📍 No position provided, skipping position multiplier`);
    }
    
    // Apply size multiplier if provided
    if (size) {
      const sizeKey = size.toLowerCase();
      const sizeMultiplier = SIZE_MULTIPLIERS[sizeKey] || 1.0;
      printPriceWithMultipliers *= sizeMultiplier;
      // console.log(`📏 Size "${size}" → key "${sizeKey}" → multiplier ${sizeMultiplier}x = ${printPriceWithMultipliers.toFixed(4)}`);
      if (sizeMultiplier === 1.0 && !SIZE_MULTIPLIERS[sizeKey]) {
        // console.warn(`⚠️ No size multiplier found for "${sizeKey}". Available sizes:`, Object.keys(SIZE_MULTIPLIERS));
      }
    } else {
      // console.log(`📏 No size provided, skipping size multiplier`);
    }
    
    // Apply brand print multiplier last
    const brandPrintMultiplier = BRAND_CONFIG[brand]?.printMultiplier || 1.5;
    finalPrintPrice = printPriceWithMultipliers * brandPrintMultiplier;
    // console.log(`🏷️ Applied brand multiplier for "${brand}": ${brandPrintMultiplier}x = ${finalPrintPrice.toFixed(4)}`);
    
    // Special customer setup cost handling
    const customerSetupCost = calculateSetupCost(basePrintSetup, brand, technique);
    const customerSetupCostPerUnit = quantity > 0 ? customerSetupCost / quantity : 0;
    
    const unitPrice = finalBasePrice + finalPrintPrice + customerSetupCostPerUnit + manipulationCostPerUnit + handleCostPerUnit;
    const totalPrice = unitPrice * quantity;
    
    // Calculate shipping
    const shipping = calculateShippingCost(brand, v1w1, quantity);
    
    // Calculate shipping days
    const shippingDays = calculateShippingDays(brand, technique, quantity);
    
    return {
      quantity,
      unitPrice: unitPrice, // Keep full precision
      totalPrice: totalPrice, // Keep full precision
      breakdown: {
        basePrice: basePrice, // Keep full precision
        customerBasePrice: finalBasePrice, // Keep full precision
        discountedBasePrice: finalBasePrice, // Alias for backward compatibility, keep full precision
        printingCostPerUnit: finalPrintPrice, // Keep full precision
        setupCostPerUnit: customerSetupCostPerUnit, // Keep full precision
        setupCostTotal: customerSetupCost, // Keep full precision
        manipulationCostPerUnit: manipulationCostPerUnit, // Keep full precision
        totalManipulationCost: totalManipulationCost, // Keep full precision
        handleCostPerUnit: handleCostPerUnit, // Handle cost as per specification
        extraCostPerUnit: manipulationCostPerUnit // Alias for extraCost, keep full precision
      },
      shipping: {
        regular: shipping.regular,
        express: shipping.express,
        expressPerUnit: shipping.expressPerUnit
      },
      shippingDays: {
        standard: shippingDays.standard,
        express: shippingDays.express
      },
      appliedFactors: {
        brand,
        technique,
        isCustomer,
        brandMultiplier: BRAND_CONFIG[brand]?.priceMultiplier || 1.5,
        printMultiplier: BRAND_CONFIG[brand]?.printMultiplier || 1.5
      }
    };
  } else {
    // Admin/supplier pricing - apply same multipliers but without brand multiplier
    let printPriceWithMultipliers = unitPrintPrice;
    
    // Apply technique multiplier
    const techniqueMultiplier = TECHNIQUE_MULTIPLIERS[technique] || 1.0;
    printPriceWithMultipliers *= techniqueMultiplier;
    
    // Apply position multiplier if provided
    if (position) {
      const positionMultiplier = POSITION_MULTIPLIERS[position.toLowerCase()] || 1.0;
      printPriceWithMultipliers *= positionMultiplier;
    }
    
    // Apply size multiplier if provided
    if (size) {
      const sizeMultiplier = SIZE_MULTIPLIERS[size.toLowerCase()] || 1.0;
      printPriceWithMultipliers *= sizeMultiplier;
    }
    
    finalPrintPrice = printPriceWithMultipliers; // No brand multiplier for admin pricing
    
    const unitPrice = finalBasePrice + finalPrintPrice + setupCostPerUnit + manipulationCostPerUnit + handleCostPerUnit;
    const totalPrice = unitPrice * quantity;
    
    return {
      quantity,
      unitPrice: unitPrice, // Keep full precision
      totalPrice: totalPrice, // Keep full precision
      breakdown: {
        basePrice: finalBasePrice, // Keep full precision
        discountedBasePrice: finalBasePrice, // Alias for backward compatibility, keep full precision
        printingCostPerUnit: finalPrintPrice, // Keep full precision
        setupCostPerUnit: setupCostPerUnit, // Keep full precision
        setupCostTotal: setupCost, // Keep full precision
        manipulationCostPerUnit: manipulationCostPerUnit, // Keep full precision
        totalManipulationCost: totalManipulationCost, // Keep full precision
        handleCostPerUnit: handleCostPerUnit, // Handle cost as per specification
        extraCostPerUnit: manipulationCostPerUnit // Alias for extraCost, keep full precision
      },
      appliedFactors: {
        brand,
        technique,
        isCustomer
      }
    };
  }
}

/**
 * Get pricing for multiple quantity tiers
 * @param {Object} params - Parameters for tier calculation
 * @returns {Array} Array of pricing for each tier
 */
export function calculatePricingTiers({
  basePrice,
  metaData = null,
  customTiers = null
}) {
  const printingPrices = extractPrintingPrices(metaData);
  const availableTiers = Object.keys(printingPrices)
    .filter(k => k !== "setup")
    .map(k => {
      if (k === "10000+") return 10000;
      const [min] = k.split("-").map(n => parseInt(n));
      return min;
    })
    .sort((a, b) => a - b);
  
  const tiers = customTiers || availableTiers;
  
  return tiers.map(quantity => calculateVariationPrice({
    quantity,
    basePrice,
    metaData
  }));
}

/**
 * Validate if a quantity is within allowed range
 * @param {number} quantity - Quantity to validate
 * @param {Array} metaData - Product metadata containing pricing tiers
 * @returns {Object} Validation result
 */
export function validateQuantity(quantity, metaData = null) {
  const printingPrices = extractPrintingPrices(metaData);
  const unitPrice = getPriceForQty(printingPrices, quantity);
  
  if (unitPrice === null) {
    return {
      valid: false,
      error: `Quantity ${quantity} is not available for this product`
    };
  }
  
  return {
    valid: true,
    error: null
  };
}

/**
 * Format price for display
 * @param {number} price - Price to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted price
 */
export function formatPrice(price, currency = '€') {
  // Handle undefined, null, or non-numeric values
  if (price == null || isNaN(price)) {
    return `${currency}0.00`;
  }
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `${currency}${numPrice.toFixed(2)}`;
}

/**
 * Get all available quantity tiers from metadata
 * @param {Array} metaData - Product metadata containing pricing tiers
 * @returns {Array} Array of quantity tiers with prices
 */
export function getAvailableQuantityTiers(metaData = null) {
  const printingPrices = extractPrintingPrices(metaData);
  const tiers = [];
  
  Object.keys(printingPrices).forEach(key => {
    if (key === "setup") return; // Skip setup
    
    if (key === "10000+") {
      tiers.push({
        quantity: 10000,
        label: key,
        printPrice: printingPrices[key],
        minQuantity: 10000,
        maxQuantity: Infinity
      });
    } else {
      const [min, max] = key.split("-").map(n => parseInt(n));
      tiers.push({
        quantity: min, // Use minimum as display quantity
        label: key,
        printPrice: printingPrices[key],
        minQuantity: min,
        maxQuantity: max || min
      });
    }
  });
  
  return tiers.sort((a, b) => a.quantity - b.quantity);
}

/**
 * Get quantity range information
 * @param {number} quantity - Quantity to check
 * @param {Array} metaData - Product metadata containing pricing tiers
 * @returns {Object} Range information
 */
export function getQuantityRangeInfo(quantity, metaData = null) {
  const printingPrices = extractPrintingPrices(metaData);
  const ranges = Object.keys(printingPrices)
    .filter(k => k !== "setup")
    .map(k => {
      if (k === "10000+") {
        return { min: 10000, max: Infinity, label: k, price: printingPrices[k] };
      }
      const [min, max] = k.split("-").map(n => parseInt(n));
      return { min, max: max || min, label: k, price: printingPrices[k] };
    })
    .sort((a, b) => a.min - b.min);
  
  const currentRange = ranges.find(r => quantity >= r.min && quantity <= r.max);
  
  if (!currentRange) {
    return null;
  }
  
  const currentIndex = ranges.indexOf(currentRange);
  const nextRange = ranges[currentIndex + 1] || null;
  
  return {
    current: currentRange,
    next: nextRange,
    quantityToNextTier: nextRange ? nextRange.min - quantity : null,
    priceDifference: nextRange ? currentRange.price - nextRange.price : 0
  };
}

export default {
  calculateVariationPrice,
  calculatePricingTiers,
  validateQuantity,
  formatPrice,
  getQuantityRangeInfo,
  getAvailableQuantityTiers,
  extractPrintingPrices,
  getPriceForQty,
  calculateCustomerPrice,
  calculateShippingCost,
  calculateShippingDays,
  BRAND_CONFIG
};