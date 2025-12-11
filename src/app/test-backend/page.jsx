"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function ModalPortal({ children }) {
  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setPortalContainer(document.body);
    }
    return () => setPortalContainer(null);
  }, []);

  if (!portalContainer) return null;
  return createPortal(children, portalContainer);
}

export default function TestBackend() {
  const [searchQuery, setSearchQuery] = useState('');
  const [indexName, setIndexName] = useState('woocommerce_products_all');
  const [hitsPerPage, setHitsPerPage] = useState(12);
  const [page, setPage] = useState(0);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [techniqueFilter, setTechniqueFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');
  const [customTagFilter, setCustomTagFilter] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [error, setError] = useState(null);
  const [lastRequest, setLastRequest] = useState(null);
  const [selectedHit, setSelectedHit] = useState(null);
  const [facetSelections, setFacetSelections] = useState({});
  const primaryResult = results?.results?.[0];

  const parseList = (value) =>
    value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

  const toDisplayText = (raw) => {
    if (raw === null || raw === undefined) return '';
    if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
      return String(raw);
    }
    if (Array.isArray(raw)) {
      return raw.filter(Boolean).join(', ');
    }
    if (typeof raw === 'object') {
      if (raw.relation !== undefined && raw.value !== undefined) {
        return `${raw.relation} ${raw.value}`;
      }
      const rangeParts = [];
      if (raw.from !== undefined) rangeParts.push(`from ${raw.from}`);
      if (raw.to !== undefined) rangeParts.push(`to ${raw.to}`);
      if (rangeParts.length > 0) {
        return rangeParts.join(' ');
      }
      const objectSummary = Object.entries(raw)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      if (objectSummary) {
        return objectSummary;
      }
      const serialized = JSON.stringify(raw);
      return serialized === '{}' ? '' : serialized;
    }
    return '';
  };

  const toFacetFilterValue = (raw) => {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
      return String(raw);
    }
    return null;
  };

  const pickDisplayValue = (...candidates) => {
    for (const candidate of candidates) {
      const display = toDisplayText(candidate);
      if (display) {
        return display;
      }
    }
    return '';
  };

  const handleSearch = async (overrideFacetSelections = facetSelections) => {
    setLoading(true);
    setError(null);
    setResponseTime(null);

    const startTime = performance.now();

    try {
      // Build numeric filters for price
      const numericFilters = [];
      if (priceMin) {
        numericFilters.push(`price>=${priceMin}`);
      }
      if (priceMax) {
        numericFilters.push(`price<=${priceMax}`);
      }

      // facetFilters hold attribute:value pairs (Searchkit/Algolia format)
      const facetFilters = [];
      const addFacetValues = (attribute, rawValue) => {
        parseList(rawValue).forEach((value) => {
          facetFilters.push(`${attribute}:${value}`);
        });
      };

      addFacetValues('productCategories.nodes.slug', categoryFilter);
      addFacetValues('singleProductFields.brand', brandFilter);
      addFacetValues('attributes.color', colorFilter);
      addFacetValues('attributes.material', materialFilter);
      addFacetValues('attributes.technique', techniqueFilter);
      addFacetValues('attributes.position', positionFilter);
      addFacetValues('stockStatus', stockStatusFilter);
      addFacetValues('categories_text', customTagFilter);

      Object.entries(overrideFacetSelections || {}).forEach(([facet, value]) => {
        if (value) {
          facetFilters.push(`${facet}:${value}`);
        }
      });

      const parsedHits = parseInt(hitsPerPage, 10);
      const sanitizedHitsPerPage = Number.isNaN(parsedHits) || parsedHits <= 0 ? 10 : parsedHits;
      const parsedPage = parseInt(page, 10);
      const sanitizedPage = Number.isNaN(parsedPage) || parsedPage < 0 ? 0 : parsedPage;

      const requestBody = {
        requests: [
          {
            indexName,
            params: {
              query: searchQuery,
              hitsPerPage: sanitizedHitsPerPage,
              page: sanitizedPage,
              facets: [
                "productCategories.nodes.slug",
                "singleProductFields.brand",
                "attributes.color",
                "attributes.material",
                "attributes.technique",
                "attributes.position",
                "stockStatus",
                "categories_text",
                "price"
              ],
              facetFilters: facetFilters.length > 0 ? facetFilters : undefined,
              numericFilters: numericFilters.length > 0 ? numericFilters : undefined
            }
          }
        ]
      };

      setLastRequest(requestBody);

      const response = await fetch('/api/search-kit/msearch', {
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

  const handleFacetSelection = (facetKey, value) => {
    const updatedSelections = { ...facetSelections };
    if (!value) {
      delete updatedSelections[facetKey];
    } else {
      updatedSelections[facetKey] = value;
    }
    setFacetSelections(updatedSelections);
    handleSearch(updatedSelections);
  };

  return (
    <>
      <div className="container mx-auto p-6 min-h-screen pt-[200px] max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">SearchKit / Elasticsearch Test Console</h1>

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
              <label className="block text-sm font-medium mb-2">Index Name</label>
              <input
                type="text"
                value={indexName}
                onChange={(e) => setIndexName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hits Per Page</label>
              <input
                type="number"
                value={hitsPerPage}
                onChange={(e) => setHitsPerPage(e.target.value)}
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Page (0-based)</label>
              <input
                type="number"
                value={page}
                onChange={(e) => setPage(e.target.value)}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

          <div className="border-t pt-4 mt-4">
            <h3 className="text-base font-semibold mb-4">Facet Filters (comma-separated)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Slugs</label>
                <input
                  type="text"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  placeholder="diafimistika-stylo, diafimistika-rouxa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Matches `productCategories.nodes.slug`</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Brands</label>
                <input
                  type="text"
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  placeholder="XD Design, ROLY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Matches `singleProductFields.brand`</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Colors</label>
                <input
                  type="text"
                  value={colorFilter}
                  onChange={(e) => setColorFilter(e.target.value)}
                  placeholder="Black, Red, White"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Matches `attributes.color` facet</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Materials</label>
                <input
                  type="text"
                  value={materialFilter}
                  onChange={(e) => setMaterialFilter(e.target.value)}
                  placeholder="Metal, Cotton"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Matches `attributes.material` facet</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Techniques</label>
                <input
                  type="text"
                  value={techniqueFilter}
                  onChange={(e) => setTechniqueFilter(e.target.value)}
                  placeholder="Screen Print, Laser"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Matches `attributes.technique` facet</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Positions</label>
                <input
                  type="text"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  placeholder="front, sleeve"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Matches `attributes.position` facet</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stock Status</label>
                <input
                  type="text"
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  placeholder="instock, outofstock"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Matches `stockStatus` facet</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Custom Tags</label>
                <input
                  type="text"
                  value={customTagFilter}
                  onChange={(e) => setCustomTagFilter(e.target.value)}
                  placeholder="eco, premium"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Matches `categories_text` facet</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSearch()}
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

        {lastRequest && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Last Request Payload</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(lastRequest, null, 2)}
            </pre>
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
        {primaryResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              Search Results ({pickDisplayValue(primaryResult.nbHits) || 0} products found, showing {primaryResult.hits?.length || 0})
            </h2>

            {/* Facets */}
            {primaryResult.facets && Object.keys(primaryResult.facets).length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Available Filters (Facets)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {Object.entries(primaryResult.facets).map(([key, values]) => {
                      const facetEntries = (() => {
                        if (Array.isArray(values)) {
                          return values
                            .map((item) => {
                              if (!item || typeof item !== 'object') return null;
                              const rawValue = item.value ?? item.label ?? item.name ?? '';
                              const display = toDisplayText(rawValue);
                              const count = typeof item.count === 'number' ? item.count : null;
                              if (!display || count === null) return null;
                              const filterValue = toFacetFilterValue(rawValue);
                              return { display, count, filterValue };
                            })
                            .filter(Boolean);
                        }

                        return Object.entries(values || {})
                          .filter(([, count]) => typeof count === 'number')
                          .map(([label, count]) => {
                            const display = toDisplayText(label);
                            if (!display) return null;
                            return { display, count, filterValue: toFacetFilterValue(label) };
                          })
                          .filter(Boolean);
                      })();

                      if (facetEntries.length === 0) {
                        return null;
                      }

                      const selectedFacetValue = facetSelections[key];
                      const selectedFacetDisplay = selectedFacetValue
                        ? toDisplayText(
                          facetEntries.find((entry) => entry.filterValue === selectedFacetValue)?.display ??
                          selectedFacetValue
                        )
                        : '';

                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <strong>{key}</strong>
                            {facetSelections[key] && selectedFacetDisplay && (
                              <span className="text-xs text-blue-600">
                                Selected: {selectedFacetDisplay}
                              </span>
                            )}
                          </div>
                          <ul className="ml-4">
                            {facetEntries.slice(0, 5).map(({ display, count }) => (
                              <li key={display}>
                                {display}: {count} items
                              </li>
                            ))}
                          </ul>
                          <select
                            value={facetSelections[key] || ''}
                            onChange={(e) => handleFacetSelection(key, e.target.value)}
                            className="w-full mt-1 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All {key}</option>
                            {facetEntries
                              .filter(({ filterValue }) => filterValue !== null)
                              .map(({ display, filterValue }) => (
                                <option key={filterValue} value={filterValue}>
                                  {display}
                                </option>
                              ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {primaryResult.hits?.map((hit, index) => {
                const priceDisplay = pickDisplayValue(hit.price, hit.customerPrice, 'N/A');
                const stockDisplay = pickDisplayValue(hit.stock_total, hit.stockQuantity, hit.stock, 0) || '0';
                const colorDisplay = pickDisplayValue(
                  hit.attributes?.color,
                  hit.attributes?.colors,
                  hit.color
                );

                return (
                  <div key={index} className="border rounded-lg p-4 flex flex-col gap-3">
                    <div>
                      <h3 className="font-semibold mb-2">{pickDisplayValue(hit.name, hit.title)}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {pickDisplayValue(hit.shortDescription).substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-orange-600">
                        €{priceDisplay}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {stockDisplay}
                      </span>
                    </div>
                    {colorDisplay && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Colors: {colorDisplay}</span>
                      </div>
                    )}

                    {/* START: Inner Hits Display */}
                    {hit.inner_hits && hit.inner_hits.variants && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">Available Variants:</h4>
                        <div className="flex flex-wrap gap-2">
                          {hit.inner_hits.variants.hits.hits.map(variant => (
                            <div key={variant._id} className="p-2 border rounded-md bg-gray-50 text-xs">
                              <p><strong>SKU:</strong> {variant._source.supplierCode}</p>
                              {variant._source.attributes && variant._source.attributes.color && (
                                <p><strong>Color:</strong> {variant._source.attributes.color.join(', ')}</p>
                              )}
                              <p><strong>Stock:</strong> {variant._source.stockQuantity || 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* END: Inner Hits Display */}

                    <button
                      onClick={() => setSelectedHit(hit)}
                      className="mt-auto px-3 py-2 text-sm font-medium rounded-md border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      View Raw Hit
                    </button>
                  </div>
                );
              })}
              {!primaryResult.hits?.length && (
                <div className="col-span-full text-center text-gray-500 py-6">
                  No results returned for this query.
                </div>
              )}
            </div>

            {/* Raw Response (collapsible) */}
            <details className="mt-6">
              <summary className="cursor-pointer font-semibold text-sm text-gray-600 hover:text-gray-800">
                View Raw Response
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded overflow-x-auto text-xs">
                {JSON.stringify(primaryResult, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
      {selectedHit && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
              <div className="px-4 py-3 border-b">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Elasticsearch Hit</p>
                <p className="text-base font-semibold truncate max-w-full">
                  {selectedHit.name || selectedHit.title || selectedHit.objectID}
                </p>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <pre className="text-xs bg-gray-50 rounded p-4 overflow-auto">
                  {JSON.stringify(selectedHit, null, 2)}
                </pre>
              </div>
              <div className="border-t px-4 py-3 flex justify-end">
                <button
                  onClick={() => setSelectedHit(null)}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
