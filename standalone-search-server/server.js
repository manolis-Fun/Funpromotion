const express = require('express');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Elasticsearch client setup
const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://49.12.168.18:9200',
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-elastic-client-meta']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    elasticsearch: process.env.ELASTICSEARCH_URL 
  });
});

// Main search endpoint - exact replica of SearchKit functionality
app.post('/api/search-kit/_msearch', async (req, res) => {
  try {
    let rawBody;
    
    // Handle different content types
    if (typeof req.body === 'string') {
      rawBody = req.body;
    } else {
      rawBody = JSON.stringify(req.body);
    }

    console.log('📝 Received request:', rawBody);

    // Handle SearchKit/Algolia format requests
    let parsedBody;
    let operations = [];
    let requestParams = []; // Store params for each request
    
    try {
      parsedBody = JSON.parse(rawBody);
      
      // Handle both array format and single object format
      const requests = Array.isArray(parsedBody) ? parsedBody : (parsedBody.requests || [parsedBody]);
      
      for (const request of requests) {
        const indexName = request.indexName || 'woocommerce_products_2025-08-28_23-38';
        const params = request.params || {};
        requestParams.push(params); // Store params for later use
        
        console.log(`🔍 Processing request for index: ${indexName}`);
        console.log(`📋 Request params:`, JSON.stringify(params, null, 2));
        
        // Add index header
        operations.push({ index: indexName });
        
        // Build query
        let query = { match_all: {} };
        
        if (params.query && params.query.trim()) {
          query = {
            multi_match: {
              query: params.query,
              fields: ["name^2", "description", "shortDescription"]
            }
          };
        }
        
        // Add filters if present
        let filters = [];
        if (params.filters && params.filters.trim()) {
          // Parse filters like: productCategories.nodes.slug:"packaging" or price:1 TO 10
          const filterParts = params.filters.split(' AND ').map(f => f.trim());
          for (const filter of filterParts) {
            if (filter.includes(':')) {
              const [field, value] = filter.split(':');
              const cleanField = field.trim();
              const cleanValue = value.replace(/"/g, '').trim();
              
              // Handle numeric range filters (e.g., "price:1 TO 10")
              if (cleanValue.includes(' TO ')) {
                const [minVal, maxVal] = cleanValue.split(' TO ').map(v => parseFloat(v.trim()));
                if (!isNaN(minVal) && !isNaN(maxVal)) {
                  filters.push({
                    range: {
                      [cleanField]: {
                        gte: minVal,
                        lte: maxVal
                      }
                    }
                  });
                  continue;
                }
              }
              
              // Handle regular term filters
              // Add .keyword suffix for exact matching on text fields
              const fieldToUse = cleanField.includes('.') ? `${cleanField}.keyword` : cleanField;
              filters.push({
                term: { [fieldToUse]: cleanValue }
              });
            }
          }
        }
        
        // Handle numericFilters (used by SearchKit for range refinements)
        if (params.numericFilters && Array.isArray(params.numericFilters)) {
          console.log('🔢 Processing numericFilters:', params.numericFilters);
          for (const numericFilter of params.numericFilters) {
            // Handle filters like "price>=1", "price<=10"
            if (typeof numericFilter === 'string') {
              if (numericFilter.includes('>=')) {
                const [field, value] = numericFilter.split('>=');
                const numValue = parseFloat(value.trim());
                if (!isNaN(numValue)) {
                  const existingRangeIndex = filters.findIndex(f => f.range && f.range[field.trim()]);
                  if (existingRangeIndex >= 0) {
                    filters[existingRangeIndex].range[field.trim()].gte = numValue;
                  } else {
                    filters.push({
                      range: {
                        [field.trim()]: { gte: numValue }
                      }
                    });
                  }
                }
              } else if (numericFilter.includes('<=')) {
                const [field, value] = numericFilter.split('<=');
                const numValue = parseFloat(value.trim());
                if (!isNaN(numValue)) {
                  const existingRangeIndex = filters.findIndex(f => f.range && f.range[field.trim()]);
                  if (existingRangeIndex >= 0) {
                    filters[existingRangeIndex].range[field.trim()].lte = numValue;
                  } else {
                    filters.push({
                      range: {
                        [field.trim()]: { lte: numValue }
                      }
                    });
                  }
                }
              }
            }
          }
        }
        
        // Handle facetFilters (used by SearchKit for refinements) - CRITICAL FOR CATEGORY FILTERING
        if (params.facetFilters && Array.isArray(params.facetFilters)) {
          console.log('🎯 Processing facetFilters:', params.facetFilters);
          
          // Group filters by attribute for proper OR logic
          const attributeGroups = {};
          
          for (const facetFilterGroup of params.facetFilters) {
            if (Array.isArray(facetFilterGroup)) {
              // Handle array of arrays format - each sub-array is an OR group
              const orFilters = facetFilterGroup.map(facetFilter => {
                const [field, value] = facetFilter.split(':');
                const fieldToUse = `${field.trim()}.keyword`;
                console.log(`🔗 OR Filter: ${fieldToUse} = ${value.trim()}`);
                return {
                  term: { [fieldToUse]: value.trim() }
                };
              });
              
              if (orFilters.length === 1) {
                filters.push(orFilters[0]);
              } else if (orFilters.length > 1) {
                filters.push({
                  bool: {
                    should: orFilters
                  }
                });
              }
            } else if (typeof facetFilterGroup === 'string') {
              // Handle flat array format - group by attribute
              const [field, value] = facetFilterGroup.split(':');
              const fieldKey = field.trim();
              const fieldToUse = `${fieldKey}.keyword`;
              
              console.log(`🎯 Facet Filter: ${fieldToUse} = ${value.trim()}`);
              
              if (!attributeGroups[fieldKey]) {
                attributeGroups[fieldKey] = [];
              }
              attributeGroups[fieldKey].push({
                term: { [fieldToUse]: value.trim() }
              });
            }
          }
          
          // Convert grouped attributes to OR filters
          for (const [attribute, termFilters] of Object.entries(attributeGroups)) {
            if (termFilters.length === 1) {
              filters.push(termFilters[0]);
            } else if (termFilters.length > 1) {
              filters.push({
                bool: {
                  should: termFilters
                }
              });
            }
          }
        }
        
        // Build final query with filters
        let finalQuery = query;
        if (filters.length > 0) {
          console.log('🔧 Applied filters:', JSON.stringify(filters, null, 2));
          finalQuery = {
            bool: {
              must: [query],
              filter: filters
            }
          };
        }
        
        // Build aggregations for facets
        let aggregations = {};
        if (params.facets && Array.isArray(params.facets)) {
          console.log('📊 Building facets for:', params.facets);
          for (const facet of params.facets) {
            const aggName = facet.replace(/\./g, '_');
            let fieldName;
            
            // Map facet fields to their correct Elasticsearch field names
            switch (facet) {
              case 'productCategories.nodes.name':
                fieldName = 'productCategories.nodes.name.keyword';
                break;
              case 'attributes.color':
                fieldName = 'attributes.color.keyword';  // Use keyword for aggregations
                break;
              case 'attributes.material':
                fieldName = 'attributes.material.keyword';  // Use keyword for aggregations
                break;
              case 'attributes.position':
                fieldName = 'attributes.position.keyword';  // Use keyword for aggregations
                break;
              case 'attributes.technique':
                fieldName = 'attributes.technique.keyword';  // Use keyword for aggregations
                break;
              case 'stockStatus':
                fieldName = 'stockStatus.keyword';
                break;
              default:
                fieldName = `${facet}.keyword`;
                break;
            }
            
            aggregations[aggName] = {
              terms: {
                field: fieldName,
                size: params.maxValuesPerFacet || 10
              }
            };
          }
        }
        
        // Add search body
        const searchBody = {
          query: finalQuery,
          size: params.hitsPerPage || 20,
          from: params.page ? params.page * (params.hitsPerPage || 20) : 0
        };
        
        if (Object.keys(aggregations).length > 0) {
          searchBody.aggs = aggregations;
        }
        
        console.log('🚀 Final search body:', JSON.stringify(searchBody, null, 2));
        operations.push(searchBody);
      }
      
    } catch (e) {
      console.log('⚠️ Parsing fallback for raw body format');
      if (!rawBody || rawBody.trim().length === 0) {
        rawBody = `{"index":"woocommerce_products_2025-08-28_23-38"}\n{"query":{"match_all":{}},"size":10}\n`;
      }

      if (!rawBody.endsWith('\n')) {
        rawBody += '\n';
      }

      const lines = rawBody.split('\n').filter(line => line.length > 0);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (!line || line.trim() === '') {
          continue;
        }
        
        try {
          const parsed = JSON.parse(line);
          operations.push(parsed);
        } catch (parseError) {
          // Silently skip invalid lines
        }
      }
    }

    if (operations.length === 0 || operations.length % 2 !== 0) {
      operations.length = 0;
      operations.push({ index: 'woocommerce_products_2025-08-28_23-38' });
      operations.push({ 
        query: { match_all: {} },
        size: 10,
        from: 0
      });
    }

    console.log('📨 Sending to Elasticsearch:', operations.length / 2, 'requests');
    const result = await client.msearch({
      body: operations
    });

    console.log('✅ Elasticsearch response received, processing...');

    // Transform Elasticsearch response to Algolia-compatible format
    const transformedResponse = {
      results: result.responses.map((response, index) => {
        const params = requestParams[Math.floor(index / 2)] || {}; // Each request generates 2 operations
        
        if (response.error) {
          console.log('❌ Elasticsearch error:', response.error);
          return {
            error: response.error,
            hits: [],
            nbHits: 0,
            page: 0,
            nbPages: 0,
            hitsPerPage: 20
          };
        }

        const hits = response.hits?.hits || [];
        const total = response.hits?.total?.value || response.hits?.total || 0;
        const hitsPerPage = operations[1]?.size || 20;
        const page = Math.floor((operations[1]?.from || 0) / hitsPerPage);

        console.log(`📊 Request ${Math.floor(index / 2) + 1}: ${total} hits, ${hits.length} returned`);

        return {
          hits: hits.map(hit => ({
            ...hit._source,
            objectID: hit._id,
            _highlightResult: {},
            _snippetResult: {}
          })),
          nbHits: total,
          page: page,
          nbPages: Math.ceil(total / hitsPerPage),
          hitsPerPage: hitsPerPage,
          exhaustiveNbHits: true,
          query: "",
          params: "",
          processingTimeMS: result.took || 1,
          facets: (() => {
            // Build facets from aggregations
            let facets = {};
            if (response.aggregations) {
              facets = Object.keys(response.aggregations).reduce((acc, key) => {
                const aggName = key.replace(/_/g, '.');
                const buckets = response.aggregations[key]?.buckets || [];
                acc[aggName] = buckets.reduce((facetAcc, bucket) => {
                  facetAcc[bucket.key] = bucket.doc_count;
                  return facetAcc;
                }, {});
                return acc;
              }, {});
            }

            // Manually build facets from document data if aggregations are empty
            const searchRequest = operations[index * 2 + 1]; // Get corresponding search body
            if (searchRequest && searchRequest.aggs) {
              
              // Handle category facets
              const categoryFacetRequested = Object.keys(searchRequest.aggs || {}).includes('productCategories_nodes_name');
              const categoryAggregation = response.aggregations?.productCategories_nodes_name;
              const categoryIsEmpty = !categoryAggregation || (categoryAggregation.buckets && categoryAggregation.buckets.length === 0);
              
              if (categoryFacetRequested && categoryIsEmpty) {
                const categoryFacets = {};
                
                hits.forEach(hit => {
                  const source = hit._source || hit;
                  const categories = source.productCategories?.nodes || [];
                  
                  categories.forEach(category => {
                    if (category.name) {
                      categoryFacets[category.name] = (categoryFacets[category.name] || 0) + 1;
                    }
                  });
                });
                
                facets['productCategories.nodes.name'] = categoryFacets;
                console.log('🏷️ Built category facets from hits:', categoryFacets);
              }

              // Handle attribute facets (color, material, position, technique)
              const attributeFacets = ['attributes_color', 'attributes_material', 'attributes_position', 'attributes_technique'];
              
              attributeFacets.forEach(facetKey => {
                const facetRequested = Object.keys(searchRequest.aggs || {}).includes(facetKey);
                const aggregation = response.aggregations?.[facetKey];
                const isEmpty = !aggregation || (aggregation.buckets && aggregation.buckets.length === 0);
                
                if (facetRequested && isEmpty) {
                  const attributeFacetData = {};
                  const attributeName = facetKey.replace('attributes_', '');
                  
                  hits.forEach(hit => {
                    const source = hit._source || hit;
                    const attributeValues = source.attributes?.[attributeName] || [];
                    
                    // Handle both array and single values
                    const values = Array.isArray(attributeValues) ? attributeValues : [attributeValues];
                    values.forEach(value => {
                      if (value) {
                        attributeFacetData[value] = (attributeFacetData[value] || 0) + 1;
                      }
                    });
                  });
                  
                  facets[facetKey.replace('_', '.')] = attributeFacetData;
                }
              });
            }
            
            return facets;
          })(),
          facets_stats: {},
          exhaustiveFacetsCount: true,
          exhaustiveNbHits: true
        };
      })
    };

    console.log('✨ Sending transformed response');
    res.json(transformedResponse);

  } catch (error) {
    console.error('❌ Search error:', error);
    
    if (error.meta?.body?.error) {
      return res.status(error.statusCode || 500).json({
        error: error.meta.body.error.type,
        message: error.meta.body.error.reason,
        status: error.statusCode
      });
    }

    res.status(500).json({
      error: 'Search failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Handle preflight requests
app.options('/api/search-kit/_msearch', (req, res) => {
  res.status(200).end();
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Standalone SearchKit server running on http://localhost:${PORT}`);
  console.log(`📍 Search endpoint: http://localhost:${PORT}/api/search-kit/_msearch`);
  console.log(`💡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Elasticsearch: ${process.env.ELASTICSEARCH_URL}`);
});

module.exports = app;