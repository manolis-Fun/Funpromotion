/**
 * Calculate Pricing Module
 * 
 * Clean, modular pricing calculation system
 */

// Core calculation function
export { default as calculateTotalPrice } from './calculateTotalPrice';

// Data extraction utilities
export {
  findMatchingVariation,
  getSetupCost,
  getPrintingPriceForQuantity,
  extractPrintingCosts
} from './extractPrintingData';

// Multiplier extraction utilities
export {
  extractBrandMultipliers,
  extractProductMultiplier,
  extractAllMultipliers
} from './extractMultipliers';

// Main pricing service
export {
  calculateProductPricing,
  calculateMultipleQuantities,
  formatPrice,
  getPricingComparison
} from './pricingService';

// Re-export the main function for convenience
export { calculateProductPricing as default } from './pricingService';