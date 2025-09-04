# Funpromotion

E-commerce platform with separate frontend (Next.js) and backend (Express) services.

## Project Structure

```
Funpromotion/
├── frontend/          # Next.js frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   ├── package.json   # Frontend dependencies
│   └── ...            # Next.js configuration files
├── backend/           # Express backend API
│   ├── routes/        # API routes
│   ├── server.js      # Main server file
│   ├── package.json   # Backend dependencies
│   └── .env           # Environment variables
└── package.json       # Root package.json for managing both services
```

## Quick Start

### Install All Dependencies
```bash
npm run install:all
```

### Development Mode
```bash
# Start frontend (Next.js on port 3000)
npm run dev:frontend

# Start backend (Express on port 3001)  
npm run dev:backend
```

### Production Mode
```bash
# Build and start frontend
npm run build:frontend
npm run start:frontend

# Start backend
npm run start:backend
```

## Individual Services

### Frontend (Next.js)
- **Location**: `./frontend/`
- **Port**: 3000 (fixed)
- **Technology**: Next.js, React, Tailwind CSS

### Backend (Express)  
- **Location**: `./backend/`
- **Port**: 3001 (fixed)
- **Technology**: Express, Elasticsearch
- **API Endpoints**:
  - `GET /api/search` - Basic search
  - `POST /api/search` - Advanced search  
  - `POST /api/search-kit/_msearch` - Elasticsearch multi-search

## Environment Setup

1. Configure frontend environment variables in `frontend/.env`
2. Configure backend environment variables in `backend/.env`:
   ```env
   PORT=3001
   ELASTICSEARCH_URL=http://49.12.168.18:9200
   ELASTICSEARCH_API_KEY=your_api_key_here
   NODE_ENV=development
   ```

## Development

- Frontend runs on `http://localhost:3000` (fixed port)
- Backend API runs on `http://localhost:3001` (fixed port)
- Both services can run independently
- Use `npm start` from root to run both services in parallel

## Environment Configuration

Frontend environment variables (`frontend/.env`):
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```