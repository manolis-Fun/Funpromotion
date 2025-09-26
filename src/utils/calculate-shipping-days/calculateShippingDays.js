/**
 * Core Shipping Days Calculation Function
 * 
 * Calculates production and delivery days from shipping configuration data.
 * Final shipping days = production days + delivery days (standard/express)
 */

/**
 * @typedef {Object} ShippingDaysResult
 * @property {number} productionDays - Production days for the item
 * @property {Object} deliveryDays - Delivery options
 * @property {number} deliveryDays.standard - Standard delivery days
 * @property {number} deliveryDays.express - Express delivery days
 * @property {Object} debug - Debug information for transparency
 * @property {number} debug.brandIndex - Found brand index
 * @property {number} debug.techniqueIndex - Found technique index
 * @property {number} debug.quantityBucket - Quantity bucket used (1, 100, 250, 500, 1000, 2500)
 * @property {number} debug.standardAdd - Base standard delivery days
 * @property {number} debug.expressAdd - Base express delivery days
 * @property {number} debug.extraStandardAdd - Extra standard delivery days
 * @property {number} debug.extraExpressAdd - Extra express delivery days
 */

/**
 * Calculate production and delivery days from the flat shipping config object.
 * @param {Record<string, string>} data - The shipping configuration data
 * @param {string} brand - Case-insensitive brand name, e.g. "Xindao"
 * @param {string} technique - Case-insensitive technique name, e.g. "1-color"
 * @param {number} quantity - Order quantity
 * @returns {ShippingDaysResult} Shipping days breakdown
 */
export function calculateShippingDays(data, brand, technique, quantity) {
  // Helper to normalize strings for comparison
  const normalize = (s) => s?.toString().trim().toLowerCase() || '';
  
  // Helper to safely convert to integer
  const toIntSafe = (v, fallback = 0) => {
    if (v === undefined || v === null) return fallback;
    const n = parseInt(String(v).trim(), 10);
    return Number.isFinite(n) ? n : fallback;
  };

  // 1) Find brand slot index where shipping_brand_i === brand
  const maxBrandSlots = 7; // Adjust if you have more brand slots
  let brandIndex = -1;
  
  for (let i = 1; i <= maxBrandSlots; i++) {
    const brandKey = `shipping_brand_${i}`;
    const brandValue = data[brandKey];
    if (brandValue && normalize(brandValue) === normalize(brand)) {
      brandIndex = i;
      break;
    }
  }
  
  if (brandIndex === -1) {
    throw new Error(`Brand not found in shipping data: ${brand}`);
  }

  // 2) Find technique index in this brand slot
  const maxTechniquesPerBrand = 16; // Up to 16 techniques per brand
  let techniqueIndex = -1;
  
  for (let t = 1; t <= maxTechniquesPerBrand; t++) {
    const techniqueKey = `shipping_technique_${t}_${brandIndex}`;
    const techniqueValue = data[techniqueKey];
    if (techniqueValue && normalize(techniqueValue) === normalize(technique)) {
      techniqueIndex = t;
      break;
    }
  }
  
  if (techniqueIndex === -1) {
    throw new Error(`Technique not found for brand ${brand}: ${technique}`);
  }

  // 3) Choose quantity bucket
  const buckets = [1, 100, 250, 500, 1000, 2500];
  let quantityBucket = 1;
  
  for (const bucket of buckets) {
    if (quantity >= bucket) {
      quantityBucket = bucket;
    }
  }

  // 4) Read production days: shipping_production_{bucket}_{techIndex}_{brandIndex}
  const productionKey = `shipping_production_${quantityBucket}_${techniqueIndex}_${brandIndex}`;
  const productionDays = toIntSafe(data[productionKey], 0);

  // 5) Base delivery adders per brand
  const standardAddKey = `shipping_standard_add_${brandIndex}`;
  const expressAddKey = `shipping_express_add_${brandIndex}`;
  const standardAdd = toIntSafe(data[standardAddKey], 0);
  const expressAdd = toIntSafe(data[expressAddKey], 0);

  // 6) Optional "extra" adders if technique matches any extra rows for this brand
  const maxExtraRows = 15;
  let extraStandardAdd = 0;
  let extraExpressAdd = 0;
  
  for (let k = 1; k <= maxExtraRows; k++) {
    const extraTechniqueKey = `shipping_extra_technique_${k}_${brandIndex}`;
    const extraTechnique = data[extraTechniqueKey];
    
    if (extraTechnique && normalize(extraTechnique) === normalize(technique)) {
      const extraStandardKey = `shipping_extra_standard_${k}_${brandIndex}`;
      const extraExpressKey = `shipping_extra_express_${k}_${brandIndex}`;
      
      extraStandardAdd += toIntSafe(data[extraStandardKey], 0);
      extraExpressAdd += toIntSafe(data[extraExpressKey], 0);
    }
  }

  // 7) Calculate final delivery days
  const deliveryDaysStandard = productionDays + standardAdd + extraStandardAdd;
  const deliveryDaysExpress = productionDays + expressAdd + extraExpressAdd;

  return {
    productionDays,
    deliveryDays: {
      standard: deliveryDaysStandard,
      express: deliveryDaysExpress,
    },
    debug: {
      brandIndex,
      techniqueIndex,
      quantityBucket,
      standardAdd,
      expressAdd,
      extraStandardAdd,
      extraExpressAdd,
    },
  };
}

export default calculateShippingDays;