import ProductCategoryClient from '@/components/product-category/ProductCategoryClient';
import { graphqlClient } from '@/lib/graphql';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours = 1 day

const GET_ALL_CATEGORIES = `
  query GetAllCategories {
    productCategories(first: 1000) {
      nodes {
        id
        slug
        name
        count
      }
    }
  }
`;

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

export async function generateStaticParams() {
  try {
    const data = await requestOrMock(GET_ALL_CATEGORIES);
    const categories = data?.productCategories?.nodes || [];
    return categories
      .filter(category => category.count > 0) // Only generate for categories with products
      .map(category => ({ slug: category.slug }));
  } catch (error) {
    console.warn('Failed to generate static params for categories:', error);
    return [];
  }
}

async function getCategoryData(slug) {
  try {
    const data = await requestOrMock(GET_ALL_CATEGORIES);
    const categories = data?.productCategories?.nodes || [];
    return categories.find(category => category.slug === slug);
  } catch (error) {
    console.warn('Failed to fetch category data:', error);
    return null;
  }
}

export default async function ProductCategoryPage({ params }) {
  const { slug } = params;
  const categoryData = await getCategoryData(slug);
  
  return <ProductCategoryClient slug={slug} categoryData={categoryData} />;
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  const categoryData = await getCategoryData(slug);
  
  if (!categoryData) {
    return { title: 'Category Not Found' };
  }
  
  const categoryName = categoryData.name;
  
  return {
    title: `${categoryName} | Fun Promotion`,
    description: `Browse our ${categoryName} collection. Find the perfect promotional products for your business.`,
    openGraph: {
      title: `${categoryName} | Fun Promotion`,
      description: `Browse our ${categoryName} collection. Find the perfect promotional products for your business.`,
    },
  };
}