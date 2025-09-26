/**
 * Shipping Service
 * 
 * Orchestrates shipping days calculations by extracting product data
 * and applying the shipping days formula
 */

import { calculateShippingDays } from './calculateShippingDays';

/**
 * Calculate shipping days for a product with selected options
 * 
 * @param {Object} params - Shipping calculation parameters
 * @param {Object} params.product - Product data with brand information
 * @param {Object} params.selection - Selected printing options
 * @param {number} params.quantity - Quantity to calculate for
 * @param {Object} params.shippingDays - Shipping days configuration data
 * @returns {Object} Shipping days breakdown
 */
export function calculateProductShipping({
  product,
  selection = {},
  quantity = 1,
  shippingDays = {}
}) {
  // Extract product data
  const brandName = product?.singleProductFields?.brand || '';
  const technique = selection.technique || 'no-print';

  // Validate required data
  if (!brandName) {
    throw new Error('Product brand is required for shipping calculation');
  }

  if (!shippingDays || typeof shippingDays !== 'object') {
    throw new Error('Shipping days configuration data is required');
  }

  // Handle no-print scenario - no shipping calculation needed
  if (technique === 'no-print') {
    return {
      productionDays: 0,
      deliveryDays: {
        standard: 0,
        express: 0,
      },
      debug: {
        brandIndex: null,
        techniqueIndex: null,
        quantityBucket: quantity,
        standardAdd: 0,
        expressAdd: 0,
        extraStandardAdd: 0,
        extraExpressAdd: 0,
        isNoPrint: true
      },
      notAvailable: true
    };
  }

  try {
    // Calculate shipping days using the core function
    return calculateShippingDays(shippingDays, brandName, technique, quantity);
  } catch (error) {
    console.warn('Shipping calculation failed:', error.message);
    
    // Return not available instead of defaults
    return {
      productionDays: 0,
      deliveryDays: {
        standard: 0,
        express: 0,
      },
      debug: {
        brandIndex: null,
        techniqueIndex: null,
        quantityBucket: quantity,
        standardAdd: 0,
        expressAdd: 0,
        extraStandardAdd: 0,
        extraExpressAdd: 0,
        error: error.message
      },
      notAvailable: true
    };
  }
}

/**
 * Format shipping days for display
 * 
 * @param {number} days - Number of days
 * @param {string} type - Type of shipping (e.g., 'standard', 'express')
 * @param {boolean} notAvailable - Whether shipping calculation is not available
 * @returns {string} Formatted shipping text
 */
export function formatShippingDays(days, type = '', notAvailable = false) {
  if (notAvailable || days === 0) return 'Not available';
  if (days === 1) return '1 day';
  
  const typeText = type ? ` (${type})` : '';
  return `${days} days${typeText}`;
}

/**
 * Get shipping options with formatted text
 * 
 * @param {Object} shippingResult - Result from calculateProductShipping
 * @returns {Object} Formatted shipping options
 */
export function getShippingOptions(shippingResult) {
  const isNotAvailable = shippingResult.notAvailable;
  
  return {
    production: {
      days: shippingResult.productionDays,
      text: formatShippingDays(shippingResult.productionDays, 'production', isNotAvailable),
    },
    standard: {
      days: shippingResult.deliveryDays.standard,
      text: formatShippingDays(shippingResult.deliveryDays.standard, 'standard delivery', isNotAvailable),
      total: isNotAvailable ? 'Not available' : `Production ${shippingResult.productionDays} + Delivery ${shippingResult.deliveryDays.standard - shippingResult.productionDays} = ${shippingResult.deliveryDays.standard} days`,
    },
    express: {
      days: shippingResult.deliveryDays.express,
      text: formatShippingDays(shippingResult.deliveryDays.express, 'express delivery', isNotAvailable),
      total: isNotAvailable ? 'Not available' : `Production ${shippingResult.productionDays} + Delivery ${shippingResult.deliveryDays.express - shippingResult.productionDays} = ${shippingResult.deliveryDays.express} days`,
    },
  };
}