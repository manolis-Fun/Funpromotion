import { NextResponse } from 'next/server';

// Brand-specific print markups (from screenshots)
const BRAND_PRINT_MARKUPS = {
  'PF': 1.6,         // 60% markup
  'Midocean': 1.55,  // 55% markup
  'Stricker': 1.5,   // 50% markup
  'Xindao': 1.5,     // 50% markup
  'Stock': 1.4,      // 40% markup
  'Chillys': 1.45,   // 45% markup
  'Mdisplay': 1.45,  // 45% markup
  'default': 1.5     // 50% default markup
};

// Print cost per item based on quantity tiers (from screenshot admin interface)
const PRINT_COST_TIERS = [
  { min: 1, max: 3, value: 1.52 },
  { min: 3, max: 5, value: 1.52 },
  { min: 5, max: 10, value: 1.20 },
  { min: 10, max: 25, value: 1.00 },
  { min: 25, max: 50, value: 1.00 },
  { min: 50, max: 100, value: 0.90 },
  { min: 100, max: 250, value: 0.71 },
  { min: 250, max: 500, value: 0.65 },
  { min: 500, max: 1000, value: 0.60 },
  { min: 1000, max: 2500, value: 0.55 },
  { min: 2500, max: 5000, value: 0.50 },
  { min: 5000, max: 10000, value: 0.45 },
  { min: 10000, max: Infinity, value: 0.40 }
];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get('brand') || 'default';
  const technique = searchParams.get('technique') || '1 color';
  const quantity = parseInt(searchParams.get('quantity'), 10) || 1;

  // These should come from product/variation custom fields in future
  // For now, using values from screenshot examples
  const HANDLE_COST = 0.10;  // From product custom field "Handling Costs"
  const SETUP_COST = 49;     // From variation custom field "Setup Cost" (one-time)

  // 1. Get print cost per item based on quantity tier
  const printTier = PRINT_COST_TIERS.find(tier =>
    quantity >= tier.min && quantity < tier.max
  );
  const printCostPerItem = printTier ? printTier.value : PRINT_COST_TIERS[0].value;

  // 2. Calculate setup cost per item (one-time cost divided by quantity)
  const setupCostPerItem = SETUP_COST / quantity;

  // 3. Calculate base cost per item (Handle + Setup + Print)
  const baseCostPerItem = HANDLE_COST + setupCostPerItem + printCostPerItem;

  // 4. Apply brand-specific markup
  const brandMarkup = BRAND_PRINT_MARKUPS[brand] || BRAND_PRINT_MARKUPS.default;
  const finalCostPerItem = baseCostPerItem * brandMarkup;

  // 5. Calculate total costs
  const totalBaseCost = baseCostPerItem * quantity;
  const totalFinalCost = finalCostPerItem * quantity;

  return NextResponse.json({
    // Main calculation results
    cost: parseFloat(finalCostPerItem.toFixed(4)),
    costPerItem: parseFloat(finalCostPerItem.toFixed(4)),
    totalCost: parseFloat(totalFinalCost.toFixed(2)),

    // Breakdown for transparency
    breakdown: {
      handleCost: HANDLE_COST,
      setupCost: SETUP_COST,
      setupCostPerItem: parseFloat(setupCostPerItem.toFixed(4)),
      printCostPerItem: printCostPerItem,
      baseCostPerItem: parseFloat(baseCostPerItem.toFixed(4)),
      brandMarkup: brandMarkup,
      totalBaseCost: parseFloat(totalBaseCost.toFixed(2))
    },

    // Metadata
    brand: brand,
    technique: technique,
    quantity: quantity,
    tier: printTier ? `${printTier.min}-${printTier.max}` : 'default'
  });
}
