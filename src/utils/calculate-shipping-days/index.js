/**
 * Calculate Shipping Days Module
 * 
 * Clean, modular shipping days calculation system
 */

// Core calculation function
export { default as calculateShippingDays } from './calculateShippingDays';

// Main shipping service
export {
  calculateProductShipping,
  formatShippingDays,
  getShippingOptions
} from './shippingService';

// Re-export the main function for convenience
export { calculateProductShipping as default } from './shippingService';