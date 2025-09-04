import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://80.253.255.185:9200',
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request) {
  try {
    const ndjsonBody = await request.text();

    const lines = ndjsonBody.trim().split('\n');
    const body = [];
    
    for (let i = 0; i < lines.length; i += 2) {
      const indexLine = JSON.parse(lines[i]);
      body.push(indexLine);
      
      if (lines[i + 1]) {
        const queryLine = JSON.parse(lines[i + 1]);
        body.push(queryLine);
      }
    }
    
    const response = await client.msearch({
      body: body
    });

    let responseBody;
    if (response.body) {
      responseBody = response.body;
    } else if (response.responses) {
      responseBody = { responses: response.responses };
    } else {
      responseBody = response;
    }
    
    if (!responseBody) {
      throw new Error('No valid response from Elasticsearch');
    }

    return new Response(JSON.stringify(responseBody), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Multi-search failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    status: 200
  });
}