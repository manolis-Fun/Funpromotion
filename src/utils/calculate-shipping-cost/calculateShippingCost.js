/**
 * Core Shipping Cost Calculation Function
 * 
 * Calculates shipping costs from shipping ranges configuration data.
 * Uses exact algorithm specified for finding ranges and applying costs.
 */

/**
 * @typedef {Object} ShippingCalc
 * @property {number} total - Total shipping cost
 * @property {number} perPiece - Cost per piece
 * @property {Object} debug - Debug information for transparency
 * @property {number} debug.brandIndex - Found brand index
 * @property {number} debug.volumeKg - Total volume in kg
 * @property {number} debug.rangeIndex - Matched range index
 * @property {number} debug.min - Range minimum value
 * @property {number|null} debug.max - Range maximum value (null if open-ended)
 * @property {number} debug.minus - Minus value applied
 * @property {number} debug.cost - Cost per kg
 * @property {number} debug.fix - Fixed cost
 * @property {number} debug.markup - Markup multiplier
 * @property {number} debug.billableKg - Billable kg after minus applied
 */

/**
 * Calculate shipping cost from shipping ranges configuration
 * @param {Record<string, string>} data - The shipping configuration data
 * @param {string} brand - Brand name to match, e.g. "PF", "Midocean", "Xindao"
 * @param {number} v1w1 - kg per piece (volume/weight per unit)
 * @param {number} qty - Quantity of pieces
 * @param {boolean} roundUp - If true, ceil volume to next kg (default: true)
 * @returns {ShippingCalc} Shipping cost breakdown
 */
export function calculateShippingCost(data, brand, v1w1, qty, roundUp = true) {
  // Helper functions
  const normalize = (s) => s?.toString().trim().toLowerCase() || '';
  const toNumber = (v, fallback = 0) => {
    const n = parseFloat(String(v ?? "").toString().trim());
    return Number.isFinite(n) ? n : fallback;
  };
  const round2 = (n) => Math.round(n * 100) / 100;
  const round4 = (n) => Math.round(n * 10000) / 10000;

  // Constants
  const N_BRANDS = 7;
  const N_RANGES = 25;

  // Early return for invalid quantity
  if (!qty || qty <= 0) {
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
      }
    };
  }

  // 1) Find brand slot
  let brandIndex = -1;
  for (let i = 1; i <= N_BRANDS; i++) {
    const brandKey = `shipping_brand_${i}`;
    const brandValue = data[brandKey];
    if (brandValue && normalize(brandValue) === normalize(brand)) {
      brandIndex = i;
      break;
    }
  }

  if (brandIndex === -1) {
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
      }
    };
  }

  // 2) Rounded volume - always ceil and ensure minimum of 1
  const volumeKg = Math.max(1, Math.ceil(v1w1 * qty));

  // 3) Find first range with INCLUSIVE max (min <= V <= max)
  let chosen = {
    rangeIndex: -1,
    min: 0,
    max: null,
    minus: 0,
    cost: 0,
    fix: 0
  };

  for (let r = 1; r <= N_RANGES; r++) {
    const minKey = `shipping_range_min_${r}_${brandIndex}`;
    const maxKey = `shipping_range_max_${r}_${brandIndex}`;
    
    const min = toNumber(data[minKey], NaN);
    const rawMax = data[maxKey];
    
    if (!Number.isFinite(min)) continue;
    
    const max = rawMax ? toNumber(rawMax, NaN) : NaN;

    // INCLUSIVE max check: min <= volumeKg <= max (or unlimited if no max)
    const inRange = volumeKg >= min && (Number.isFinite(max) ? volumeKg <= max : true);

    if (inRange) {
      const minusKey = `shipping_range_minus_${r}_${brandIndex}`;
      const costKey = `shipping_range_cost_${r}_${brandIndex}`;
      const fixKey = `shipping_range_fix_${r}_${brandIndex}`;
      
      chosen.rangeIndex = r;
      chosen.min = min;
      chosen.max = Number.isFinite(max) ? max : null;
      chosen.minus = toNumber(data[minusKey], 0);
      chosen.cost = toNumber(data[costKey], 0);
      chosen.fix = toNumber(data[fixKey], 0);
      break;
    }
  }

  if (chosen.rangeIndex === -1) {
    // No range matched, return zeros with debug
    return {
      total: 0,
      perPiece: 0,
      debug: {
        brandIndex,
        volumeKg,
        rangeIndex: -1,
        min: 0,
        max: null,
        minus: 0,
        cost: 0,
        fix: 0,
        markup: 1,
        billableKg: 0
      }
    };
  }

  // 4) Compute cost with minus, fix, cost, markup
  const markupKey = `shipping_markup_${brandIndex}`;
  const markup = toNumber(data[markupKey], 1) || 1;
  const billableKg = Math.max(0, volumeKg - chosen.minus);
  const base = chosen.fix + billableKg * chosen.cost;
  const total = base * markup;
  const perPiece = total / qty;

  return {
    total: round2(total),
    perPiece: round4(perPiece),
    debug: {
      brandIndex,
      volumeKg,
      rangeIndex: chosen.rangeIndex,
      min: chosen.min,
      max: chosen.max,
      minus: chosen.minus,
      cost: chosen.cost,
      fix: chosen.fix,
      markup,
      billableKg: billableKg
    }
  };
}

export default calculateShippingCost;