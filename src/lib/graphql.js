import { GraphQLClient, gql } from 'graphql-request'

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  'https://react.woth.gr/graphql'
const headers = process.env.GRAPHQL_API_KEY
  ? { authorization: `Bearer ${process.env.GRAPHQL_API_KEY}` }
  : {}

export const graphqlClient = new GraphQLClient(endpoint, { 
  headers,
  errorPolicy: 'all',
  fetch: async (url, options) => {
    try {
      const response = await fetch(url, { ...options, timeout: 10000 });
      if (!response.ok && response.status === 502) {
        throw new Error('GraphQL endpoint unavailable');
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
})

// Mock data for static builds when no API is available
const mockProducts = [
  {
    id: '1',
    databaseId: 1,
    slug: 'thor-475-ml-copper-vacuum-insulated-tumbler-7',
    title: 'Thor 475 ML Copper Vacuum Insulated Tumbler',
    status: 'publish',
    price: '29.99',
    stockQuantity: 10,
    image: {
      sourceUrl: '/images/product-1.jpg',
      altText: 'Thor Tumbler'
    },
    productCategories: {
      nodes: [
        { name: 'Drinkware', slug: 'drinkware' },
        { name: 'Tumblers', slug: 'tumblers' }
      ]
    },
    singleProductFields: {
      priceMain: '29.99',
      priceMainSale: null,
      v1W1: '1.50',
      brand: 'Thor',
      manipulation: '2.00'
    },
    galleryImages: {
      nodes: []
    },
    shortDescription: 'Premium vacuum insulated tumbler',
    description: 'High-quality copper vacuum insulated tumbler perfect for hot and cold beverages.',
    variations: null
  },
  {
    id: '2',
    databaseId: 2,
    slug: 'vinga-baltimore-rcs-explorers-backpack-4',
    title: 'Vinga Baltimore RCS Explorers Backpack',
    status: 'publish',
    price: '45.00',
    stockQuantity: 25,
    image: {
      sourceUrl: '/images/product-2.jpg',
      altText: 'Vinga Backpack'
    },
    productCategories: {
      nodes: [
        { name: 'Backpacks', slug: 'sakidia-platis-back-pack-laptop' },
        { name: 'Travel', slug: 'tsantes-eidi-taksidiou' }
      ]
    },
    singleProductFields: {
      priceMain: '45.00',
      priceMainSale: '39.99',
      v1W1: '2.00',
      brand: 'Vinga',
      manipulation: '3.00'
    },
    galleryImages: {
      nodes: []
    },
    shortDescription: 'Sustainable explorer backpack',
    description: 'Eco-friendly backpack made from recycled materials, perfect for everyday use and travel.',
    variations: null
  }
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
          metaData {
            key
            value
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
        hasNextPage = false;
      }
    }

    // Cache the results
    productsCache = all;
    return all;
  } catch (error) {
    return getMockData(getAllProductsPaginatedQuery, { first: 1000 }).products.nodes;
  }
}

// Helper function to get mock data during static builds
export const getMockData = (query, variables) => {
  const queryString = typeof query === 'string' ? query : query.loc?.source?.body || '';
  
  if (queryString.includes('GetAllProductsPaginated')) {
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
  if (queryString.includes('GetProductBySlug')) {
    const product = mockProducts.find(p => p.slug === variables.slug) || mockProducts[0];
    return { product };
  }
  if (queryString.includes('GetProductsByCategory')) {
    // Filter products by category if specified
    let filteredProducts = mockProducts;
    if (variables.category && variables.category.length > 0) {
      filteredProducts = mockProducts.filter(p => 
        p.productCategories?.nodes?.some(cat => 
          variables.category.includes(cat.slug)
        )
      );
    }
    return {
      products: {
        nodes: filteredProducts
      }
    };
  }
  return null;
};

export async function generateStaticParams() {
  try {
    const data = await graphqlClient.request(GET_ALL_CATEGORIES);
    const slugs = data.productCategories.nodes.map((category) => category.slug);
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    return [];
  }
}
