'use client';

import React from 'react';
import { InstantSearch, SearchBox, Hits, RefinementList, Pagination, Configure, Stats, SortBy, RangeInput } from 'react-instantsearch';
import Client from '@searchkit/instantsearch-client';

const searchClient = Client({
  url: '/api/search-kit/_msearch',
  headers: {
    'Content-Type': 'application/json'
  }
});

function Hit({ hit }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{hit.name || hit.title || 'Untitled'}</h3>
      {hit.description && (
        <p className="text-gray-600 text-sm mb-2">{hit.description}</p>
      )}
      {hit.price && (
        <p className="text-green-600 font-bold">${hit.price}</p>
      )}
      {hit.category && (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
          {hit.category}
        </span>
      )}
      <div className="text-xs text-gray-500 mt-2">
        ID: {hit.objectID || hit._id}
      </div>
    </div>
  );
}

export default function SearchTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Searchkit Test Page</h1>
      
      <InstantSearch 
        searchClient={searchClient} 
        indexName="woocommerce_products_2025-08-28_23-38"
      >
        <Configure hitsPerPage={12} />
        
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="font-semibold mb-3">Categories</h2>
                <RefinementList 
                  attribute="category"
                  limit={10}
                  showMore={true}
                  showMoreLimit={20}
                  searchable={true}
                  searchablePlaceholder="Search categories..."
                  classNames={{
                    root: 'space-y-2',
                    item: 'flex items-center',
                    checkbox: 'mr-2',
                    label: 'cursor-pointer hover:text-blue-600',
                    count: 'ml-auto text-gray-500 text-sm'
                  }}
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="font-semibold mb-3">Price Range</h2>
                <RangeInput 
                  attribute="price"
                  classNames={{
                    root: 'space-y-2',
                    form: 'flex gap-2',
                    input: 'w-20 px-2 py-1 border rounded',
                    submit: 'px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'
                  }}
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="font-semibold mb-3">Brand</h2>
                <RefinementList 
                  attribute="brand"
                  limit={5}
                  showMore={true}
                  classNames={{
                    root: 'space-y-2',
                    item: 'flex items-center',
                    checkbox: 'mr-2',
                    label: 'cursor-pointer hover:text-blue-600',
                    count: 'ml-auto text-gray-500 text-sm'
                  }}
                />
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <SearchBox 
                placeholder="Search for products..."
                classNames={{
                  root: 'relative',
                  form: 'relative',
                  input: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500',
                  submit: 'absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600',
                  reset: 'absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                }}
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <Stats 
                classNames={{
                  root: 'text-gray-600',
                  text: 'text-sm'
                }}
              />
              
              <SortBy 
                items={[
                  { label: 'Relevance', value: 'products' },
                  { label: 'Price (Low to High)', value: 'products_price_asc' },
                  { label: 'Price (High to Low)', value: 'products_price_desc' },
                  { label: 'Name (A-Z)', value: 'products_name_asc' },
                  { label: 'Name (Z-A)', value: 'products_name_desc' }
                ]}
                classNames={{
                  select: 'px-3 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500'
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <Hits 
                hitComponent={Hit}
                classNames={{
                  root: 'col-span-full',
                  list: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                }}
              />
            </div>

            <div className="flex justify-center mt-8">
              <Pagination 
                classNames={{
                  root: 'flex gap-2',
                  item: 'px-3 py-1 border rounded hover:bg-gray-100',
                  selectedItem: 'bg-blue-500 text-white hover:bg-blue-600',
                  disabledItem: 'opacity-50 cursor-not-allowed',
                  link: 'block'
                }}
              />
            </div>
          </main>
        </div>
      </InstantSearch>

      <div className="mt-12 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Information</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Endpoint:</strong> /api/search-kit/_msearch</p>
          <p><strong>Index:</strong> products</p>
          <p><strong>Client:</strong> @searchkit/instantsearch-client</p>
          <p><strong>UI Library:</strong> react-instantsearch</p>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Features Implemented:</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Full-text search with SearchBox</li>
            <li>Category filtering with RefinementList</li>
            <li>Price range filtering</li>
            <li>Brand filtering</li>
            <li>Sorting options</li>
            <li>Pagination</li>
            <li>Search statistics</li>
            <li>Responsive grid layout</li>
          </ul>
        </div>
      </div>
    </div>
  );
}