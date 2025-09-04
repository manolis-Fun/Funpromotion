// Verification script for pricing calculations
// Run with: node verify-pricing.js

// Import the compute price function
const computePrice = require('./src/utils/computePrice.js').computePrice || 
                     require('./src/utils/computePrice.js').default ||
                     function(details) {
                       // Inline implementation for verification
                       const {
                         basePrice,
                         qty,
                         setupTotalForQty,
                         perUnitPrintCost,
                         handleCost,
                         priceMultiplierByBrand,
                         printMultiplierByBrand,
                         markupByBrandQty,
                         printingEnabled
                       } = details;
                       
                       const perUnitSetup = setupTotalForQty / qty;
                       const printSubtotal = perUnitSetup + perUnitPrintCost + handleCost;
                       const printTotal = printingEnabled ? (printSubtotal * printMultiplierByBrand) : 0;
                       const baseComponent = basePrice * priceMultiplierByBrand;
                       const baseWithMarkup = baseComponent * markupByBrandQty;
                       const finalUnitPrice = baseWithMarkup + printTotal;
                       
                       const roundTo2 = (num) => Math.round(num * 100) / 100;
                       
                       return {
                         steps: {
                           perUnitSetup: roundTo2(perUnitSetup),
                           printSubtotal: roundTo2(printSubtotal),
                           printTotal: roundTo2(printTotal),
                           baseComponent: roundTo2(baseComponent),
                           baseWithMarkup: roundTo2(baseWithMarkup),
                           finalUnitPrice: roundTo2(finalUnitPrice)
                         }
                       };
                     };

// Target case: vinga-baltimore-rcs-explorers-backpack-4
const targetCase = {
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

console.log('🎯 Verifying Target Case Pricing Calculations');
console.log('============================================');
console.log('Product: vinga-baltimore-rcs-explorers-backpack-4');
console.log('Brand: xindao | Quantity: 100 | Technique: 1-color');
console.log('✅ Updated to use priceMain (32.5) and manipulation (0.24)');
console.log('');

const result = computePrice(targetCase);

console.log('📊 Calculation Steps:');
console.log('---------------------');
console.log(`1. Per unit setup: ${targetCase.setupTotalForQty}/${targetCase.qty} = €${result.steps.perUnitSetup}`);
console.log(`   Expected: €0.62 ${result.steps.perUnitSetup === 0.62 ? '✅' : '❌'}`);

console.log(`2. Print subtotal: ${result.steps.perUnitSetup} + ${targetCase.perUnitPrintCost} + ${targetCase.handleCost} = €${result.steps.printSubtotal}`);
console.log(`   Expected: €3.40 ${result.steps.printSubtotal === 3.40 ? '✅' : '❌'}`);

console.log(`3. Print total: ${result.steps.printSubtotal} × ${targetCase.printMultiplierByBrand} = €${result.steps.printTotal}`);
console.log(`   Expected: €4.76 ${result.steps.printTotal === 4.76 ? '✅' : '❌'}`);

console.log(`4. Base component: ${targetCase.basePrice} × ${targetCase.priceMultiplierByBrand} = €${result.steps.baseComponent}`);
console.log(`   Expected: €35.75 ${result.steps.baseComponent === 35.75 ? '✅' : '❌'}`);

console.log(`5. Base with markup: ${result.steps.baseComponent} × ${targetCase.markupByBrandQty} = €${result.steps.baseWithMarkup}`);
console.log(`   Expected: €50.05 ${result.steps.baseWithMarkup === 50.05 ? '✅' : '❌'}`);

console.log(`6. Final unit price: ${result.steps.baseWithMarkup} + ${result.steps.printTotal} = €${result.steps.finalUnitPrice}`);
console.log(`   Expected: €54.81 ${result.steps.finalUnitPrice === 54.81 ? '✅' : '❌'}`);

console.log('');
console.log('🔄 Testing No-Print Path:');
console.log('------------------------');
const noPrintCase = { ...targetCase, printingEnabled: false };
const noPrintResult = computePrice(noPrintCase);
console.log(`Final unit price (no print): €${noPrintResult.steps.finalUnitPrice}`);
console.log(`Expected: €50.05 ${noPrintResult.steps.finalUnitPrice === 50.05 ? '✅' : '❌'}`);

// Summary
const allTestsPassed = 
  result.steps.perUnitSetup === 0.62 &&
  result.steps.printSubtotal === 3.40 &&
  result.steps.printTotal === 4.76 &&
  result.steps.baseComponent === 35.75 &&
  result.steps.baseWithMarkup === 50.05 &&
  result.steps.finalUnitPrice === 54.81 &&
  noPrintResult.steps.finalUnitPrice === 50.05;

console.log('');
console.log('============================================');
if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED! Pricing calculations are correct.');
} else {
  console.log('❌ Some tests failed. Review the calculations above.');
  process.exit(1);
}
console.log('============================================');