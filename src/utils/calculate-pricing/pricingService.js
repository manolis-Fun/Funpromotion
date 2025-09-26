/**
 * Main Pricing Service
 * 
 * This service orchestrates all pricing calculations by:
 * 1. Extracting printing costs from variations
 * 2. Getting brand and product multipliers
 * 3. Calculating final prices using the core formula
 */

import calculateTotalPrice from './calculateTotalPrice';
import { findMatchingVariation, extractPrintingCosts } from './extractPrintingData';
import { extractAllMultipliers } from './extractMultipliers';

/**
 * Calculate pricing for a product with optional printing
 * 
 * @param {Object} params - Pricing parameters
 * @param {Object} params.product - Product data with base price and brand
 * @param {Object} params.selection - Selected printing options
 * @param {number} params.quantity - Quantity to calculate for
 * @param {Object} params.priceMultipliers - Brand multipliers data
 * @param {Object} params.priceMarkups - Product markups data
 * @returns {Object} Complete pricing breakdown
 */
export function calculateProductPricing({
  product,
  selection = {},
  quantity = 1,
  priceMultipliers = {},
  priceMarkups = {}
}) {
  // Extract product data
  const basePrice = parseFloat(product?.priceMain || 0);
  const brandName = product?.singleProductFields?.brand || '';
  const handleCost = parseFloat(product?.singleProductFields?.manipulation || 0);
  const variations = product?.variations || [];

  // Extract multipliers
  const { brandMultiplier, printMultiplier, productMultiplier } = extractAllMultipliers(
    priceMultipliers,
    priceMarkups,
    brandName,
    basePrice,
    quantity
  );

  // Handle no-print scenario
  if (selection.technique === 'no-print' || !selection.technique) {
    return calculateTotalPrice({
      basePrice,
      brandMultiplier,
      productMultiplier,
      handleCost: 0,
      printingForQty: 0,
      setupCost: 0,
      qty: quantity,
      printMultiplier: 1
    });
  }

  // Find matching variation for printing
  const matchingVariation = findMatchingVariation(variations, selection);
  
  if (!matchingVariation) {
    console.warn('No matching variation found for selection:', selection);
    // Return product price without printing if no variation found
    return calculateTotalPrice({
      basePrice,
      brandMultiplier,
      productMultiplier,
      handleCost: 0,
      printingForQty: 0,
      setupCost: 0,
      qty: quantity,
      printMultiplier: 1
    });
  }

  // Extract printing costs
  const { printingForQty, setupCost } = extractPrintingCosts(
    matchingVariation,
    quantity,
    handleCost
  );

  // Calculate final pricing
  return calculateTotalPrice({
    basePrice,
    brandMultiplier,
    productMultiplier,
    handleCost,
    printingForQty,
    setupCost,
    qty: quantity,
    printMultiplier
  });
}

/**
 * Calculate pricing for multiple quantities at once
 * 
 * @param {Object} params - Same as calculateProductPricing
 * @param {Array} quantities - Array of quantities to calculate
 * @returns {Array} Array of pricing results for each quantity
 */
export function calculateMultipleQuantities(params, quantities = [50, 100, 250, 500, 1000, 2500]) {
  return quantities.map(qty => ({
    quantity: qty,
    ...calculateProductPricing({ ...params, quantity: qty })
  }));
}

/**
 * Format price for display
 * 
 * @param {number} price - Price to format
 * @param {string} currency - Currency symbol (default: €)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted price string
 */
export function formatPrice(price, currency = '€', decimals = 2) {
  const formatted = parseFloat(price || 0).toFixed(decimals);
  return `${currency}${formatted}`;
}

/**
 * Get pricing comparison for different quantities
 * 
 * @param {Object} params - Same as calculateProductPricing
 * @param {Array} quantities - Quantities to compare
 * @returns {Object} Comparison data with savings
 */
export function getPricingComparison(params, quantities = [50, 100, 250, 500, 1000, 2500]) {
  const results = calculateMultipleQuantities(params, quantities);
  
  // Use first quantity as baseline
  const baseline = results[0];
  
  return results.map(result => {
    const savingsPerUnit = baseline.totalPrice - result.totalPrice;
    const savingsPercentage = baseline.totalPrice > 0 
      ? (savingsPerUnit / baseline.totalPrice) * 100 
      : 0;
    
    return {
      ...result,
      savings: {
        perUnit: savingsPerUnit,
        percentage: savingsPercentage,
        total: savingsPerUnit * result.quantity
      }
    };
  });
}