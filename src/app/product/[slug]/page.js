import { graphqlClient, getProductBySlugQuery, getMockData, fetchAllProducts } from '@/lib/graphql';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/product-detail';
import SimilarProducts from '@/components/simillar-products';
import NewsletterBanner from '@/components/NewsletterBanner';
import ProductBanner from '@/components/product-banner';
import ProductNotFound from '@/components/product-search';
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
        singleProductFields {
          priceMain
          priceMainSale
          v1W1
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
    const data = await graphqlClient.request(getProductBySlugQuery, { slug })
      .catch(() => getMockData(getProductBySlugQuery, { slug }));

    if (!data?.product) {
      return null;
    }

    // Extract variations and attributes if present
    let variations = [];
    if (data.product.variations && data.product.variations.nodes) {
      variations = data.product.variations.nodes.map(variation => ({
        id: variation.databaseId || variation.id,
        name: variation.name,
        attributes: variation.attributes?.nodes || []
      }));

      // Debug logging
      console.log('🔍 Product Variations from GraphQL:', {
        productSlug: slug,
        rawVariations: data.product.variations.nodes,
        processedVariations: variations
      });
    }

    // Get price from singleProductFields if available, otherwise fallback to basic price
    const priceMain = data.product.singleProductFields?.priceMain;
    const priceMainSale = data.product.singleProductFields?.priceMainSale;
    const finalPrice = priceMainSale || priceMain || data.product?.price || '0';

    return {
      ...data.product,
      id: data.product.databaseId || data.product.id,
      title: data.product.title,
      price: finalPrice,
      priceMain: priceMain,
      priceMainSale: priceMainSale,
      stockQuantity: data.product?.stockQuantity || 0,
      images: data.product?.image ? [data.product.image.sourceUrl] : [],
      galleryImages: data.product?.galleryImages?.nodes?.map(img => img.sourceUrl) || [],
      description: data.product?.description || '',
      shortDescription: data.product?.shortDescription || '',
      supplierCode: 'P308.5801',
      customerPrice: ((parseFloat(finalPrice || '0') * 1.3).toFixed(2) + ' €') || 'N/A',
      printingOptions: [
        { type: '1 Color', available: true },
        { type: '2 Colors', available: true },
        { type: '3 Colors', available: true },
        { type: '4 Colors', available: true },
        { type: 'Laser', available: true },
        { type: 'Digital', available: true },
      ],
      variations: data.product?.variations?.nodes?.map(variation => ({
        id: variation.databaseId || variation.id,
        name: variation.name,
        attributes: variation.attributes?.nodes || []
      }))
    };
  } catch (error) {
    console.error('Error fetching product:', error);
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
    const data = await graphqlClient.request(GET_PRODUCTS_BY_CATEGORY, { category: productCategories });
    similarProducts = (data.products.nodes || []).filter(p => p.slug !== product.slug);
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
