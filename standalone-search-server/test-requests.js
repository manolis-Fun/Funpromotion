const axios = require('axios');

// Test configuration
const SERVER_URL = 'http://localhost:3001';
const SEARCH_ENDPOINT = `${SERVER_URL}/api/search-kit/msearch`;

// Test cases that match your current usage
const testCases = [
  {
    name: 'Basic search - All products with facets',
    payload: [{
      indexName: 'woocommerce_products_all',
      params: {
        facets: [
          'productCategories.nodes.name',
          'attributes.color',
          'attributes.material',
          'attributes.position',
          'attributes.technique',
          'price'
        ],
        hitsPerPage: 20,
        page: 0,
        query: ''
      }
    }]
  },
  {
    name: 'Category filter - Παιδικά Δώρα',
    payload: [{
      indexName: 'woocommerce_products_all',
      params: {
        facets: [
          'productCategories.nodes.name',
          'attributes.color',
          'attributes.material',
          'attributes.position',
          'attributes.technique',
          'price'
        ],
        facetFilters: ['productCategories.nodes.name:Παιδικά Δώρα'],
        hitsPerPage: 20,
        page: 0,
        query: ''
      }
    }]
  },
  {
    name: 'Category filter - ST',
    payload: [{
      indexName: 'woocommerce_products_all',
      params: {
        facets: [
          'productCategories.nodes.name',
          'attributes.color',
          'attributes.material',
          'attributes.position',
          'attributes.technique',
          'price'
        ],
        facetFilters: ['productCategories.nodes.name:ST'],
        hitsPerPage: 20,
        page: 0,
        query: ''
      }
    }]
  },
  {
    name: 'Price range filter',
    payload: [{
      indexName: 'woocommerce_products_all',
      params: {
        facets: ['productCategories.nodes.name', 'price'],
        numericFilters: ['price>=10', 'price<=100'],
        hitsPerPage: 20,
        page: 0,
        query: ''
      }
    }]
  },
  {
    name: 'Text search query',
    payload: [{
      indexName: 'woocommerce_products_all',
      params: {
        facets: ['productCategories.nodes.name'],
        hitsPerPage: 20,
        page: 0,
        query: 'promotional'
      }
    }]
  }
];

async function runTests() {
  console.log('🧪 Running SearchKit Server Tests\n');

  // Check if server is running
  try {
    const healthCheck = await axios.get(`${SERVER_URL}/health`);
    console.log('✅ Server health check passed');
    console.log(`📍 Connected to: ${healthCheck.data.elasticsearch}\n`);
  } catch (error) {
    console.error('❌ Server is not running or health check failed');
    console.error(`Please start the server first: npm run dev\n`);
    return;
  }

  // Run test cases
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`🔍 Test ${i + 1}: ${testCase.name}`);

    try {
      const startTime = Date.now();
      const response = await axios.post(SEARCH_ENDPOINT, testCase.payload);
      const duration = Date.now() - startTime;

      const result = response.data.results[0];

      console.log(`✅ Success (${duration}ms)`);
      console.log(`   📊 Results: ${result.nbHits} hits, ${result.hits.length} returned`);

      if (result.facets && result.facets['productCategories.nodes.name']) {
        const categories = Object.keys(result.facets['productCategories.nodes.name']);
        console.log(`   🏷️  Categories: ${categories.length} found`);
        console.log(`       ${categories.slice(0, 3).join(', ')}${categories.length > 3 ? '...' : ''}`);
      }

      if (result.hits.length > 0) {
        const sampleHit = result.hits[0];
        console.log(`   📝 Sample product: ${sampleHit.name || sampleHit.title || 'Unnamed'}`);
        if (sampleHit.productCategories?.nodes?.[0]?.name) {
          console.log(`       Category: ${sampleHit.productCategories.nodes[0].name}`);
        }
      }

      console.log('');

    } catch (error) {
      console.log(`❌ Failed`);
      if (error.response?.data) {
        console.log(`   Error: ${error.response.data.message || error.response.data.error}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  }

  console.log('🎉 All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testCases };