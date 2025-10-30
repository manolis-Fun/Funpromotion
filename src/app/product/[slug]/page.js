import {
  graphqlClient,
  getProductBySlugQuery,
  fetchAllProducts,
} from '@/lib/graphql';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/product-detail';
import NewsletterBanner from '@/components/NewsletterBanner';

export const dynamic = 'force-static';
export const revalidate = 3600;

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

  // Dynamic data (pricing, shipping costs, shipping days, stock) will be lazy loaded
  // on the client side after page load to avoid blocking static generation
  return (
    <main>
      <ProductDetails
        product={product}
        // These will be loaded dynamically on the client
        priceMarkups={null}
        priceMultipliers={null}
        quantityDefaults={null}
        shippingCosts={null}
        shippingDays={null}
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
