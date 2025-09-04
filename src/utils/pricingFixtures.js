/**
 * Test fixtures for pricing calculations
 * Target case: vinga-baltimore-rcs-explorers-backpack-4
 */

export const TARGET_CASE = {
  slug: 'vinga-baltimore-rcs-explorers-backpack-4',
  brand: 'xindao',
  quantity: 100,
  technique: '1-color',
  position: 'item-front',
  printingEnabled: true,
  
  // Input values
  inputs: {
    basePrice: 32.5, // From priceMain
    setupTotalForQty: 62,
    perUnitPrintCost: 2.54,
    handleCost: 0.24, // From manipulation field
    priceMultiplierByBrand: 1.1,
    printMultiplierByBrand: 1.4,
    markupByBrandQty: 1.4
  },
  
  // Expected calculations
  expected: {
    perUnitSetup: 0.62,
    printSubtotal: 3.40,
    printTotal: 4.76,
    baseComponent: 35.75,
    baseWithMarkup: 50.05,
    finalUnitPrice: 54.81,
    finalUnitPriceNoprint: 50.05
  },
  
  // GraphQL mock data structure
  graphqlMock: {
    product: {
      id: '12345',
      slug: 'vinga-baltimore-rcs-explorers-backpack-4',
      title: 'Vinga Baltimore RCS Explorers Backpack',
      singleProductFields: {
        priceMain: '32.50',
        brand: 'xindao',
        v1W1: 0.5,
        manipulation: 0.24 // Handle cost from manipulation field
      },
      variations: {
        nodes: [
          {
            id: 'var-001',
            databaseId: 1001,
            attributes: {
              nodes: [
                { label: 'technique', value: '1-color' },
                { label: 'position', value: 'item-front' }
              ]
            },
            metaData: [
              { key: '_price_print_setup', value: '62' },
              { key: '_price_print_50_100', value: '2.54' },
              { key: '_price_print_100_250', value: '2.20' }
            ]
          }
        ]
      }
    }
  }
};

// Additional test cases for different scenarios
export const TEST_CASES = {
  // Different quantities
  qty50: {
    ...TARGET_CASE,
    quantity: 50,
    expected: {
      perUnitSetup: 1.24,
      printSubtotal: 4.02,
      printTotal: 5.63,
      baseComponent: 35.75,
      baseWithMarkup: 50.05,
      finalUnitPrice: 55.68
    }
  },
  
  qty250: {
    ...TARGET_CASE,
    quantity: 250,
    inputs: {
      ...TARGET_CASE.inputs,
      perUnitPrintCost: 2.20 // Different tier
    },
    expected: {
      perUnitSetup: 0.25,
      printSubtotal: 2.69,
      printTotal: 3.77,
      baseComponent: 35.75,
      baseWithMarkup: 50.05,
      finalUnitPrice: 53.82
    }
  },
  
  // No printing
  noprint: {
    ...TARGET_CASE,
    printingEnabled: false,
    technique: 'no-print',
    expected: {
      perUnitSetup: 0.62,
      printSubtotal: 3.40,
      printTotal: 0,
      baseComponent: 35.75,
      baseWithMarkup: 50.05,
      finalUnitPrice: 50.05
    }
  },
  
  // Different brand
  midocean: {
    ...TARGET_CASE,
    brand: 'midocean',
    inputs: {
      ...TARGET_CASE.inputs,
      handleCost: 0.20,
      priceMultiplierByBrand: 1.15,
      printMultiplierByBrand: 1.5,
      markupByBrandQty: 1.5
    },
    expected: {
      perUnitSetup: 0.62,
      printSubtotal: 3.36,
      printTotal: 5.04,
      baseComponent: 37.38,
      baseWithMarkup: 56.07,
      finalUnitPrice: 61.11
    }
  },
  
  // Different techniques
  twoColors: {
    ...TARGET_CASE,
    technique: '2-colors',
    inputs: {
      ...TARGET_CASE.inputs,
      perUnitPrintCost: 3.50
    },
    expected: {
      perUnitSetup: 0.62,
      printSubtotal: 4.36,
      printTotal: 6.10,
      baseComponent: 35.75,
      baseWithMarkup: 50.05,
      finalUnitPrice: 56.15
    }
  },
  
  embroidery: {
    ...TARGET_CASE,
    technique: 'embroidery',
    inputs: {
      ...TARGET_CASE.inputs,
      perUnitPrintCost: 5.50,
      setupTotalForQty: 85
    },
    expected: {
      perUnitSetup: 0.85,
      printSubtotal: 6.59,
      printTotal: 9.23,
      baseComponent: 35.75,
      baseWithMarkup: 50.05,
      finalUnitPrice: 59.28
    }
  }
};

/**
 * Get test case by name
 * @param {string} name - Test case name
 * @returns {Object} Test case data
 */
export function getTestCase(name) {
  if (name === 'target') {
    return TARGET_CASE;
  }
  return TEST_CASES[name] || null;
}

/**
 * Generate details object for computePrice function
 * @param {Object} testCase - Test case data
 * @returns {Object} Details object for computePrice
 */
export function generateComputePriceDetails(testCase) {
  return {
    basePrice: testCase.inputs.basePrice,
    qty: testCase.quantity,
    brand: testCase.brand,
    technique: testCase.technique,
    position: testCase.position,
    setupTotalForQty: testCase.inputs.setupTotalForQty,
    perUnitPrintCost: testCase.inputs.perUnitPrintCost,
    handleCost: testCase.inputs.handleCost,
    priceMultiplierByBrand: testCase.inputs.priceMultiplierByBrand,
    printMultiplierByBrand: testCase.inputs.printMultiplierByBrand,
    markupByBrandQty: testCase.inputs.markupByBrandQty,
    printingEnabled: testCase.printingEnabled
  };
}

export default {
  TARGET_CASE,
  TEST_CASES,
  getTestCase,
  generateComputePriceDetails
};