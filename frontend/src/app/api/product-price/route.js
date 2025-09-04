import { NextResponse } from 'next/server';

// Brand markup data - same as print-price API
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

// Product markup constants - TODO: Add actual product markup values
const PRODUCT_MARKUP = {
  // TODO: Add product markup values here
  default: 1.0
};

// Helper to get brand markup data
function getBrandMarkup(brandName) {
  const brandData = BRAND_MARKUPS.find(b => b.brand === brandName);
  return brandData || { brand: "Unknown", priceMultiplier: 1, printMarkup: 1, fixedCost: null };
}

// Helper to parse numbers
function parseNum(val) {
  if (val == null) return null;
  const n = Number(String(val).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Extract parameters from request body
    const { totalPrintPricePerUnit, quantity, brand, basePrice } = body;


    // Get brand markup data
    const brandMarkup = getBrandMarkup(brand);
    
    // Parse values
    const printPricePerUnit = parseNum(totalPrintPricePerUnit) || 0;
    const productBasePrice = parseNum(basePrice) || 0;
    
    // Calculate product price for each quantity
    const results = (Array.isArray(quantity) ? quantity : [quantity]).map(qty => {
      // If no print price (totalPrintPricePerUnit is 0), use base price for calculations
      const priceForCalculation = printPricePerUnit > 0 ? printPricePerUnit : productBasePrice;
      
      // Product price calculation: (print price OR base price) * priceMultiplier * productMarkup
      const productPriceWithMultiplier = priceForCalculation * brandMarkup.priceMultiplier;
      const finalProductPricePerUnit = productPriceWithMultiplier * PRODUCT_MARKUP.default;
      const finalProductPrice = finalProductPricePerUnit * qty;
      
      return {
        quantity: qty,
        printPricePerUnit,
        productBasePrice,
        priceForCalculation,
        brandMultiplier: brandMarkup.priceMultiplier,
        productMarkup: PRODUCT_MARKUP.default,
        productPriceWithMultiplier,
        finalProductPricePerUnit,
        finalProductPrice,
        brandMarkup: brandMarkup
      };
    });


    // Return array of product pricing results
    return NextResponse.json({
      received: {
        totalPrintPricePerUnit,
        quantity,
        brand,
        basePrice
      },
      pricing: results
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}