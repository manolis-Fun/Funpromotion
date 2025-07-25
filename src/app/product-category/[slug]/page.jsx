import { notFound } from 'next/navigation';
import { graphqlClient } from '@/lib/graphql';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import Sidebar from '@/components/product-category/Sidebar';
import ProductGridWithColorFilter from '@/components/product-category/ProductGridWithColorFilter';
export const dynamic = 'force-dynamic';
import CategoryBanner from '@/components/product-category/category-banner';
import { GET_CATEGORY_SIDEBAR_DATA } from '@/lib/graphql';

const GET_PRODUCTS_BY_CATEGORY = `
  query GetProductsByCategory($category: [String]!, $first: Int!, $after: String) {
    products( first: $first, after: $after, where: { categoryIn: $category }) {
      nodes {
        id
        slug
        name
        description
        shortDescription
        singleProductFields {
          priceMain
          priceMainSale
        }
        image {
          sourceUrl
          altText
        }
        productCategories (first: 1000){
          nodes {
            name
            slug
          }
        }
        ... on SimpleProduct {
          price
          stockQuantity
        }
        ... on VariableProduct {
          price
          stockQuantity
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const GET_CATEGORY = `
  query GetCategory($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      id
      name
      slug
    }
  }
`;

const GET_ALL_CATEGORIES_PAGINATED = `
  query GetAllCategories($first: Int!, $after: String) {
    productCategories(first: $first, after: $after) {
      nodes {
        id
        slug
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Cache the expensive category fetch operation
const getCachedCategory = unstable_cache(
  async (slug) => {
    return await graphqlClient.request(GET_CATEGORY, { slug });
  },
  ['category'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['category'],
  }
);

// Cache the expensive products fetch operation
const getCachedProducts = unstable_cache(
  async (categorySlug, first, after) => {
    return await graphqlClient.request(GET_PRODUCTS_BY_CATEGORY, {
      category: [categorySlug],
      first,
      after
    });
  },
  ['products-by-category'],
  {
    revalidate: 1800, // Cache for 30 minutes
    tags: ['products'],
  }
);

// Cache the sidebar data
const getCachedSidebarData = unstable_cache(
  async (slug) => {
    return await graphqlClient.request(GET_CATEGORY_SIDEBAR_DATA, { slug: [slug] });
  },
  ['sidebar-data'],
  {
    revalidate: 3600, // Cache for 1 hour  
    tags: ['sidebar'],
  }
);

async function fetchAllCategories() {
  let categories = [];
  let hasNextPage = true;
  let after = null;

  while (hasNextPage) {
    const data = await graphqlClient.request(GET_ALL_CATEGORIES_PAGINATED, {
      first: 100,
      after,
    });
    categories = categories.concat(data.productCategories.nodes);
    hasNextPage = data.productCategories.pageInfo.hasNextPage;
    after = data.productCategories.pageInfo.endCursor;
  }

  return categories;
}

export async function generateStaticParams() {
  try {
    const categories = await fetchAllCategories();
    const slugs = categories.map((category) => category.slug);
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function ProductCategoryPage({ params }) {
  const { slug } = params;

  try {
    // Use cached functions for better performance
    const categoryResult = await getCachedCategory(slug);
    const category = categoryResult.productCategory;

    if (!category) {
      notFound();
    }

    // Fetch data concurrently using Promise.all for better performance
    const [data, sidebarData] = await Promise.all([
      getCachedProducts(category.slug, 50, null),
      getCachedSidebarData(slug)
    ]);

    const products = data.products.nodes;
    const pageInfo = data.products.pageInfo;

    return (
      <section >
        <CategoryBanner sidebarData={sidebarData} />
        <div className='flex gap-16 max-w-[1440px] mx-auto px-4 my-20 '>
          <div className="w-[280px] flex-shrink-0 pt-8">
            <Sidebar products={products} sidebarData={sidebarData} />
          </div>
          <div className="w-full mx-auto px-4 py-16 ">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No products found in this category.</p>
              </div>
            ) : (
              <ProductGridWithColorFilter
                products={products}
                categoryName={category.name}
                itemsPerPage={20}
                pageInfo={pageInfo}
                categorySlug={category.slug}
              />
            )}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error fetching category or products:', error);
    notFound();
  }
} 