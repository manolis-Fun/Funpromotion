import { NextResponse } from 'next/server';

// Brand markup data - TODO: Update to fetch from API instead of constants
const BRAND_MARKUPS = [
  {
    "brand": "Xindao",
    "priceMultiplier": 1.1,
    "printMarkup": 1.4,
    "fixedCost": null
  },
  {
    "brand": "Stricker",
    "priceMultiplier": 1,
    "printMarkup": 0.99,
    "fixedCost": null
  },
  {
    "brand": "Midocean",
    "priceMultiplier": 1,
    "printMarkup": 1,
    "fixedCost": null
  },
  {
    "brand": "PF",
    "priceMultiplier": 1,
    "printMarkup": 1,
    "fixedCost": null
  },
  {
    "brand": "Mdisplay",
    "priceMultiplier": 1,
    "printMarkup": 1,
    "fixedCost": null
  },
  {
    "brand": "Stock",
    "priceMultiplier": 1,
    "printMarkup": 1,
    "fixedCost": null
  },
  {
    "brand": "kits",
    "priceMultiplier": 1,
    "printMarkup": 1,
    "fixedCost": null
  }
];

// Helper to get brand markup data
function getBrandMarkup(brandName) {
  const brandData = BRAND_MARKUPS.find(b => b.brand === brandName);
  return brandData || { brand: "Unknown", priceMultiplier: 1, printMarkup: 1, fixedCost: null };
}

// Helpers
const decodeMaybe = v => {
  try { return decodeURIComponent(v); } catch { return v; }
};

const norm = v => String(v ?? "").trim().toLowerCase();

function attrsKey(attrs) {
  // Only the 4 attributes you care about
  const t = norm(attrs.technique);
  const p = norm(attrs.position);
  const e = norm(attrs.extra);
  const s = norm(decodeMaybe(attrs.size));
  return `${t}|${p}|${e}|${s}`;
}

function nodeAttrsKey(node) {
  const obj = {};
  for (const a of node.attributes?.nodes ?? []) {
    obj[a.label] = a.value ?? "";
  }
  return attrsKey(obj);
}

