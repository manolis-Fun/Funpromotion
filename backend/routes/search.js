const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q: query = '', page = 1, size = 12 } = req.query;
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);
    
    console.log('Search API called with query:', query);
    
    // Return empty results with proper structure
    res.json({
      hits: [],
      total: 0,
      aggregations: {
        categories: [],
        brands: [],
        colors: [],
        custom_tags: [],
        price_stats: {}
      },
      page: pageNum,
      size: sizeNum,
      totalPages: 0,
      message: 'Search temporarily disabled - Elasticsearch dependency needs to be updated'
    });

  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message,
      hits: [],
      total: 0,
      aggregations: {}
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    console.log('POST Search API called with body:', body);
    
    // Return empty results with proper structure
    res.json({
      hits: [],
      total: 0,
      aggregations: {
        categories: [],
        brands: [],
        colors: [],
        custom_tags: [],
        price_stats: {}
      },
      priceHistogram: null,
      page: 1,
      size: 12,
      totalPages: 0,
      message: 'Advanced search temporarily disabled'
    });

  } catch (error) {
    console.error('POST Search API Error:', error);
    res.status(500).json({
      error: 'Advanced search failed',
      message: error.message
    });
  }
});

module.exports = router;