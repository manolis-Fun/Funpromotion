import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const colors = searchParams.get('colors')?.split(',') || [];
    const customTags = searchParams.get('custom_tags')?.split(',') || [];
    const sort = searchParams.get('sort') || 'relevant';
    const page = parseInt(searchParams.get('page')) || 1;
    const size = parseInt(searchParams.get('size')) || 12;

    const searchBody = {
      index: 'woocommerce_products_2025-08-09_09-19',
      body: {
        query: buildElasticsearchQuery({
          query,
          category,
          brand,
          minPrice,
          maxPrice,
          colors,
          customTags
        }),
        sort: buildSortQuery(sort),
        from: (page - 1) * size,
        size: size,
        aggs: buildAggregations(),
        collapse: {
          field: "supplierCode"
        },
        _source: {
          includes: [
            "id",
            "title",
            "slug",
            "singleProductFields",
            "productCategories",
            "price",
            "priceMain",
            "priceMainSale",
            "stockQuantity",
            "stockStatus",
            "image",
            "images",
            "galleryImages",
            "shortDescription",
            "description",
            "supplierCode",
            "variations",
            "printingOptions",
            "post_date",
            "post_modified"
          ]
        }
      }
    };

    const response = await client.search(searchBody);

    // Handle different response structures
    const responseData = response.body || response;
    const hits = responseData.hits || {};
    const hitsArray = hits.hits || [];
    const total = hits.total?.value || hits.total || 0;
    const aggregations = responseData.aggregations || {};

    const results = {
      hits: hitsArray.map(formatProduct),
      total: total,
      aggregations: formatAggregations(aggregations),
      page,
      size,
      totalPages: Math.ceil(total / size)
    };

    return new Response(JSON.stringify(results), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      },
      status: 200
    });

  } catch (error) {
    console.error('Elasticsearch search error:', error);
    
    return new Response(JSON.stringify({
      error: 'Search failed',
      message: error.message,
      hits: [],
      total: 0,
      aggregations: {}
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      query = '',
      filters = {},
      sort = 'relevant',
      page = 1,
      size = 12,
      priceHistogram = false
    } = body;

    const searchBody = {
      index: 'woocommerce_products_2025-08-09_09-19',
      body: {
        query: buildAdvancedQuery(query, filters),
        sort: buildSortQuery(sort),
        from: (page - 1) * size,
        size: size,
        aggs: buildAggregations(priceHistogram),
        collapse: {
          field: "supplierCode"
        },
        _source: {
          excludes: ["description"]
        }
      }
    };

    const response = await client.search(searchBody);

    // Handle different response structures
    const responseData = response.body || response;
    const hits = responseData.hits || {};
    const hitsArray = hits.hits || [];
    const total = hits.total?.value || hits.total || 0;
    const aggregations = responseData.aggregations || {};

    let priceRanges = null;
    if (priceHistogram && aggregations?.price_stats) {
      priceRanges = calculatePriceHistogram(aggregations.price_stats);
    }

    const results = {
      hits: hitsArray.map(formatProduct),
      total: total,
      aggregations: formatAggregations(aggregations),
      priceHistogram: priceRanges,
      page,
      size,
      totalPages: Math.ceil(total / size)
    };

    return new Response(JSON.stringify(results), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30'
      },
      status: 200
    });

  } catch (error) {
    console.error('Elasticsearch POST search error:', error);
    
    return new Response(JSON.stringify({
      error: 'Advanced search failed',
      message: error.message
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// Basit GET sorgusu oluştur
function buildElasticsearchQuery({ query, category, brand, minPrice, maxPrice, colors, customTags }) {
  const must = [];
  const filter = [];

  // Ana arama terimi
  if (query) {
    must.push({
      multi_match: {
        query: query,
        fields: [
          "title^3",
          "title.autocomplete^2",
          "singleProductFields.brand^2",
          "productCategories.nodes.name^1.5",
          "description",
          "shortDescription",
          "supplierCode.text",
          "slug.text"
        ],
        fuzziness: "AUTO",
        operator: "and"
      }
    });
  }

  if (category) {
    filter.push({
      nested: {
        path: "productCategories.nodes",
        query: {
          term: { "productCategories.nodes.slug": category }
        }
      }
    });
  }

  if (brand) {
    filter.push({ term: { "singleProductFields.brand.keyword": brand } });
  }

  if (minPrice || maxPrice) {
    const priceRange = {};
    if (minPrice) priceRange.gte = parseFloat(minPrice);
    if (maxPrice) priceRange.lte = parseFloat(maxPrice);
    filter.push({ range: { price: priceRange } });
  }

  if (colors.length > 0) {
    filter.push({
      nested: {
        path: "variations",
        query: {
          nested: {
            path: "variations.attributes",
            query: {
              terms: { "variations.attributes.attribute_pa_extra.keyword": colors }
            }
          }
        }
      }
    });
  }

  if (customTags.length > 0) {
    filter.push({ terms: { "categories_text.keyword": customTags } });
  }

  const should = [
    {
      exists: { 
        field: "priceMainSale",
        boost: 2.0
      }
    },
    {
      range: { 
        stockQuantity: { 
          gte: 0,
          boost: 1.5
        }
      }
    }
  ];

  return {
    bool: {
      must: must.length ? must : [{ match_all: {} }],
      filter,
      should,
      minimum_should_match: 0
    }
  };
}

function buildAdvancedQuery(query, filters) {
  const must = [];
  const filter = [];

  if (query) {
    must.push({
      multi_match: {
        query: query,
        fields: [
          "title^3",
          "title.autocomplete^2",
          "singleProductFields.brand^2",
          "productCategories.nodes.name^1.5",
          "description",
          "shortDescription",
          "supplierCode.text",
          "slug.text"
        ],
        fuzziness: "AUTO",
        operator: "and"
      }
    });
  }

  if (filters.categories?.length) {
    filter.push({
      nested: {
        path: "productCategories.nodes",
        query: {
          terms: { "productCategories.nodes.slug": filters.categories }
        }
      }
    });
  }

  if (filters.brands?.length) {
    filter.push({ terms: { "singleProductFields.brand.keyword": filters.brands } });
  }

  if (filters.colors?.length) {
    filter.push({ 
      nested: {
        path: "variations",
        query: {
          nested: {
            path: "variations.attributes",
            query: {
              terms: { "variations.attributes.attribute_pa_extra.keyword": filters.colors }
            }
          }
        }
      }
    });
  }

  if (filters.custom_tags?.length) {
    filter.push({ terms: { "categories_text.keyword": filters.custom_tags } });
  }

  if (filters.price_min || filters.price_max) {
    const priceRange = {};
    if (filters.price_min) priceRange.gte = filters.price_min;
    if (filters.price_max) priceRange.lte = filters.price_max;
    filter.push({ range: { price: priceRange } });
  }

  // Boost strategies
  const should = [
    { exists: { field: "priceMainSale", boost: 2.0 } },
    { range: { stockQuantity: { gt: 0, boost: 1.2 } } },
    { term: { stockStatus: { value: "instock", boost: 1.1 } } }
  ];

  return {
    bool: {
      must: must.length ? must : [{ match_all: {} }],
      filter,
      should,
      minimum_should_match: 0
    }
  };
}

function buildSortQuery(sort) {
  switch (sort) {
    case 'price_asc':
      return [{ price: { order: 'asc' } }];
    case 'price_desc':
      return [{ price: { order: 'desc' } }];
    case 'newest':
      return [{ post_date: { order: 'desc' } }];
    case 'name_asc':
      return [{ "title.keyword": { order: 'asc' } }];
    case 'relevant':
    default:
      return [
        { _score: { order: 'desc' } },
        { stockQuantity: { order: 'desc' } },
        { post_date: { order: 'desc' } }
      ];
  }
}

function buildAggregations(priceHistogram = false) {
  const aggs = {
    categories: {
      nested: { path: 'productCategories.nodes' },
      aggs: {
        category_names: {
          terms: { field: 'productCategories.nodes.name.keyword', size: 20 }
        }
      }
    },
    brands: {
      terms: { field: 'singleProductFields.brand.keyword', size: 20 }
    },
    colors: {
      nested: { path: 'variations' },
      aggs: {
        attributes: {
          nested: { path: 'variations.attributes' },
          aggs: {
            color_values: {
              terms: { field: 'variations.attributes.attribute_pa_extra.keyword', size: 30 }
            }
          }
        }
      }
    },
    custom_tags: {
      terms: { field: 'categories_text.keyword', size: 20 }
    },
    price_stats: {
      stats: { field: 'price' }
    }
  };

  if (priceHistogram) {
    aggs.price_histogram = {
      histogram: {
        field: 'price',
        interval: 5,
        min_doc_count: 1
      }
    };
  }

  return aggs;
}

function calculatePriceHistogram(priceStats) {
  const min = priceStats.min;
  const max = priceStats.max;
  
  const ranges = [
    { min: 0, max: 3, label: '0-3€' },
    { min: 3, max: 5, label: '3-5€' },
    { min: 6, max: 9, label: '6-9€' },
    { min: 10, max: 20, label: '10-20€' },
    { min: 20, max: null, label: '20€+' }
  ];

  return ranges.map(range => ({
    ...range,
    percentage: Math.random() * 100, // Placeholder for actual percentage calculation
  }));
}

function formatProduct(hit) {
  const source = hit._source;
  
  return {
    id: hit._id,
    product_code: source.id,
    base_number: source.supplierCode,
    name: source.title,
    brand: source.singleProductFields?.brand || '',
    category: source.productCategories?.nodes?.[0]?.name || '',
    price: source.price || 0,
    discount_price: source.priceMainSale,
    has_discount: Boolean(source.priceMainSale && source.priceMainSale < source.price),
    stock_total: source.stockQuantity || 0,
    images: source.images || source.galleryImages || [],
    video_url: null,
    colors: extractColorsFromVariations(source.variations),
    custom_tags: source.categories_text ? source.categories_text.split(' ') : [],
    priority_score: source.stockQuantity || 0,
    score: hit._score,
    slug: source.slug,
    shortDescription: source.shortDescription,
    supplierCode: source.supplierCode,
    customerPrice: source.customerPrice
  };
}

function extractColorsFromVariations(variations) {
  if (!variations || !Array.isArray(variations)) return [];
  
  const colors = new Set();
  variations.forEach(variation => {
    // Check different possible color attributes
    if (variation.attributes?.attribute_pa_extra) {
      colors.add(variation.attributes.attribute_pa_extra);
    }
    if (variation.attributes?.attribute_pa_color) {
      colors.add(variation.attributes.attribute_pa_color);
    }
    // For this specific data, we might extract technique or position as "variants"
    if (variation.attributes?.attribute_pa_technique) {
      colors.add(variation.attributes.attribute_pa_technique);
    }
  });
  
  return Array.from(colors);
}

function formatAggregations(aggs) {
  if (!aggs) return {};

  return {
    categories: aggs.categories?.category_names?.buckets || [],
    brands: aggs.brands?.buckets || [],
    colors: aggs.colors?.attributes?.color_values?.buckets || [],
    custom_tags: aggs.custom_tags?.buckets || [],
    price_stats: aggs.price_stats || {},
    price_histogram: aggs.price_histogram?.buckets || []
  };
}