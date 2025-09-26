/**
 * Calculate Shipping Cost Module
 * 
 * Clean, modular shipping cost calculation system
 */

// Core calculation function
export { default as calculateShippingCost } from './calculateShippingCost';

// Main shipping cost service
export {
  calculateProductShippingCost,
  formatShippingCost,
  getShippingCostBreakdown
} from './shippingCostService';

// Re-export the main function for convenience
export { calculateProductShippingCost as default } from './shippingCostService';