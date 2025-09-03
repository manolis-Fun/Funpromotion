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

export async function GET() {
  try {
    // Test basic connectivity
    const ping = await client.ping();
    
    // Get cluster info
    const info = await client.info();
    
    // Get all indices
    const indices = await client.cat.indices({ format: 'json' });
    
    // Try a simple search on products index
    let productsTest = null;
    try {
      productsTest = await client.search({
        index: 'products',
        body: {
          query: { match_all: {} },
          size: 1
        }
      });
    } catch (e) {
      productsTest = { error: e.message };
    }

    return new Response(JSON.stringify({
      status: 'connected',
      elasticsearch: {
        version: info.version?.number,
        name: info.name,
        cluster: info.cluster_name
      },
      indices: indices.map(idx => ({
        index: idx.index,
        health: idx.health,
        status: idx.status,
        docs: idx['docs.count'],
        size: idx['store.size']
      })),
      productsIndexTest: productsTest?.hits ? {
        total: productsTest.hits.total,
        sample: productsTest.hits.hits[0]
      } : productsTest
    }, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message,
      details: error.meta?.body || error
    }, null, 2), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}