function parseNum(val) {
  if (val == null) return null;
  const n = Number(String(val).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// Build a quick lookup of nodes by the 4-attr signature
function indexByAttributes(nodes) {
  const map = new Map();
  for (const n of nodes) {
    map.set(nodeAttrsKey(n), n);
  }
  return map;
}

// Pull all quantity tiers from metaData
function parseTiers(metaData, preferCustomer = false) {
  const tiers = [];
  const re = /^_price_print_(\d+)_((\d+)|infinity)(?:_customer)?$/;

  for (const m of metaData ?? []) {
    const { key, value } = m;
    if (!key?.startsWith("_price_print_")) continue;

    // If preferCustomer is true, prefer keys that end with _customer when both exist
    const isCustomer = key.endsWith("_customer");
    if (!preferCustomer && isCustomer) continue;

    const match = key.match(re);
    if (!match) continue;

    const min = Number(match[1]);
    const max = match[2] === "infinity" ? Infinity : Number(match[2]);
    const price = parseNum(value);
    if (price == null) continue;

    tiers.push({ key, min, max, price, isCustomer });
  }

  // If preferCustomer, remove non-customer duplicates on same range
  if (preferCustomer) {
    const byRange = new Map();
    for (const t of tiers) {
      const k = `${t.min}-${t.max}`;
      const prev = byRange.get(k);
      if (!prev || (!prev.isCustomer && t.isCustomer)) byRange.set(k, t);
    }
    return Array.from(byRange.values())
      .sort((a, b) => a.min - b.min || a.max - b.max);
  }

  return tiers.sort((a, b) => a.min - b.min || a.max - b.max);
}

function pickTier(tiers, qty) {
  // min is inclusive, max is exclusive (except for infinity)
  for (const t of tiers) {
    if (qty >= t.min && (t.max === Infinity ? true : qty < t.max)) return t;
  }
  return null;
}

function getSetupCost(metaData) {
  const row = (metaData ?? []).find(m => m.key === "_price_print_setup");
  return parseNum(row?.value);
}

/**
 * Main API
 * @param {Array} nodes  GraphQL nodes array you posted
 * @param {Object} attrs { technique, position, extra, size }
 * @param {number} quantity
 * @param {Object} [opts] { preferCustomerPrice?: boolean, fallbackEmptySize?: boolean }
 */
function getPrintPricing(nodes, attrs, quantity, opts = {}) {
  const {
    preferCustomerPrice = false,
    fallbackEmptySize = true, // try again with size="" if not found
  } = opts;

  const idx = indexByAttributes(nodes);
  const key = attrsKey(attrs);
  let node = idx.get(key);

  // Optional fallback: if size did not match, try with empty size
  if (!node && fallbackEmptySize) {
    const { technique, position, extra } = attrs;
    node = idx.get(attrsKey({ technique, position, extra, size: "" }));
  }

  if (!node) {
    return {
      ok: false,
      reason: "No matching variation for provided attributes",
      attrsTried: attrs
    };
  }

  const tiers = parseTiers(node.metaData, preferCustomerPrice);
  const tier = pickTier(tiers, quantity);

  const setup = getSetupCost(node.metaData);


  return {
    ok: true,
    nodeId: node.id,
    databaseId: node.databaseId,
    matchedAttributes: node.attributes?.nodes ?? [],
    setupCost: setup,                    // total setup for the variation
    pricePerUnit: tier?.price ?? null,   // per piece print price for the qty tier
    tierKey: tier?.key ?? null,          // which metaData key matched
    debug: { tiersFound: tiers }
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Extract the parameters from request body + manipulation, basePrice, and brand
    const { quantity = [], technique, position, size, extra, variations, manipulation, basePrice, brand } = body;

    // Log all parameters to console

    // Prepare attributes object
    const attrs = {
      technique: technique || '',
      position: position || '',
      size: size || '',
      extra: extra || ''
    };

    // Calculate pricing for each quantity in the array
    const results = quantity.map(qty => {
      const pricing = getPrintPricing(variations, attrs, qty, {
        preferCustomerPrice: false,
        fallbackEmptySize: true
      });
      
      // Parse manipulation and basePrice
      const handlingCost = parseNum(manipulation) || 0;
      const productBasePrice = parseNum(basePrice);
      
      // Get brand markup data
      const brandMarkup = getBrandMarkup(brand);
      
      // Calculate print costs step by step
      const printingCostPerUnit = pricing.pricePerUnit || 0; // per unit print cost
      const setupCostPerUnitCalc = pricing.setupCost && qty > 0 ? (pricing.setupCost / qty) : 0;
      const handlingCostPerUnit = handlingCost && qty > 0 ? (handlingCost / qty) : 0;
      
      // Step 1: Base print cost per unit (setup + printing + handling)
      const basePrintCostPerUnit = setupCostPerUnitCalc + printingCostPerUnit + handlingCostPerUnit;
      
      // Step 2: Apply brand markup to print cost per unit
      const printCostPerUnitWithMarkup = basePrintCostPerUnit * brandMarkup.printMarkup;
      
      // Step 3: Add product base price for final total per unit
      const finalTotalPerUnit = printCostPerUnitWithMarkup + (productBasePrice || 0);
      
      // Total for entire quantity
      const basePrintPrice = basePrintCostPerUnit * qty;
      const totalPrintPrice = printCostPerUnitWithMarkup * qty;
      const finalTotalPrice = finalTotalPerUnit * qty;
      

      return {
        quantity: qty,
        setupCostPerUnit: setupCostPerUnitCalc,
        printingCostPerUnit,
        handlingCostPerUnit,
        basePrintCostPerUnit,
        printCostPerUnitWithMarkup,
        productBasePrice,
        finalTotalPerUnit,
        basePrintPrice,
        totalPrintPrice,
        finalTotalPrice,
        handlingCost,
        brandMarkup: brandMarkup,
        ...pricing
      };
    });


    // Return array of pricing results
    return NextResponse.json({
      received: {
        quantity,
        technique,
        position,
        size,
        extra,
        manipulation,
        basePrice,
        brand,
        variationsCount: Array.isArray(variations) ? variations.length : 0
      },
      pricing: results
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}