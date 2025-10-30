import { NextResponse } from 'next/server';
import {
  graphqlClient,
  getPriceMarkups,
  getPriceMultipliers,
  getShippingCosts,
  getShippingDays,
} from '@/lib/graphql';

// Mark as dynamic route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Small helper to reduce a flat array [{key,value}] to a map.
 */
function toMap(flatList) {
  if (!Array.isArray(flatList) || flatList.length === 0) return null;
  return flatList.reduce((acc, item) => {
    if (item && typeof item.key === 'string') acc[item.key] = item.value;
    return acc;
  }, {});
}

/**
 * Request with graceful fallback to mock data when available.
 */
async function requestOrMock(query, variables) {
  try {
    return await graphqlClient.request(query, variables);
  } catch (err) {
    try {
      const { getMockData } = await import('@/lib/graphql');
      return getMockData(query, variables);
    } catch {
      return null;
    }
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Fetch all dynamic data in parallel
    const [
      markupsRes,
      multipliersRes,
      shipCostsRes,
      shipDaysRes,
      productRes,
    ] = await Promise.allSettled([
      requestOrMock(getPriceMarkups),
      requestOrMock(getPriceMultipliers),
      requestOrMock(getShippingCosts),
      requestOrMock(getShippingDays),
      // Fetch fresh product data including stock
      requestOrMock(
        `query GetProductStock($id: ID!) {
          product(id: $id, idType: DATABASE_ID) {
            ... on SimpleProduct { stockQuantity }
            ... on VariableProduct { stockQuantity }
            singleProductFields {
              incomingStock
            }
          }
        }`,
        { id: productId }
      ),
    ]);

    const priceMarkups = toMap(markupsRes.value?.markupsFlat);
    const priceMultipliers = toMap(multipliersRes.value?.multipliersFlat);
    const shippingCosts = toMap(shipCostsRes.value?.shippingCostsFlat);
    const shippingDays = toMap(shipDaysRes.value?.shippingDaysFlat);

    const product = productRes.value?.product;
    const stockQuantity = product?.singleProductFields?.incomingStock ??
                         product?.stockQuantity ?? 0;

    const response = NextResponse.json({
      priceMarkups,
      priceMultipliers,
      shippingCosts,
      shippingDays,
      stockQuantity,
      timestamp: new Date().toISOString(),
    });

    // Set no-cache headers to ensure fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
  } catch (error) {
    console.error('Error fetching dynamic product data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product data' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    );
  }
}
