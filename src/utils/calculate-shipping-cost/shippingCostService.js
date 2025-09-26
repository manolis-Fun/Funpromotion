/**
 * Shipping Cost Service
 * 
 * Orchestrates shipping cost calculations by extracting product data
 * and applying the shipping cost formula
 */

import { calculateShippingCost } from './calculateShippingCost';

/**
 * Calculate shipping cost for a product with selected options
 * 
 * @param {Object} params - Shipping cost calculation parameters
 * @param {Object} params.product - Product data with brand and weight information
 * @param {number} params.quantity - Quantity to calculate for
 * @param {Object} params.shippingCosts - Shipping cost configuration data
 * @param {boolean} params.roundUp - Whether to round up volume (default: true)
 * @returns {Object} Shipping cost breakdown
 */
export function calculateProductShippingCost({
  product,
  quantity = 1,
  shippingCosts = {},
  roundUp = true
}) {
  // Extract product data
  const brandName = product?.singleProductFields?.brand || '';
  const weightPerUnit = parseFloat(product?.singleProductFields?.v1W1 || product?.weight || 0); // Weight from v1W1 field or fallback to weight
  
  // Validate required data
  if (!brandName) {
    return {
      total: 0,
      perPiece: 0,
      debug: {
        brandIndex: -1,
        volumeKg: 0,
        rangeIndex: -1,
        min: 0,
        max: null,
        minus: 0,
        cost: 0,
        fix: 0,
        markup: 1,
        billableKg: 0
      },
      notAvailable: true,
      error: 'Product brand is required for shipping cost calculation'
    };
  }

  if (!weightPerUnit || weightPerUnit <= 0) {
    return {
      total: 0,
      perPiece: 0,
      debug: {
        brandIndex: -1,
        volumeKg: 0,
        rangeIndex: -1,
        min: 0,
        max: null,
        minus: 0,
        cost: 0,
        fix: 0,
        markup: 1,
        billableKg: 0
      },
      notAvailable: true,
      error: 'Product weight is required for shipping cost calculation'
    };
  }

  if (!shippingCosts || typeof shippingCosts !== 'object') {
    return {
      total: 0,
      perPiece: 0,
      debug: {
        brandIndex: -1,
        volumeKg: 0,
        rangeIndex: -1,
        min: 0,
        max: null,
        minus: 0,
        cost: 0,
        fix: 0,
        markup: 1,
        billableKg: 0
      },
      notAvailable: true,
      error: 'Shipping cost configuration data is required'
    };
  }

  try {
    // Calculate shipping cost using the core function
    const result = calculateShippingCost(shippingCosts, brandName, weightPerUnit, quantity, roundUp);
    
    // If no brand or range was found, mark as not available
    if (result.debug.brandIndex === -1) {
      return {
        total: 0,
        perPiece: 0,
        debug: result.debug,
        notAvailable: true,
        error: `Brand not found in shipping configuration: ${brandName}`
      };
    }
    
    if (result.debug.rangeIndex === -1) {
      return {
        total: 0,
        perPiece: 0,
        debug: result.debug,
        notAvailable: true,
        error: `No shipping range found for volume: ${result.debug.volumeKg}kg`
      };
    }
    
    // Only return successful result if we have valid calculations
    return {
      ...result,
      notAvailable: false
    };
  } catch (error) {
    console.warn('Shipping cost calculation failed:', error.message);
    
    return {
      total: 0,
      perPiece: 0,
      debug: {
        brandIndex: -1,
        volumeKg: 0,
        rangeIndex: -1,
        min: 0,
        max: null,
        minus: 0,
        cost: 0,
        fix: 0,
        markup: 1,
        billableKg: 0
      },
      notAvailable: true,
      error: error.message
    };
  }
}

/**
 * Format shipping cost for display
 * 
 * @param {number} cost - Cost to format
 * @param {string} currency - Currency symbol (default: €)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted cost string
 */
export function formatShippingCost(cost, currency = '€', decimals = 2) {
  if (typeof cost !== 'number' || isNaN(cost)) return `${currency}0.00`;
  const formatted = cost.toFixed(decimals);
  return `${currency}${formatted}`;
}

/**
 * Get shipping cost breakdown for display
 * 
 * @param {Object} shippingCostResult - Result from calculateProductShippingCost
 * @returns {Object} Formatted shipping cost breakdown
 */
export function getShippingCostBreakdown(shippingCostResult) {
  const isNotAvailable = shippingCostResult.notAvailable;
  
  return {
    total: {
      amount: shippingCostResult.total,
      formatted: isNotAvailable ? 'Not available' : formatShippingCost(shippingCostResult.total),
    },
    perPiece: {
      amount: shippingCostResult.perPiece,
      formatted: isNotAvailable ? 'Not available' : formatShippingCost(shippingCostResult.perPiece),
    },
    breakdown: {
      volume: isNotAvailable ? 'Not available' : `${shippingCostResult.debug.volumeKg}kg`,
      billableVolume: isNotAvailable ? 'Not available' : `${shippingCostResult.debug.billableKg}kg`,
      baseCost: isNotAvailable ? 'Not available' : formatShippingCost(shippingCostResult.debug.fix + shippingCostResult.debug.billableKg * shippingCostResult.debug.cost),
      markup: isNotAvailable ? 'Not available' : `×${shippingCostResult.debug.markup}`,
    },
    isAvailable: !isNotAvailable,
    error: shippingCostResult.error || null
  };
}