import {
  graphqlClient,
  getProductBySlugQuery,
  fetchAllProducts,
  getPriceMarkups,
  getPriceMultipliers,
  getQuantityDefaults,
  getShippingCosts,
  getShippingDays,
} from '@/lib/graphql';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/product-detail';
import NewsletterBanner from '@/components/NewsletterBanner';

export const dynamic = 'force-static';
export const revalidate = 3600;

const DEV = process.env.NODE_ENV !== 'production';

const GET_PRODUCTS_BY_CATEGORY = `
  query GetProductsByCategory($category: [String]!) {
    products(first: 1000, where: { categoryIn: $category }) {
      nodes {
        id
        slug
        name
        title
        v1W1
        singleProductFields {
          priceMain
          priceMainSale
          v1W1
          brand
          manipulation
          incomingStock
        }
        image {
          sourceUrl
          altText
        }
        productCategories(first: 1000) {
          nodes { name slug }
        }
        shortDescription
        ... on SimpleProduct { price stockQuantity }
        ... on VariableProduct { price stockQuantity }
        ... on ExternalProduct { price }
        ... on GroupProduct { price }
      }
    }
  }
`;

/**
 * Small helper to reduce a flat array [{key,value}] to a map.
 * Safely returns null if input is falsy or empty.
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
    // if (DEV) console.warn('GraphQL request failed, trying mock:', err?.message || err);
    try {
      const { getMockData } = await import('@/lib/graphql');
      return getMockData(query, variables);
    } catch {
      // if (DEV) console.warn('Mock data unavailable for this query.');
      return null;
    }
  }
}

export async function generateStaticParams() {
  const products = await fetchAllProducts();
  return products.map(p => ({ slug: p.slug }));
}

async function getProduct(slug) {
  const data = await requestOrMock(getProductBySlugQuery, { slug });
  const product = data?.product;
  if (!product) return null;

  const priceMain = product.singleProductFields?.priceMain;
  const priceMainSale = product.singleProductFields?.priceMainSale;
  const finalPrice = priceMainSale || priceMain || product?.price;

  return {
    ...product,
    id: product.databaseId || product.id,
    title: product.title,
    price: finalPrice || 'Information not available',
    productCode: product?.singleProductFields?.arithmosProiontos || '',
    priceMain: priceMain || 'Information not available',
    priceMainSale: priceMainSale || 'Information not available',
    stockQuantity: product?.singleProductFields?.incomingStock ?? 0,
    images: product?.image ? [product.image.sourceUrl] : [],
    galleryImages: product?.galleryImages?.nodes?.map(img => img.sourceUrl) || [],
    description: product?.shortDescription || 'Information not available',
    shortDescription: product?.shortDescription || 'Information not available',
    supplierCode: product?.supplierCode || 'Information not available',
    customerPrice: finalPrice ? `${(parseFloat(finalPrice) * 1.3).toFixed(2)} €` : 'Information not available',
    variations: product?.variations?.nodes || [],
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  // Fetch all pricing config in parallel
  const [
    markupsRes,
    multipliersRes,
    qtyDefaultsRes,
    shipCostsRes,
    shipDaysRes,
  ] = await Promise.allSettled([
    requestOrMock(getPriceMarkups),
    requestOrMock(getPriceMultipliers),
    requestOrMock(getQuantityDefaults),
    requestOrMock(getShippingCosts),
    requestOrMock(getShippingDays),
  ]);

  const priceMarkups = toMap(markupsRes.value?.markupsFlat);
  const priceMultipliers = toMap(multipliersRes.value?.multipliersFlat);
  const quantityDefaults = toMap(qtyDefaultsRes.value?.quantityDefaultsFlat);
  const shippingCosts = toMap(shipCostsRes.value?.shippingCostsFlat);
  const shippingDays = toMap(shipDaysRes.value?.shippingDaysFlat);

  // Suppress GraphQL warnings in development
  // if (DEV) {
  //   console.log('priceMarkups:', priceMarkups);
  //   console.log('priceMultipliers:', priceMultipliers);
  //   console.log('quantityDefaults:', quantityDefaults);
  //   console.log('shippingCosts:', shippingCosts);
  //   console.log('shippingDays:', shippingDays);
  // }

  // Similar products by category
  const categorySlugs = product?.productCategories?.nodes?.map(c => c.slug) || [];
  let similarProducts = [];
  if (categorySlugs.length) {
    const byCat = await requestOrMock(GET_PRODUCTS_BY_CATEGORY, { category: categorySlugs });
    similarProducts = (byCat?.products?.nodes || []).filter(p => p.slug !== product.slug);
  }

  return (
    <main>
      <ProductDetails
        product={product}
        priceMarkups={priceMarkups}
        priceMultipliers={priceMultipliers}
        quantityDefaults={quantityDefaults}
        shippingCosts={shippingCosts}
        shippingDays={shippingDays}
      />
      <NewsletterBanner />
    </main>
  );
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found' };

  const desc = product.shortDescription || product.description || '';
  const image = product.images?.[0] ? [{ url: product.images[0] }] : [];

  return {
    title: `${product.title} | Fun Promotion`,
    description: desc,
    openGraph: {
      title: `${product.title} | Fun Promotion`,
      description: desc,
      images: image,
    },
  };
}
