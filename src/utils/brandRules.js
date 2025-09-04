/**
 * Brand rules configuration
 * This module defines pricing rules for different brands
 */

export const brandRules = {
  xindao: {
    handleCost: 0.24,
    printMultiplier: 1.4,
    priceMultiplier: 1.1,
    markupByQty: (qty) => {
      // Xindao markup rules by quantity
      if (qty <= 50) return 1.5;
      if (qty <= 100) return 1.4;
      if (qty <= 250) return 1.35;
      if (qty <= 500) return 1.3;
      if (qty <= 1000) return 1.25;
      if (qty <= 2500) return 1.2;
      return 1.15; // 2500+
    }
  },
  
  midocean: {
    handleCost: 0.20,
    printMultiplier: 1.5,
    priceMultiplier: 1.15,
    markupByQty: (qty) => {
      // Midocean markup rules by quantity
      if (qty <= 50) return 1.6;
      if (qty <= 100) return 1.5;
      if (qty <= 250) return 1.4;
      if (qty <= 500) return 1.35;
      if (qty <= 1000) return 1.3;
      if (qty <= 2500) return 1.25;
      return 1.2; // 2500+
    }
  },
  
  stricker: {
    handleCost: 0.22,
    printMultiplier: 1.45,
    priceMultiplier: 1.12,
    markupByQty: (qty) => {
      // Stricker markup rules by quantity
      if (qty <= 50) return 1.55;
      if (qty <= 100) return 1.45;
      if (qty <= 250) return 1.38;
      if (qty <= 500) return 1.32;
      if (qty <= 1000) return 1.28;
      if (qty <= 2500) return 1.22;
      return 1.18; // 2500+
    }
  },
  
  pf: {
    handleCost: 0.18,
    printMultiplier: 1.35,
    priceMultiplier: 1.08,
    markupByQty: (qty) => {
      // PF markup rules by quantity
      if (qty <= 50) return 1.45;
      if (qty <= 100) return 1.38;
      if (qty <= 250) return 1.32;
      if (qty <= 500) return 1.28;
      if (qty <= 1000) return 1.22;
      if (qty <= 2500) return 1.18;
      return 1.12; // 2500+
    }
  },
  
  // Default fallback for unknown brands
  default: {
    handleCost: 0.20,
    printMultiplier: 1.5,
    priceMultiplier: 1.15,
    markupByQty: (qty) => {
      // Default markup rules by quantity
      if (qty <= 50) return 1.6;
      if (qty <= 100) return 1.5;
      if (qty <= 250) return 1.4;
      if (qty <= 500) return 1.35;
      if (qty <= 1000) return 1.3;
      if (qty <= 2500) return 1.25;
      return 1.2; // 2500+
    }
  }
};

/**
 * Get brand rules for a specific brand
 * @param {string} brand - The brand name
 * @returns {Object} Brand rules configuration
 */
export function getBrandRules(brand) {
  const normalizedBrand = brand?.toLowerCase() || 'default';
  return brandRules[normalizedBrand] || brandRules.default;
}

/**
 * Calculate setup cost based on quantity and brand rules
 * @param {number} setupTotalForQty - Total setup cost for the quantity
 * @param {string} brand - Brand name
 * @returns {number} Adjusted setup cost
 */
export function calculateSetupCost(setupTotalForQty, brand) {
  // For now, return the setup cost as-is
  // Can be enhanced with brand-specific rules if needed
  return setupTotalForQty;
}

/**
 * Get print cost rules table by brand and technique
 * @param {string} brand - Brand name
 * @param {string} technique - Printing technique
 * @returns {Object} Print cost rules
 */
export function getPrintCostRules(brand, technique) {
  // This can be extended with brand and technique specific rules
  // For now, we'll use a simple structure
  
  const basePrintCosts = {
    '1-color': { base: 2.54, multiplier: 1.0 },
    '2-colors': { base: 3.50, multiplier: 1.2 },
    '3-colors': { base: 4.20, multiplier: 1.4 },
    '4-colors': { base: 4.80, multiplier: 1.6 },
    'embroidery': { base: 5.50, multiplier: 1.8 },
    'full-color': { base: 6.00, multiplier: 2.0 },
    'no-print': { base: 0, multiplier: 0 }
  };
  
  return basePrintCosts[technique] || basePrintCosts['1-color'];
}

export default brandRules;