
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const size = parseInt(searchParams.get('size')) || 12;
    
    console.log('Search API called with query:', query);
    
    // Return empty results with proper structure
    return new Response(JSON.stringify({
      hits: [],
      total: 0,
      aggregations: {
        categories: [],
        brands: [],
        colors: [],
        custom_tags: [],
        price_stats: {}
      },
      page,
      size,
      totalPages: 0,
      message: 'Search temporarily disabled - Elasticsearch dependency needs to be updated'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      status: 200
    });

  } catch (error) {
    console.error('Search API Error:', error);
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
    console.log('POST Search API called with body:', body);
    
    // Return empty results with proper structure
    return new Response(JSON.stringify({
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
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      status: 200
    });

  } catch (error) {
    console.error('POST Search API Error:', error);
    return new Response(JSON.stringify({
      error: 'Advanced search failed',
      message: error.message
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}