const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const router = express.Router();

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://49.12.168.18:9200',
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY
  },
  tls: {
    rejectUnauthorized: false
  }
});

router.post('/_msearch', async (req, res) => {
  try {
    const contentType = req.get('content-type');
    console.log('Content-Type:', contentType);
    
    let rawBody = req.body ? req.body.toString() : '';
    
    console.log('=== RAW REQUEST BODY ===');
    console.log('Body length:', rawBody.length);
    console.log('Full body:', rawBody);
    console.log('========================');

    if (!rawBody || rawBody.trim().length === 0) {
      console.log('Empty body - creating default search');
      rawBody = `{"index":"woocommerce_products_2025-08-28_23-38"}\n{"query":{"match_all":{}},"size":10}\n`;
    }

    if (!rawBody.endsWith('\n')) {
      rawBody += '\n';
    }

    const lines = rawBody.split('\n').filter(line => line.length > 0);
    console.log('Number of non-empty lines:', lines.length);

    const operations = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line || line.trim() === '') {
        continue;
      }
      
      try {
        const parsed = JSON.parse(line);
        operations.push(parsed);
        console.log(`Parsed line ${i}:`, JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.error(`Failed to parse line ${i}: "${line}"`);
        console.error('Error:', e.message);
      }
    }

    console.log(`Total operations: ${operations.length}`);

    if (operations.length === 0 || operations.length % 2 !== 0) {
      console.log('Invalid operations count, using default search');
      operations.length = 0;
      operations.push({ index: 'woocommerce_products_2025-08-28_23-38' });
      operations.push({ 
        query: { match_all: {} },
        size: 10,
        from: 0
      });
    }

    console.log('=== SENDING TO ELASTICSEARCH ===');
    console.log(JSON.stringify(operations, null, 2));
    console.log('================================');

    const result = await client.msearch({
      body: operations
    });

    console.log('=== ELASTICSEARCH RESPONSE ===');
    console.log('Took:', result.took);
    console.log('Responses count:', result.responses?.length);
    if (result.responses?.length > 0) {
      console.log('First response hits:', result.responses[0]?.hits?.total);
    }
    console.log('==============================');

    res.json(result);

  } catch (error) {
    console.error('=== ERROR DETAILS ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.meta) {
      console.error('Error meta:', JSON.stringify(error.meta, null, 2));
    }
    
    if (error.body) {
      console.error('Error body:', JSON.stringify(error.body, null, 2));
    }
    
    console.error('Stack:', error.stack);
    console.error('====================');
    
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

router.options('/_msearch', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-elastic-client-meta'
  });
  res.status(200).end();
});

// Add the %5Fmsearch route (URL-encoded _msearch)
router.post('/%5Fmsearch', async (req, res) => {
  try {
    const contentType = req.get('content-type');
    console.log('Content-Type:', contentType);
    
    let rawBody = req.body ? req.body.toString() : '';
    
    console.log('=== RAW REQUEST BODY ===');
    console.log('Body length:', rawBody.length);
    console.log('Full body:', rawBody);
    console.log('========================');

    if (!rawBody || rawBody.trim().length === 0) {
      console.log('Empty body - creating default search');
      rawBody = `{"index":"woocommerce_products_2025-08-28_23-38"}\n{"query":{"match_all":{}},"size":10}\n`;
    }

    if (!rawBody.endsWith('\n')) {
      rawBody += '\n';
    }

    const lines = rawBody.split('\n').filter(line => line.length > 0);
    console.log('Number of non-empty lines:', lines.length);

    const operations = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line || line.trim() === '') {
        continue;
      }
      
      try {
        const parsed = JSON.parse(line);
        operations.push(parsed);
        console.log(`Parsed line ${i}:`, JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.error(`Failed to parse line ${i}: "${line}"`);
        console.error('Error:', e.message);
      }
    }

    console.log(`Total operations: ${operations.length}`);

    if (operations.length === 0 || operations.length % 2 !== 0) {
      console.log('Invalid operations count, using default search');
      operations.length = 0;
      operations.push({ index: 'woocommerce_products_2025-08-28_23-38' });
      operations.push({ 
        query: { match_all: {} },
        size: 10,
        from: 0
      });
    }

    console.log('=== SENDING TO ELASTICSEARCH ===');
    console.log(JSON.stringify(operations, null, 2));
    console.log('================================');

    const result = await client.msearch({
      body: operations
    });

    console.log('=== ELASTICSEARCH RESPONSE ===');
    console.log('Took:', result.took);
    console.log('Responses count:', result.responses?.length);
    if (result.responses?.length > 0) {
      console.log('First response hits:', result.responses[0]?.hits?.total);
    }
    console.log('==============================');

    res.json(result);

  } catch (error) {
    console.error('=== ERROR DETAILS ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.meta) {
      console.error('Error meta:', JSON.stringify(error.meta, null, 2));
    }
    
    if (error.body) {
      console.error('Error body:', JSON.stringify(error.body, null, 2));
    }
    
    console.error('Stack:', error.stack);
    console.error('====================');
    
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

router.options('/%5Fmsearch', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-elastic-client-meta'
  });
  res.status(200).end();
});

module.exports = router;