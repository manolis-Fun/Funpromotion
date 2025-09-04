import { computePrice, assertTargetCase } from './computePrice';

describe('computePrice', () => {
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

  describe('Target Case - vinga-baltimore-rcs-explorers-backpack-4', () => {
    test('should calculate exact values for target case with printing enabled', () => {
      const result = computePrice(targetCase);
      
      // Assert exact intermediate values
      expect(result.steps.perUnitSetup).toBe(0.62);
      expect(result.steps.printSubtotal).toBe(3.40);
      expect(result.steps.printTotal).toBe(4.76);
      expect(result.steps.baseComponent).toBe(35.75);
      expect(result.steps.baseWithMarkup).toBe(50.05);
      
      // Assert final unit price
      expect(result.steps.finalUnitPrice).toBe(54.81);
    });

    test('should calculate exact value for target case with printing disabled', () => {
      const noPrintCase = { ...targetCase, printingEnabled: false };
      const result = computePrice(noPrintCase);
      
      // With no print, final price should be just base with markup
      expect(result.steps.printTotal).toBe(0);
      expect(result.steps.finalUnitPrice).toBe(50.05);
    });

    test('should pass assertTargetCase validation', () => {
      expect(() => assertTargetCase()).not.toThrow();
    });
  });

  describe('Price Breakdown Snapshot', () => {
    test('should generate complete breakdown for target case', () => {
      const result = computePrice(targetCase);
      
      // Create a snapshot-style output
      const breakdown = {
        inputs: result.inputs,
        steps: result.steps,
        sources: result.source
      };
      
      // Log the full breakdown (useful for debugging)
      console.log('Full Pricing Breakdown:');
      console.log(JSON.stringify(breakdown, null, 2));
      
      // Verify structure
      expect(breakdown.inputs).toBeDefined();
      expect(breakdown.steps).toBeDefined();
      expect(breakdown.sources).toBeDefined();
      
      // Verify all required fields are present
      expect(breakdown.steps).toHaveProperty('perUnitSetup');
      expect(breakdown.steps).toHaveProperty('printSubtotal');
      expect(breakdown.steps).toHaveProperty('printTotal');
      expect(breakdown.steps).toHaveProperty('baseComponent');
      expect(breakdown.steps).toHaveProperty('baseWithMarkup');
      expect(breakdown.steps).toHaveProperty('finalUnitPrice');
    });
  });

  describe('Input Validation', () => {
    test('should throw error for negative basePrice', () => {
      const invalidCase = { ...targetCase, basePrice: -10 };
      expect(() => computePrice(invalidCase)).toThrow('Invalid basePrice');
    });

    test('should throw error for NaN values', () => {
      const invalidCase = { ...targetCase, qty: NaN };
      expect(() => computePrice(invalidCase)).toThrow('Invalid qty');
    });

    test('should throw error for zero quantity', () => {
      const invalidCase = { ...targetCase, qty: 0 };
      expect(() => computePrice(invalidCase)).toThrow('Invalid qty');
    });

    test('should throw error for negative multipliers', () => {
      const invalidCase = { ...targetCase, priceMultiplierByBrand: -1 };
      expect(() => computePrice(invalidCase)).toThrow('Invalid priceMultiplierByBrand');
    });
  });

  describe('Different Quantities', () => {
    test('should calculate correctly for qty=50', () => {
      const case50 = { ...targetCase, qty: 50, setupTotalForQty: 62 };
      const result = computePrice(case50);
      
      // Setup per unit should be higher for smaller quantity
      expect(result.steps.perUnitSetup).toBe(1.24);
      
      // Print subtotal: 1.24 + 2.54 + 0.24 = 4.02
      expect(result.steps.printSubtotal).toBe(4.02);
      
      // After print multiplier: 4.02 * 1.4 = 5.628 rounded to 5.63
      expect(result.steps.printTotal).toBe(5.63);
    });

    test('should calculate correctly for qty=250', () => {
      const case250 = { ...targetCase, qty: 250, setupTotalForQty: 62 };
      const result = computePrice(case250);
      
      // Setup per unit should be lower for larger quantity
      expect(result.steps.perUnitSetup).toBe(0.25);
      
      // Print subtotal: 0.25 + 2.54 + 0.24 = 3.03
      expect(result.steps.printSubtotal).toBe(3.03);
      
      // After print multiplier: 3.03 * 1.4 = 4.242 rounded to 4.24
      expect(result.steps.printTotal).toBe(4.24);
    });
  });

  describe('Different Brands', () => {
    test('should calculate correctly for midocean brand', () => {
      const midoceanCase = {
        ...targetCase,
        brand: 'midocean',
        priceMultiplierByBrand: 1.15,
        printMultiplierByBrand: 1.5,
        markupByBrandQty: 1.5,
        handleCost: 0.20
      };
      
      const result = computePrice(midoceanCase);
      
      // Base component: 32.5 * 1.15 = 37.375 rounded to 37.38
      expect(result.steps.baseComponent).toBe(37.38);
      
      // Base with markup: 37.38 * 1.5 = 56.07
      expect(result.steps.baseWithMarkup).toBe(56.07);
      
      // Print subtotal: 0.62 + 2.54 + 0.20 = 3.36
      expect(result.steps.printSubtotal).toBe(3.36);
      
      // Print total: 3.36 * 1.5 = 5.04
      expect(result.steps.printTotal).toBe(5.04);
      
      // Final: 56.07 + 5.04 = 61.11
      expect(result.steps.finalUnitPrice).toBe(61.11);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very small quantities', () => {
      const smallQty = { ...targetCase, qty: 1, setupTotalForQty: 62 };
      const result = computePrice(smallQty);
      
      // Per unit setup for qty=1 should be full setup cost
      expect(result.steps.perUnitSetup).toBe(62);
      
      // This would result in very high per-unit cost
      expect(result.steps.printSubtotal).toBe(64.78);
      expect(result.steps.printTotal).toBe(90.69);
      expect(result.steps.finalUnitPrice).toBe(140.74);
    });

    test('should handle very large quantities', () => {
      const largeQty = { ...targetCase, qty: 10000, setupTotalForQty: 62 };
      const result = computePrice(largeQty);
      
      // Per unit setup for large qty should be very small
      expect(result.steps.perUnitSetup).toBe(0.01);
      expect(result.steps.printSubtotal).toBe(2.79);
      expect(result.steps.printTotal).toBe(3.91);
      expect(result.steps.finalUnitPrice).toBe(53.96);
    });

    test('should handle zero setup cost', () => {
      const noSetup = { ...targetCase, setupTotalForQty: 0 };
      const result = computePrice(noSetup);
      
      expect(result.steps.perUnitSetup).toBe(0);
      expect(result.steps.printSubtotal).toBe(2.78);
      expect(result.steps.printTotal).toBe(3.89);
      expect(result.steps.finalUnitPrice).toBe(53.94);
    });
  });
});

// Run the test if this file is executed directly
if (require.main === module) {
  assertTargetCase();
  console.log('✅ All manual assertions passed!');
}