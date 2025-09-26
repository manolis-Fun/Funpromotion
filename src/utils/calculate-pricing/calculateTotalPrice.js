/**
 * Core Pricing Calculation Function
 * 
 * This function calculates the total price based on the formula:
 * 1. Final Product Price = basePrice × brandMultiplier × productMultiplier
 * 2. Printing Cost = handleCost + printingForQty + (setupCost / qty)
 * 3. Final Printing Cost = printingCost × printMultiplier
 * 4. Total Price = finalProductPrice + finalPrintingCost
 */

function calculateTotalPrice({
  // Product pricing parameters
  basePrice = 0,
  brandMultiplier = 1,
  productMultiplier = 1,
  
  // Printing cost parameters
  handleCost = 0,
  printingForQty = 0,
  setupCost = 0,
  qty = 1,
  printMultiplier = 1
}) {
  // Validate inputs
  if (qty <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  // 1. Calculate Final Product Price (without print)
  const finalProductPrice = basePrice * brandMultiplier * productMultiplier;

  // 2. Calculate Printing Cost (before multiplier)
  const setupCostPerUnit = setupCost / qty;
  const printingCost = handleCost + printingForQty + setupCostPerUnit;

  // 3. Calculate Final Printing Cost (after multiplier)
  const finalPrintingCost = printingCost * printMultiplier;

  // 4. Calculate Total Price
  const totalPrice = finalProductPrice + finalPrintingCost;

  // Return detailed breakdown
  return {
    // Individual components
    basePrice,
    brandMultiplier,
    productMultiplier,
    handleCost,
    printingForQty,
    setupCost,
    setupCostPerUnit,
    qty,
    printMultiplier,
    
    // Calculated values
    printingCost,  // Before multiplier
    finalProductPrice,
    finalPrintingCost,
    totalPrice,
    
    // Formatted values for display
    formatted: {
      finalProductPrice: finalProductPrice.toFixed(4),
      finalPrintingCost: finalPrintingCost.toFixed(4),
      totalPrice: totalPrice.toFixed(4),
      totalPriceRounded: totalPrice.toFixed(2),
      pricePerUnit: totalPrice.toFixed(4),
      totalForQuantity: (totalPrice * qty).toFixed(2)
    }
  };
}

export default calculateTotalPrice;