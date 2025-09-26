# Standalone SearchKit Server

This is an exact replica of the SearchKit functionality from the Next.js application, implemented as a standalone Express server.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Elasticsearch credentials
   ```

3. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## Configuration

### Environment Variables

- `ELASTICSEARCH_URL`: Your Elasticsearch cluster URL (default: http://49.12.168.18:9200)
- `ELASTICSEARCH_API_KEY`: Your Elasticsearch API key
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

### Example .env file:
```
ELASTICSEARCH_URL=http://49.12.168.18:9200
ELASTICSEARCH_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=development
```

## API Endpoints

### Main Search Endpoint
```
POST http://localhost:3001/api/search-kit/_msearch
```

This endpoint accepts the exact same requests as the original SearchKit implementation and returns identical responses.

### Health Check
```
GET http://localhost:3001/health
```

Returns server status and configuration info.

## Features

This standalone server replicates **ALL** SearchKit functionality:

✅ **Query Processing**
- Multi-match queries across name, description, shortDescription
- Exact term matching with .keyword fields

✅ **Facet Filtering** 
- Category filtering: `productCategories.nodes.name`
- Attribute filtering: `attributes.color`, `attributes.material`, etc.
- Support for OR logic within attribute groups

✅ **Numeric Filtering**
- Price range filters: `price>=10`, `price<=100`
- Range queries with gte/lte operators

✅ **Aggregations/Facets**
- Dynamic facet generation from Elasticsearch aggregations
- Fallback to manual facet building from document data
- Support for nested category structures

✅ **Pagination**
- `hitsPerPage` and `page` parameters
- Proper from/size calculation for Elasticsearch

✅ **Response Format**
- Identical Algolia-compatible response structure
- Proper hit transformation with objectID mapping
- Complete facets and metadata

## Usage Examples

### Test with curl:

```bash
# Basic search (all products)
curl -X POST http://localhost:3001/api/search-kit/_msearch \
  -H "Content-Type: application/json" \
  -d '[{
    "indexName": "woocommerce_products_2025-08-28_23-38",
    "params": {
      "facets": ["productCategories.nodes.name"],
      "hitsPerPage": 20,
      "page": 0,
      "query": ""
    }
  }]'

# Category filtered search
curl -X POST http://localhost:3001/api/search-kit/_msearch \
  -H "Content-Type: application/json" \
  -d '[{
    "indexName": "woocommerce_products_2025-08-28_23-38", 
    "params": {
      "facets": ["productCategories.nodes.name"],
      "facetFilters": ["productCategories.nodes.name:Παιδικά Δώρα"],
      "hitsPerPage": 20,
      "page": 0,
      "query": ""
    }
  }]'
```

### Integration with Frontend:

To use this standalone server with your frontend, simply update the SearchKit client URL:

```javascript
const searchClient = Client({
  url: 'http://localhost:3001/api/search-kit/_msearch',  // ← Change this
  headers: {
    'Content-Type': 'application/json'
  }
});
```

## Debugging

The server includes comprehensive logging:

- 📝 Request logging (incoming payloads)
- 🔍 Query processing details  
- 🎯 Filter application logs
- 📊 Facet building information
- ✅ Response statistics

Set `NODE_ENV=development` for detailed error stacks.

## Deployment

This server can be deployed anywhere Node.js is supported:

- **Docker**: Create a Dockerfile for containerization
- **PM2**: Use PM2 for production process management
- **Cloud**: Deploy to AWS, GCP, Azure, or any cloud platform
- **VPS**: Run directly on a VPS with proper reverse proxy setup

## Testing

The server is a 1:1 functional replica. You can:

1. Run both servers side by side
2. Send identical requests to both endpoints
3. Compare responses to verify identical functionality
4. Use this for development/testing while keeping the original for production