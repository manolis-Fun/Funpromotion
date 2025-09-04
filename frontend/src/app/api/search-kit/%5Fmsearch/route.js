import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://49.12.168.18:9200',
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    let rawBody = await request.text();
    
    console.log('=== RAW REQUEST BODY ===');
    console.log('Body length:', rawBody.length);
    console.log('Full body:', rawBody);
    console.log('========================');

    // If body is empty, create a default search
    if (!rawBody || rawBody.trim().length === 0) {
      console.log('Empty body - creating default search');
      rawBody = `{"index":"woocommerce_products_2025-08-28_23-38"}\n{"query":{"match_all":{}},"size":10}\n`;
    }

    // Ensure the body ends with a newline
    if (!rawBody.endsWith('\n')) {
      rawBody += '\n';
    }

    // Split into lines and parse
    const lines = rawBody.split('\n').filter(line => line.length > 0);
    console.log('Number of non-empty lines:', lines.length);

    // Build the operations array for msearch
    const operations = [];
    
    // Process pairs of lines (header + body)
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

    // Ensure we have pairs (index + query)
    if (operations.length === 0 || operations.length % 2 !== 0) {
      console.log('Invalid operations count, using default search');
      operations.length = 0; // Clear any partial operations
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

    // Execute msearch
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

    // Return the response in Searchkit format
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-elastic-client-meta'
      }
    });

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
    
    // Return Elasticsearch error details
    if (error.meta?.body?.error) {
      return new Response(JSON.stringify({
        error: error.meta.body.error.type,
        message: error.meta.body.error.reason,
        status: error.statusCode
      }), {
        status: error.statusCode || 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Generic error response
    return new Response(JSON.stringify({
      error: 'Search failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-elastic-client-meta'
    },
    status: 200
  });
}