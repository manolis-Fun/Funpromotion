/**
 * Utilities for extracting brand and product multipliers from query data
 */

/**
 * Extract brand multipliers from price multipliers query data
 */
export function extractBrandMultipliers(priceMultipliers, brandName) {
  if (!priceMultipliers || !brandName) {
    return {
      brandMultiplier: 1,
      printMultiplier: 1
    };
  }

  // Find all brand numbers in the data
  const brandNumbers = [];
  Object.keys(priceMultipliers).forEach(key => {
    if (key.startsWith('brand_')) {
      const num = key.split('_')[1];
      if (!brandNumbers.includes(num)) {
        brandNumbers.push(num);
      }
    }
  });

  // Find matching brand
  for (const num of brandNumbers) {
    const brand = priceMultipliers[`brand_${num}`];
    if (brand === brandName) {
      const brandMultiplier = parseFloat(priceMultipliers[`PriceMultiplier_brand_${num}`]) || 1;
      const printMultiplier = parseFloat(priceMultipliers[`PrintMultiplier_brand_${num}`]) || 1;
      
      return {
        brandMultiplier,
        printMultiplier
      };
    }
  }

  // Return defaults if brand not found
  console.warn(`Brand multipliers not found for: ${brandName}`);
  return {
    brandMultiplier: 1,
    printMultiplier: 1
  };
}

/**
 * Extract product multiplier based on brand, price range, and quantity
 */
export function extractProductMultiplier(priceMarkups, brandName, basePrice, quantity) {
  if (!priceMarkups || !brandName) {
    return 1;
  }

  const brandKey = brandName.toLowerCase();
  
  // Find all brand numbers in the markup data
  const brandNumbers = [];
  Object.keys(priceMarkups).forEach(key => {
    if (key.startsWith('markup_brand_')) {
      const num = key.split('_')[2];
      if (!brandNumbers.includes(num)) {
        brandNumbers.push(num);
      }
    }
  });

  // Find matching brand and its price ranges
  for (const brandNum of brandNumbers) {
    const brand = priceMarkups[`markup_brand_${brandNum}`];
    if (!brand || brand.toLowerCase() !== brandKey) continue;

    // Check all price ranges for this brand (1-10)
    for (let rangeNum = 1; rangeNum <= 10; rangeNum++) {
      const fromKey = `markup_from_${rangeNum}_${brandNum}`;
      const toKey = `markup_to_${rangeNum}_${brandNum}`;
      
      const fromValue = parseFloat(priceMarkups[fromKey]);
      const toValue = parseFloat(priceMarkups[toKey]);
      
      // Skip if range is not defined
      if (isNaN(fromValue) || isNaN(toValue)) continue;
      
      // Check if base price falls within this range
      if (basePrice >= fromValue && basePrice <= toValue) {
        // Find the appropriate quantity markup
        const quantities = [1, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
        
        // Find the best matching quantity (closest quantity >= requested)
        let bestQuantity = quantities.find(q => q >= quantity);
        if (!bestQuantity) {
          bestQuantity = quantities[quantities.length - 1];
        }
        
        const markupKey = `markup_${bestQuantity}_${rangeNum}_${brandNum}`;
        const markup = parseFloat(priceMarkups[markupKey]);
        
        if (!isNaN(markup)) {
          return markup;
        }
      }
    }
  }

  // Return default if no markup found
  console.warn(`Product multiplier not found for brand: ${brandName}, price: ${basePrice}, qty: ${quantity}`);
  return 1;
}

/**
 * Extract all multipliers at once
 */
export function extractAllMultipliers(priceMultipliers, priceMarkups, brandName, basePrice, quantity) {
  const { brandMultiplier, printMultiplier } = extractBrandMultipliers(priceMultipliers, brandName);
  const productMultiplier = extractProductMultiplier(priceMarkups, brandName, basePrice, quantity);

  return {
    brandMultiplier,
    printMultiplier,
    productMultiplier
  };
}