# Funpromotion Backend API

A standalone Express server that provides search endpoints without dependencies on the Next.js project.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=3001
ELASTICSEARCH_URL=http://49.12.168.18:9200
ELASTICSEARCH_API_KEY=your_api_key_here
NODE_ENV=development
```

3. Start the server:
```bash
npm start
# or for development with auto-restart
npm run dev
```

## Available Endpoints

### Root
- **GET /** - Health check endpoint
- Returns: `{"message":"Funpromotion Backend API Server"}`

### Search
- **GET /api/search** - Basic search endpoint (currently disabled)
- **POST /api/search** - Advanced search endpoint (currently disabled)

### Search Kit (Elasticsearch Multi-Search)
- **POST /api/search-kit/_msearch** - Elasticsearch multi-search proxy
- **POST /api/search-kit/%5Fmsearch** - URL-encoded version of _msearch (required for compatibility)
- Both endpoints accept NDJSON format (newline-delimited JSON)
- Example request:
```bash
curl -X POST http://localhost:3001/api/search-kit/_msearch \
  -H "Content-Type: application/json" \
  -d '{"index":"woocommerce_products_2025-08-28_23-38"}
{"query":{"match_all":{}},"size":10}
'

# URL-encoded version works identically
curl -X POST http://localhost:3001/api/search-kit/%5Fmsearch \
  -H "Content-Type: application/json" \
  -d '{"index":"woocommerce_products_2025-08-28_23-38"}
{"query":{"match_all":{}},"size":10}
'
```

## Dependencies

- express: Web framework
- cors: Cross-origin resource sharing
- dotenv: Environment variable management
- @elastic/elasticsearch: Elasticsearch client

## Port

The server runs on port 3001 by default (configurable via PORT environment variable).