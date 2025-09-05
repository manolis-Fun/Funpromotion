/**
 * Pure function to compute pricing with exact business rules
 * 
 * Target case verification:
 * - slug: vinga-baltimore-rcs-explorers-backpack-4
 * - brand: xindao
 * - quantity: 100
 * - color: 1-color
 * - position: item-front
 * - print option: printing enabled
 * 
 * Expected results for this case:
 * - Per unit setup: 62/100 = 0.62
 * - Pre-multiplier print subtotal: 0.62 + 2.54 + 0.24 = 3.40
 * - After print multiplier: 3.40 * 1.4 = 4.76
 * - Base with brand price multiplier: 32.5 * 1.1 = 35.75
 * - Base with markup: 35.75 * 1.4 = 50.05
 * - Final per unit with print: 50.05 + 4.76 = 54.81
 * - Final per unit without print: 50.05
 */

/**
 * Compute price with full breakdown
 * @param {Object} details - Pricing details
 * @returns {Object} Pricing breakdown with all intermediate values
 */
export function computePrice(details) {
  const {
    basePrice, // Now sourced from priceMain
    qty,
    brand,
    technique,
    position,
    setupTotalForQty,
    perUnitPrintCost,
    handleCost, // Now sourced from manipulation field
    priceMultiplierByBrand,
    printMultiplierByBrand,
    markupByBrandQty,
    printingEnabled
  } = details;
  
  // Validate inputs
  const errors = [];
  if (typeof basePrice !== 'number' || basePrice < 0 || isNaN(basePrice)) {
    errors.push(`Invalid basePrice: ${basePrice}`);
  }
  if (typeof qty !== 'number' || qty <= 0 || isNaN(qty)) {
    errors.push(`Invalid qty: ${qty}`);
  }
  if (typeof setupTotalForQty !== 'number' || setupTotalForQty < 0 || isNaN(setupTotalForQty)) {
    errors.push(`Invalid setupTotalForQty: ${setupTotalForQty}`);
  }
  if (typeof perUnitPrintCost !== 'number' || perUnitPrintCost < 0 || isNaN(perUnitPrintCost)) {
    errors.push(`Invalid perUnitPrintCost: ${perUnitPrintCost}`);
  }
  if (typeof handleCost !== 'number' || handleCost < 0 || isNaN(handleCost)) {
    errors.push(`Invalid handleCost: ${handleCost}`);
  }
  if (typeof priceMultiplierByBrand !== 'number' || priceMultiplierByBrand <= 0 || isNaN(priceMultiplierByBrand)) {
    errors.push(`Invalid priceMultiplierByBrand: ${priceMultiplierByBrand}`);
  }
  if (typeof printMultiplierByBrand !== 'number' || printMultiplierByBrand <= 0 || isNaN(printMultiplierByBrand)) {
    errors.push(`Invalid printMultiplierByBrand: ${printMultiplierByBrand}`);
  }
  if (typeof markupByBrandQty !== 'number' || markupByBrandQty <= 0 || isNaN(markupByBrandQty)) {
    errors.push(`Invalid markupByBrandQty: ${markupByBrandQty}`);
  }
  
  if (errors.length > 0) {
    throw new Error(`Pricing calculation failed:\n${errors.join('\n')}`);
  }
  
  // Step 1: Calculate per unit setup
  const perUnitSetup = setupTotalForQty / qty;
  
  // Step 2: Calculate print subtotal (before multipliers)
  const printSubtotal = perUnitSetup + perUnitPrintCost + handleCost;
  
  // Step 3: Apply print multiplier if printing is enabled
  const printTotal = printingEnabled ? (printSubtotal * printMultiplierByBrand) : 0;
  
  // Step 4: Calculate base component with brand price multiplier
  const baseComponent = basePrice * priceMultiplierByBrand;
  
  // Step 5: Apply markup to base
  const baseWithMarkup = baseComponent * markupByBrandQty;
  
  // Step 6: Calculate final unit price
  const finalUnitPrice = baseWithMarkup + printTotal;
  
  // Round to 2 decimal places for display (but keep full precision internally)
  const roundTo2 = (num) => Math.round(num * 100) / 100;
  
  return {
    inputs: {
      basePrice,
      qty,
      brand,
      technique,
      position,
      setupTotalForQty,
      perUnitPrintCost,
      handleCost,
      priceMultiplierByBrand,
      printMultiplierByBrand,
      markupByBrandQty,
      printingEnabled
    },
    steps: {
      perUnitSetup: roundTo2(perUnitSetup),
      printSubtotal: roundTo2(printSubtotal),
      printTotal: roundTo2(printTotal),
      baseComponent: roundTo2(baseComponent),
      baseWithMarkup: roundTo2(baseWithMarkup),
      finalUnitPrice: roundTo2(finalUnitPrice)
    },
    // Keep raw values for precise calculations
    stepsRaw: {
      perUnitSetup,
      printSubtotal,
      printTotal,
      baseComponent,
      baseWithMarkup,
      finalUnitPrice
    },
    source: {
      basePrice: "GraphQL.singleProductFields.priceMain",
      setupTotalForQty: "variation meta or rules table",
      perUnitPrintCost: "rules table",
      handleCost: "GraphQL.singleProductFields.manipulation",
      priceMultiplierByBrand: "brand rules",
      printMultiplierByBrand: "brand rules",
      markupByBrandQty: "brand x qty rules"
    }
  };
}

/**
 * Assert expected values for the target case
 * This is used for testing and verification
 */
export function assertTargetCase() {
  // Target case: vinga-baltimore-rcs-explorers-backpack-4
  const targetDetails = {
    basePrice: 32.5,
    qty: 100,
    brand: 'xindao',
    technique: '1-color',
    position: 'item-front',
    setupTotalForQty: 62,
    perUnitPrintCost: 2.54,
    handleCost: 0.24,
    priceMultiplierByBrand: 1.1,
    printMultiplierByBrand: 1.4,
    markupByBrandQty: 1.4,
    printingEnabled: true
  };
  
  const result = computePrice(targetDetails);
  
  // Assert expected values with exact numbers
  const assertions = [
    { name: 'perUnitSetup', expected: 0.62, actual: result.steps.perUnitSetup },
    { name: 'printSubtotal', expected: 3.40, actual: result.steps.printSubtotal },
    { name: 'printTotal', expected: 4.76, actual: result.steps.printTotal },
    { name: 'baseComponent', expected: 35.75, actual: result.steps.baseComponent },
    { name: 'baseWithMarkup', expected: 50.05, actual: result.steps.baseWithMarkup },
    { name: 'finalUnitPrice', expected: 54.81, actual: result.steps.finalUnitPrice }
  ];
  
  const failures = [];
  for (const { name, expected, actual } of assertions) {
    if (Math.abs(expected - actual) > 0.01) {
      failures.push(`${name}: expected ${expected}, got ${actual}`);
    }
  }
  
  if (failures.length > 0) {
    throw new Error(`Target case assertion failed:\n${failures.join('\n')}`);
  }
  
  // Also test no-print path
  const noPrintDetails = { ...targetDetails, printingEnabled: false };
  const noPrintResult = computePrice(noPrintDetails);
  
  if (Math.abs(noPrintResult.steps.finalUnitPrice - 50.05) > 0.01) {
    throw new Error(`No-print assertion failed: expected 50.05, got ${noPrintResult.steps.finalUnitPrice}`);
  }
  
  console.log('✅ All target case assertions passed!');
  return true;
}

export default computePrice;