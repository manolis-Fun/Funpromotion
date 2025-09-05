import { graphqlClient, getProductBySlugQuery, fetchAllProducts } from '@/lib/graphql';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/product-detail';
import SimilarProducts from '@/components/simillar-products';
import NewsletterBanner from '@/components/NewsletterBanner';
import ProductBanner from '@/components/product-banner';
import ProductNotFound from '@/components/product-search';
import { assertGraphQLShape, logPricingDebugSnapshot } from '@/utils/assertGraphQLShape';
export const dynamic = 'force-static';
export const revalidate = 3600;

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
        }
        image {
          sourceUrl
          altText
        }
        productCategories(first: 1000) {
          nodes {
            name
            slug
          }
        }
        shortDescription
        ... on SimpleProduct {
          price
          stockQuantity
        }
        ... on VariableProduct {
          price
          stockQuantity
        }
        ... on ExternalProduct {
          price
        }
        ... on GroupProduct {
          price
        }
      }
    }
  }
`;

export async function generateStaticParams() {
  const products = await fetchAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

async function getProduct(slug) {
  try {
    let data;
    try {
      data = await graphqlClient.request(getProductBySlugQuery, { slug });
    } catch (graphqlError) {
      // Use mock data if GraphQL fails
      const { getMockData } = await import('@/lib/graphql');
      data = getMockData(getProductBySlugQuery, { slug });
    }

    if (!data?.product) {
      return null;
    }
    
    // Get price from singleProductFields if available, otherwise show unavailable
    const priceMain = data.product.singleProductFields?.priceMain;
    const priceMainSale = data.product.singleProductFields?.priceMainSale;
    const finalPrice = priceMainSale || priceMain || data.product?.price;

    return {
      ...data.product,
      id: data.product.databaseId || data.product.id,
      title: data.product.title,
      price: finalPrice || 'Information not available',
      priceMain: priceMain || 'Information not available',
      priceMainSale: priceMainSale || 'Information not available',
      stockQuantity: data.product?.stockQuantity ?? 0,
      images: data.product?.image ? [data.product.image.sourceUrl] : [],
      galleryImages: data.product?.galleryImages?.nodes?.map(img => img.sourceUrl) || [],
      description: data.product?.description || 'Information not available',
      shortDescription: data.product?.shortDescription || 'Information not available',
      supplierCode: data.product?.supplierCode || 'Information not available',
      customerPrice: finalPrice ? ((parseFloat(finalPrice) * 1.3).toFixed(2) + ' €') : 'Information not available',
      variations: data.product?.variations?.nodes || []
    };
  } catch (error) {
    return null;
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  // Get the current product's category slugs
  const productCategories = product?.productCategories?.nodes?.map(cat => cat.slug) || [];

  // Fetch products by category
  let similarProducts = [];
  if (productCategories.length > 0) {
    try {
      const data = await graphqlClient.request(GET_PRODUCTS_BY_CATEGORY, { category: productCategories });
      similarProducts = (data.products.nodes || []).filter(p => p.slug !== product.slug);
    } catch (error) {
      // Try to use mock data as fallback
      try {
        const { getMockData } = await import('@/lib/graphql');
        const mockData = getMockData(GET_PRODUCTS_BY_CATEGORY, { category: productCategories });
        similarProducts = (mockData?.products?.nodes || []).filter(p => p.slug !== product.slug);
      } catch (mockError) {
        similarProducts = [];
      }
    }
  }
  return (
    <main>
      <ProductDetails product={product} />
      <ProductBanner product={product} />
      <ProductNotFound />
      <SimilarProducts product={similarProducts.slice(0, 4)} />
      <NewsletterBanner />
    </main>
  );
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.title} | Fun Promotion`,
    description: product.shortDescription || product.description || '',
    openGraph: {
      title: `${product.title} | Fun Promotion`,
      description: product.shortDescription || product.description || '',
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}
