export function translateSizeLabel(value) {
  if (!value) return "-";
  let v = decodeURIComponent(value);
  v = v.replace(/έως|εώς|εως|ΕΩΣ|Έως/gi, "up to");
  v = v.replace(/εκ\.?/gi, "cm");
  v = v.replace(/χιλ\.?/gi, "mm");
  v = v.replace(/cm2|CM2/gi, "cm²");
  v = v.replace(/-+/g, "-").replace(/^-|-$/g, "").trim();
  return v;
}


export async function fetchPricingData({ brand, priceMain, quantity, selectedTechnique, v1w1 }) {
  try {
    // Format technique for API calls
    const formattedTechnique = selectedTechnique?.replace('-', ' ') || '1 color';

    const [productRes, printRes, shippingRes, shippingCostRes] = await Promise.all([
      fetch(`/api/product-price?brand=${brand}&price_main=${priceMain}&quantity=${quantity}`),
      fetch(`/api/print-price?brand=${brand}&technique=${formattedTechnique}&quantity=${quantity}`),
      fetch(`/api/shipping-days?brand=${brand}&printing=${formattedTechnique}&quantity=${quantity}`),
      fetch(`/api/shipping-cost?brand=${brand}&quantity=${quantity}&v1w1=${v1w1}`)
    ]);

    const [productData, printData, shippingData, shippingCostData] = await Promise.all([
      productRes.json(),
      printRes.json(),
      shippingRes.json(),
      shippingCostRes.json()
    ]);

    const breakdown = {
      product_price: productData?.breakdown?.product_price || 0,
      markup: productData?.breakdown?.markup || 1,
      printing: {
        cost: printData?.cost || 0,
        costPerItem: printData?.costPerItem || 0,
        totalCost: printData?.totalCost || 0,
        handleCost: printData?.breakdown?.handleCost || 0,
        setupCost: printData?.breakdown?.setupCost || 0,
        setupCostPerItem: printData?.breakdown?.setupCostPerItem || 0,
        printCostPerItem: printData?.breakdown?.printCostPerItem || 0,
        baseCostPerItem: printData?.breakdown?.baseCostPerItem || 0,
        brandMarkup: printData?.breakdown?.brandMarkup || 1,
        totalBaseCost: printData?.breakdown?.totalBaseCost || 0
      },
      shipping: {
        days: shippingData?.regular || "5-7",
        cost: shippingCostData?.total || 0,
        per_unit: shippingCostData?.costPerPiece || 0
      }
    };

    const productPart = breakdown.product_price * breakdown.markup;
    const printingPart = breakdown.printing.costPerItem || 0;
    const shippingPart = breakdown.shipping.per_unit;

    const perUnit = parseFloat((productPart + printingPart + shippingPart).toFixed(2));
    const totalPrice = parseFloat((perUnit * quantity).toFixed(2));

    const structuredFinal = {
      total_price: totalPrice,
      per_unit: perUnit,
      breakdown,
      cached: productData?.cached || false,
      source: productData?.source || "calculated"
    };

    // Format shipping days properly
    const formatShippingDays = (days) => {
      if (!days || days === null || days === -1) return "Contact us";
      if (typeof days === 'number') return `${days}`;
      return days;
    };

    const regularDays = formatShippingDays(shippingData?.totalStandardDays || shippingData?.standardShippingDays) || "5-7";
    const expressDays = formatShippingDays(shippingData?.totalExpressDays || shippingData?.expressShippingDays) || "2-3";

    return {
      finalPrice: structuredFinal,
      productPrice: productData,
      printPrice: printData,
      shippingDays: {
        regular: regularDays,
        express: expressDays
      },
      shippingCost: {
        costPerPiece: shippingCostData?.cost || 0,
        total: shippingCostData?.total || 0,
        volume: shippingCostData?.volume || 0
      }
    };
  } catch (err) {
    console.error("Error fetching pricing data:", err);
    throw err;
  }
}
