import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get('brand');
  const quantity = parseInt(searchParams.get('quantity'), 10);
  const v1w1 = parseFloat(searchParams.get('v1w1'));

  if (!brand || !quantity || !v1w1) {
    return NextResponse.json({ cost: null });
  }

  const volume = v1w1 * quantity;
  const roundedVolume = Math.ceil(volume);
  let expressShippingCost = 0;

  if (brand === "PF") {
    {
      if (big <= 0) {
          $('#shipping_days_shipping .shipping_cost').html('Δωρεάν');
          $('#shipping_days_express_shipping .shipping_cost_express').html('Επικοινωνήστε μαζί μας');
      } else {
          $('#shipping_days_shipping .shipping_cost').html('Δωρεάν');
          if ((rounded_sum_big > 0) && (rounded_sum_big <= 1)) {
              expressShippingCost = 15.08;
          } else if ((rounded_sum_big > 1) && (rounded_sum_big < 2)) {
              var result = 16;
              var roundedResult = Math.round(result * 100) / 100;
              expressShippingCost = roundedResult;
          } else if ((rounded_sum_big >= 2) && (rounded_sum_big < 3)) {
              var result = 16.84;
              var roundedResult = Math.round(result * 100) / 100;
              expressShippingCost = roundedResult;
          } else if ((rounded_sum_big >= 3) && (rounded_sum_big < 6)) {
              var result = ((rounded_sum_big - 2) * 3.18 + 16.84);
              var roundedResult = Math.round(result * 100) / 100;
              expressShippingCost = roundedResult;
          } else if ((rounded_sum_big >= 6) && (rounded_sum_big < 11)) {
              var result = ((rounded_sum_big - 5) * 3.38 + 26.38);
              var roundedResult = Math.round(result * 100) / 100;
              expressShippingCost = roundedResult;
          } else if ((rounded_sum_big >= 11) && (rounded_sum_big < 31)) {
              var result = ((rounded_sum_big - 10) * 4.2 + 43.28);
              var roundedResult = Math.round(result * 100) / 100;
              expressShippingCost = roundedResult;
          } else if ((rounded_sum_big >= 31) && (rounded_sum_big < 51)) {
              var result = ((rounded_sum_big - 30) * 3.99 + 127.28);
              var roundedResult = Math.round(result * 100) / 100;
              expressShippingCost = roundedResult;
          } else if ((rounded_sum_big >= 51)) {
              var result = ((rounded_sum_big - 50) * 4.44 + 207.08);
              var roundedResult = Math.round(result * 100) / 100;
              expressShippingCost = roundedResult;
          }
      }
    }
  } else if (brand === "Midocean") {
    if (v1w1 <= 0) {
      expressShippingCost = 0;
    } else if (roundedVolume > 0 && roundedVolume <= 1) {
      expressShippingCost = 15.08;
    } else if (roundedVolume > 1 && roundedVolume <= 5) {
      const result = (roundedVolume - 1) * 5.32 + 15.75;
      expressShippingCost = Math.round(result * 100) / 100;
    } else if (roundedVolume > 5 && roundedVolume <= 10) {
      const result = (roundedVolume - 5) * 3.41 + 36.06;
      expressShippingCost = Math.round(result * 100) / 100;
    } else if (roundedVolume > 10 && roundedVolume <= 20) {
      const result = (roundedVolume - 10) * 1.21 + 53.91;
      expressShippingCost = Math.round(result * 100) / 100;
    } else if (roundedVolume > 20 && roundedVolume <= 30) {
      const result = (roundedVolume - 20) * 1.89 + 66.01;
      expressShippingCost = Math.round(result * 100) / 100;
    } else if (roundedVolume > 30 && roundedVolume <= 70) {
      const result = (roundedVolume - 30) * 3.32 + 105.52;
      expressShippingCost = Math.round(result * 100) / 100;
    } else if (roundedVolume > 70 && roundedVolume <= 100) {
      const result = (roundedVolume - 70) * 5.63 + 237.57;
      expressShippingCost = Math.round(result * 100) / 100;
    } else if (roundedVolume > 100) {
      const result = (roundedVolume - 100) * 7.23 + 420.03;
      expressShippingCost = Math.round(result * 100) / 100;
    }
  } else {
    expressShippingCost = null;  
  }

  const costPerPiece = expressShippingCost ? parseFloat((expressShippingCost / quantity).toFixed(2)) : null;

  return NextResponse.json({
    cost: costPerPiece,
    total: expressShippingCost,
    volume: roundedVolume
  });
}
