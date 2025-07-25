import { GraphQLClient, gql } from 'graphql-request'

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  'https://react.woth.gr/graphql'
const headers = process.env.GRAPHQL_API_KEY
  ? { authorization: `Bearer ${process.env.GRAPHQL_API_KEY}` }
  : {}

export const graphqlClient = new GraphQLClient(endpoint, { headers })

// Mock data for static builds when no API is available
const mockProducts = [
  {
    id: '1',
    slug: 'thor-475-ml-copper-vacuum-insulated-tumbler-7',
    title: 'Thor 475 ML Copper Vacuum Insulated Tumbler',
    status: 'publish',
    price: '29.99',
    stockQuantity: 10,
    image: {
      sourceUrl: '/images/product-1.jpg',
      altText: 'Thor Tumbler'
    },
    shortDescription: 'Premium vacuum insulated tumbler',
    description: 'High-quality copper vacuum insulated tumbler perfect for hot and cold beverages.'
  },
  // Add more mock products as needed
];

export const getAllProductsPaginatedQuery = gql`
  query GetAllProductsPaginated($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        id
        slug
        title
        status
        singleProductFields {
          priceMain
          priceMainSale
        }
        ... on SimpleProduct {
          price
          stockQuantity
          image {
            sourceUrl
            altText
          }
          shortDescription
        }
        ... on VariableProduct {
          price
          stockQuantity
          image {
            sourceUrl
            altText
          }
          shortDescription
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
export const getProductBySlugQuery = gql`
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      slug
      title
      productCategories {
         nodes {
           name
           slug
         }
       }
      image {
        sourceUrl
        altText
      }
      galleryImages {
        nodes {
          sourceUrl
        }
      }
      singleProductFields {
        priceMain
        priceMainSale
        v1W1
        brand
        manipulation
      }
      ... on VariableProduct {
      variations(first: 1000) {
        nodes {
          id
          databaseId
          name
          attributes {
            nodes {
              label   
              value   
            }
          }
        }
      }
    }
      ... on SimpleProduct {
        price
        stockQuantity
        description
        shortDescription
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;

export const GET_CATEGORY_SIDEBAR_DATA = gql`
  query GetCategorySidebarData($slug: [String]) {
    allPaColor(first: 100) {
      nodes {
        name
      }
    }
    allPaTechnique(first: 100) {
      nodes {
        name
      }
    }
    productCategories(first: 1000, where: {slug: $slug}) {
      nodes {
        slug
        name
        id
        description
        image {
          sourceUrl
          altText
        }
        children {
          nodes {
            name
            id
            image {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`;

// Add caching for static builds
let productsCache = null;

export async function fetchAllProducts(maxItems = 1000) {
  // Return cached data if available
  if (productsCache) {
    return productsCache;
  }

  try {
    const all = [];
    let hasNextPage = true;
    let after = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (hasNextPage && attempts < maxAttempts && all.length < maxItems) {
      try {
        const data = await graphqlClient
          .request(getAllProductsPaginatedQuery, { first: 1000, after })
          .catch(() => getMockData(getAllProductsPaginatedQuery, { first: 1000, after }));

        const { nodes, pageInfo } = data.products;
        all.push(...nodes);
        hasNextPage = pageInfo.hasNextPage;
        after = pageInfo.endCursor;
        attempts++;
      } catch (error) {
        console.error('Error fetching products batch:', error);
        hasNextPage = false;
      }
    }

    // Cache the results
    productsCache = all;
    return all;
  } catch (error) {
    console.error('Error in fetchAllProducts:', error);
    return getMockData(getAllProductsPaginatedQuery, { first: 1000 }).products.nodes;
  }
}

// Helper function to get mock data during static builds
export const getMockData = (query, variables) => {
  if (query.includes('GetAllProductsPaginated')) {
    return {
      products: {
        nodes: mockProducts,
        pageInfo: {
          hasNextPage: false,
          endCursor: null
        }
      }
    };
  }
  if (query.includes('GetProductBySlug')) {
    const product = mockProducts.find(p => p.slug === variables.slug);
    return { product };
  }
  return null;
};

export async function generateStaticParams() {
  try {
    const data = await graphqlClient.request(GET_ALL_CATEGORIES);
    const slugs = data.productCategories.nodes.map((category) => category.slug);
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
