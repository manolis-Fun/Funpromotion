"use client";

import { useState } from 'react';

export default function TestBackend() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setResponseTime(null);

    const startTime = performance.now();

    try {
      // Build filters array
      const filters = [];
      if (selectedColor) {
        filters.push(`attributes.color:${selectedColor}`);
      }
      if (selectedCategory) {
        filters.push(`productCategories.nodes.name:"${selectedCategory}"`);
      }

      // Build numeric filters for price
      const numericFilters = [];
      if (priceMin) {
        numericFilters.push(`price>=${priceMin}`);
      }
      if (priceMax) {
        numericFilters.push(`price<=${priceMax}`);
      }

      const requestBody = {
        requests: [
          {
            indexName: "woocommerce_products_2025-08-28_23-38",
            params: {
              query: searchQuery,
              hitsPerPage: 10,
              page: 0,
              facets: [
                "productCategories.nodes.name",
                "attributes.color",
                "attributes.material",
                "attributes.technique",
                "price"
              ],
              filters: filters.length > 0 ? filters.join(' AND ') : undefined,
              numericFilters: numericFilters.length > 0 ? numericFilters : undefined
            }
          }
        ]
      };

      console.log('Request Body:', requestBody);

      const response = await fetch('https://react-backend.woth.gr/api/search-kit/_msearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      setResponseTime(timeTaken);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      console.log('Response:', data);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen pt-[200px] max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Backend API Test - react-backend.woth.gr</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Search Parameters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Query</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., bottle, shirt, bag..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Διαφημιστικά Power Banks">Power Banks</option>
              <option value="Διαφημιστικά στυλό">Pens</option>
              <option value="Διαφημιστικές Τσάντες">Bags</option>
              <option value="Διαφημιστικά Ρούχα">Clothing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Colors</option>
              <option value="White">White</option>
              <option value="Black">Black</option>
              <option value="Blue">Blue</option>
              <option value="Red">Red</option>
              <option value="Green">Green</option>
              <option value="Yellow">Yellow</option>
              <option value="Orange">Orange</option>
              <option value="Gray">Gray</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-2">Min Price (€)</label>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Price (€)</label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Response Time Display */}
      {responseTime !== null && (
        <div className={`bg-${responseTime < 500 ? 'green' : responseTime < 1000 ? 'yellow' : 'red'}-50 border border-${responseTime < 500 ? 'green' : responseTime < 1000 ? 'yellow' : 'red'}-300 rounded-lg p-4 mb-6`}>
          <h3 className="font-semibold mb-2">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Response Time:</span>
              <p className="text-xl font-bold">{responseTime.toFixed(2)} ms</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Backend:</span>
              <p className="text-sm font-mono">react-backend.woth.gr</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Status:</span>
              <p className={`text-sm font-semibold ${responseTime < 500 ? 'text-green-600' : responseTime < 1000 ? 'text-yellow-600' : 'text-red-600'}`}>
                {responseTime < 500 ? 'Fast' : responseTime < 1000 ? 'Moderate' : 'Slow'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Search Results ({results.results?.[0]?.hits?.length || 0} products)
          </h2>

          {/* Facets */}
          {results.results?.[0]?.facets && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Available Filters (Facets)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {Object.entries(results.results[0].facets).map(([key, values]) => (
                  <div key={key}>
                    <strong>{key}:</strong>
                    <ul className="ml-4">
                      {Object.entries(values).slice(0, 5).map(([value, count]) => (
                        <li key={value}>
                          {value}: {count} items
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.results?.[0]?.hits?.map((hit, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{hit.name || hit.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {hit.shortDescription?.substring(0, 100)}...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-orange-600">
                    €{hit.price || hit.customerPrice || 'N/A'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {hit.stock_total || hit.stockQuantity || 0}
                  </span>
                </div>
                {hit.attributes?.color && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Colors: {hit.attributes.color.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Raw Response (collapsible) */}
          <details className="mt-6">
            <summary className="cursor-pointer font-semibold text-sm text-gray-600 hover:text-gray-800">
              View Raw Response
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded overflow-x-auto text-xs">
              {JSON.stringify(results, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}