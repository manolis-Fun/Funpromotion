import { NextResponse } from 'next/server';

// Mock price multipliers, ideally fetch these from DB or config
const BRAND_MULTIPLIERS = {
  Midocean: 1,
  Xindao: 1,
  Stricker: 1,
  PF: 1,
  kits: 1,
  Stock: 1,
  Chillys: 1,
  Mdisplay: 1,
};

// Tiered markup multipliers for Stock brand
const STOCK_TIERS = {
  "1.22": {
    "1-24": 3.5, "25-49": 3.2, "50-99": 3.0, "100-249": 2.8,
    "250-499": 2.6, "500-999": 2.4, "1000-2499": 2.2, "2500+": 2.0
  },
  "3.05": {
    "1-24": 3.2, "25-49": 2.9, "50-99": 2.7, "100-249": 2.5,
    "250-499": 2.3, "500-999": 2.1, "1000-2499": 1.9, "2500+": 1.7
  },
  "6.10": {
    "1-24": 2.9, "25-49": 2.6, "50-99": 2.4, "100-249": 2.2,
    "250-499": 2.0, "500-999": 1.8, "1000-2499": 1.6, "2500+": 1.4
  },
  "12.20": {
    "1-24": 2.6, "25-49": 2.3, "50-99": 2.1, "100-249": 1.9,
    "250-499": 1.7, "500-999": 1.5, "1000-2499": 1.3, "2500+": 1.1
  },
  "999.99": {
    "1-24": 2.3, "25-49": 2.0, "50-99": 1.8, "100-249": 1.6,
    "250-499": 1.4, "500-999": 1.2, "1000-2499": 1.0, "2500+": 0.8
  }
};

// Helper: get tier name based on quantity
const getQuantityTier = (qty) => {
  if (qty <= 24) return "1-24";
  if (qty <= 49) return "25-49";
  if (qty <= 99) return "50-99";
  if (qty <= 249) return "100-249";
  if (qty <= 499) return "250-499";
  if (qty <= 999) return "500-999";
  if (qty <= 2499) return "1000-2499";
  return "2500+";
};

// Helper: get price band
const getPriceBand = (price) => {
  if (price <= 1.22) return "1.22";
  if (price <= 3.05) return "3.05";
  if (price <= 6.10) return "6.10";
  if (price <= 12.20) return "12.20";
  return "999.99";
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get('brand');
  const price = parseFloat(searchParams.get('price_main') || '0');
  const quantity = parseInt(searchParams.get('quantity') || '0', 10);

  if (!brand || isNaN(price) || isNaN(quantity)) {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
  }

  const brandMultiplier = BRAND_MULTIPLIERS[brand] || 1;
  let tierMultiplier = 1;

  // Apply Stock brand tier logic if needed
  if (brand === 'Stock') {
    const band = getPriceBand(price);
    const tier = getQuantityTier(quantity);
    tierMultiplier = STOCK_TIERS[band]?.[tier] || 1;
  }

  const markup = brandMultiplier * tierMultiplier;
  const perUnit = +(price * markup).toFixed(2);
  const total = +(perUnit * quantity).toFixed(2);

  return NextResponse.json({
    total_price: total,
    per_unit: perUnit,
    breakdown: {
      product_price: price,
      markup: markup,
    },
    cached: false,
    source: 'calculated'
  });
}
