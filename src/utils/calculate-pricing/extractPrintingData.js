/**
 * Utilities for extracting printing data from product variations
 */

// Helper to normalize strings for comparison
const normalizeString = (str) => String(str ?? "").trim().toLowerCase();

// Helper to decode URI components safely
const decodeValue = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// Helper to parse numeric values
const parseNumber = (val) => {
  if (val == null) return null;
  const num = Number(String(val).replace(",", "."));
  return Number.isFinite(num) ? num : null;
};

/**
 * Find matching variation based on selected attributes
 */
export function findMatchingVariation(variations, { technique, position, size, extra }) {
  if (!variations || !variations.length) return null;

  // Normalize search criteria
  const searchTechnique = normalizeString(technique);
  const searchPosition = normalizeString(position);
  const searchSize = normalizeString(decodeValue(size));
  const searchExtra = normalizeString(extra);

  // Find exact match
  for (const variation of variations) {
    const attributes = variation.attributes?.nodes || variation.attributes || [];
    const attrMap = {};
    
    for (const attr of attributes) {
      attrMap[normalizeString(attr.label)] = normalizeString(decodeValue(attr.value));
    }

    const matches = 
      attrMap.technique === searchTechnique &&
      (!searchPosition || attrMap.position === searchPosition) &&
      (!searchSize || attrMap.size === searchSize) &&
      (!searchExtra || attrMap.extra === searchExtra);

    if (matches) {
      return variation;
    }
  }

  // Try fallback with empty size if no match found
  if (searchSize) {
    return findMatchingVariation(variations, { technique, position, size: "", extra });
  }

  return null;
}

/**
 * Extract setup cost from variation metadata
 */
export function getSetupCost(variation) {
  if (!variation?.metaData) return 0;
  
  const setupData = variation.metaData.find(m => m.key === "_price_print_setup");
  return parseNumber(setupData?.value) || 0;
}

/**
 * Get printing price for specific quantity from variation metadata
 */
export function getPrintingPriceForQuantity(variation, quantity) {
  if (!variation?.metaData) return 0;
  
  const priceKeys = variation.metaData.filter(m => {
    const key = m.key;
    if (!key?.startsWith("_price_print_")) return false;
    if (key === "_price_print_setup") return false;
    if (key.endsWith("_customer")) return false;
    return true;
  });

  // Parse price tiers
  const tiers = [];
  const tierRegex = /^_price_print_(\d+)_((\d+)|infinity)$/;
  
  for (const meta of priceKeys) {
    const match = meta.key.match(tierRegex);
    if (!match) continue;
    
    const min = Number(match[1]);
    const max = match[2] === "infinity" ? Infinity : Number(match[2]);
    const price = parseNumber(meta.value);
    
    if (price != null) {
      tiers.push({ min, max, price });
    }
  }

  // Find matching tier for quantity
  for (const tier of tiers) {
    if (quantity >= tier.min && (tier.max === Infinity || quantity < tier.max)) {
      return tier.price;
    }
  }

  return 0;
}

/**
 * Extract all printing costs for a specific variation and quantity
 */
export function extractPrintingCosts(variation, quantity, handleCost = 0) {
  if (!variation) {
    return {
      handleCost: 0,
      printingForQty: 0,
      setupCost: 0,
      found: false
    };
  }

  const setupCost = getSetupCost(variation);
  const printingForQty = getPrintingPriceForQuantity(variation, quantity);

  return {
    handleCost: parseNumber(handleCost) || 0,
    printingForQty,
    setupCost,
    found: true
  };
}