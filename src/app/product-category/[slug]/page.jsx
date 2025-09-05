'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { InstantSearch, SearchBox, Hits, Configure, Stats, usePagination } from 'react-instantsearch';
import Client from '@searchkit/instantsearch-client';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import CategoryBanner from '@/components/product-category/category-banner';
import SearchKitSidebar, { PriceFilterProvider, useEffectiveResults } from '@/components/product-category/SearchKitSidebar';
import { ProductCard } from '@/components/product-category/ProductGridWithColorFilter';
import Pagination from '@/components/common/Pagination';
import TopPickCards from '@/components/product-category/top-pick-cards';
import SortDropdown from '@/components/common/SortDropdown';

const searchClient = Client({
  url: '/api/search-kit/_msearch',
  headers: {
    'Content-Type': 'application/json'
  }
});


// Component to display SearchKit results with top picks and pagination
function SearchKitProductGrid({ categoryName }) {
  const { results: effectiveResults } = useEffectiveResults();
  const { currentRefinement, refine, nbPages } = usePagination();
  const hits = effectiveResults?.hits || [];
  const dispatch = useDispatch();
  const wishlist = useSelector(state => state.wishlist.items);
  const [topPicksSortBy, setTopPicksSortBy] = useState('recommended');
  const [mainGridSortBy, setMainGridSortBy] = useState('recommended');
  
  
  // Convert SearchKit hits to the format expected by the original ProductCard
  const convertedProducts = hits.map(hit => {
    const source = hit._source || hit;
    return {
      id: source.id || hit._id || hit.objectID,
      slug: source.slug,
      name: source.name || source.title,
      title: source.title || source.name,
      description: source.description,
      shortDescription: source.shortDescription,
      price: source.customerPrice,
      stockQuantity: source.stockQuantity,
      singleProductFields: source.singleProductFields || {
        priceMain: source.price,
        priceMainSale: source.salePrice
      },
      image: source.image || { sourceUrl: source.image?.sourceUrl },
      colors: source.attributes.color,
      productCategories: source.productCategories
    };
  });

  const handleWishlist = useCallback((product) => (e) => {
    e.preventDefault();
    const isWishlisted = wishlist.some(item => item.id === product.id);
    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  }, [wishlist, dispatch]);

  const handlePageChange = useCallback((pageNumber) => {
    refine(pageNumber - 1); // SearchKit uses 0-based indexing
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [refine]);

  // Show loading state if results are not ready
  if (!effectiveResults) {
    return (
      <div className="w-full mx-auto px-4 py-16">
        <div className="flex justify-center items-center py-12">
          <span className="text-gray-500 text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (hits.length === 0) {
    return (
      <div className="w-full mx-auto px-4 py-16">
        <div className="flex flex-col items-center py-12">
          <span className="text-gray-500 text-lg font-semibold">
            No products found {categoryName ? `in ${categoryName}` : ''}.
          </span>
        </div>
      </div>
    );
  }

  // Generic sort function for products
  const sortProducts = (products, sortBy) => {
    const productsCopy = [...products];
    switch (sortBy) {
      case 'price-asc':
        return productsCopy.sort((a, b) => {
          const priceA = parseFloat(a.singleProductFields?.priceMainSale || a.singleProductFields?.priceMain || a.price || 0);
          const priceB = parseFloat(b.singleProductFields?.priceMainSale || b.singleProductFields?.priceMain || b.price || 0);
          return priceA - priceB;
        });
      case 'price-desc':
        return productsCopy.sort((a, b) => {
          const priceA = parseFloat(a.singleProductFields?.priceMainSale || a.singleProductFields?.priceMain || a.price || 0);
          const priceB = parseFloat(b.singleProductFields?.priceMainSale || b.singleProductFields?.priceMain || b.price || 0);
          return priceB - priceA;
        });
      case 'release-desc':
        return productsCopy.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      case 'rating':
        return productsCopy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'recommended':
      default:
        return productsCopy;
    }
  };

  // On first page: show first 4 as top picks, remaining 16 as regular grid
  // On other pages: show all 16 as regular grid
  const isFirstPageView = currentRefinement === 0;
  const sortedProducts = isFirstPageView ? sortProducts(convertedProducts, topPicksSortBy) : convertedProducts;
  const topPicks = isFirstPageView ? sortedProducts.slice(0, 4) : [];
  const regularProducts = isFirstPageView ? sortProducts(sortedProducts.slice(4), mainGridSortBy) : sortProducts(convertedProducts, mainGridSortBy);

  return (
    <>
      {/* Top Picks only on first page */}
      {isFirstPageView && topPicks.length > 0 && (
        <div className="container mx-auto py-8 max-w-[1136px]">
          <div className='flex justify-between items-center mb-8'>
            <h1 className="text-3xl font-bold flex items-center gap-4">
              Top picks <div className="mt-1 bg-[#3f3f3f] h-[3px] w-[200px]"></div>
            </h1>
          </div>
          <TopPickCards data={topPicks} />
        </div>
      )}

      {/* Regular products section */}
      <div id="products-section" className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{categoryName ? categoryName : 'All Products'}</h1>
          <div className="flex items-center gap-4">
            <Stats 
              classNames={{
                root: 'text-gray-500',
                text: 'text-sm'
              }}
            />
            <SortDropdown 
              initial={mainGridSortBy}
              onChange={(value) => setMainGridSortBy(value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {regularProducts.map((product, index) => {
            const isWishlisted = wishlist.some(item => item.id === product.id);
            return (
              <ProductCard 
                key={product.id || index} 
                product={product} 
                onWishlistClick={handleWishlist(product)} 
                isWishlisted={isWishlisted} 
              />
            );
          })}
        </div>

        {/* Pagination */}
        {nbPages > 1 && (
          <Pagination
            currentPage={currentRefinement + 1} // Convert to 1-based for UI
            totalPages={nbPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
}



// Hidden SearchBox component that syncs with SearchKit but doesn't render
function HiddenSearchBox() {
  return (
    <div style={{ display: 'none' }}>
      <SearchBox />
    </div>
  );
}

export default function ProductCategoryPage({ params }) {
  const { slug } = params;
  const [categoryName, setCategoryName] = useState('');
  
  useEffect(() => {

    // Test API connectivity
    const testAPI = async () => {
      try {
        // Try to fetch from the Next.js API endpoint
        const response = await fetch('/api/search-kit/_msearch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [{
              indexName: 'woocommerce_products_2025-08-28_23-38',
              params: {
                query: '',
                hitsPerPage: 1
              }
            }]
          })
        });
        
        if (response.ok) {
          await response.json();
        }
      } catch (error) {
      }
    };

    // Set category name from slug (can be updated from search results)
    // Decode URL-encoded Greek characters first
    const decodedSlug = decodeURIComponent(slug);
    setCategoryName(decodedSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    testAPI();
  }, [slug]);

  

  return (
    <section>
      <CategoryBanner sidebarData={{ productCategories: { nodes: [{ name: categoryName }] } }} />
      
      <InstantSearch 
        searchClient={searchClient} 
        indexName="woocommerce_products_2025-08-28_23-38"
      >
        <PriceFilterProvider>
          {/* Configure default filters */}
          <Configure 
            hitsPerPage={20}
            facets={[
              'productCategories.nodes.name',
              'attributes.color',
              'attributes.material',
              'attributes.position',
              'attributes.technique',
              'price'
            ]}
            numericFilters={[]}
          />
          
          
          
          {/* Hidden SearchBox for SearchKit functionality */}
          <HiddenSearchBox />
          
          <div className='flex gap-16 max-w-[1440px] mx-auto px-4 my-20'>
            <div className="w-[280px] flex-shrink-0 pt-8">
              <SearchKitSidebar />
            </div>
            <div>
  {/* SearchKit-powered product grid with top picks and pagination */}
            <SearchKitProductGrid 
              categoryName={categoryName}
            />
            </div>
            
          </div>
        </PriceFilterProvider>
      </InstantSearch>
    </section>
  );
}