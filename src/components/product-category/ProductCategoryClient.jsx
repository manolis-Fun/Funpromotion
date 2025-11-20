'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InstantSearch } from 'react-instantsearch';
import Client from '@searchkit/instantsearch-client';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import CategoryBanner from '@/components/product-category/category-banner';
import SearchKitSidebar, { PriceFilterProvider } from '@/components/product-category/SearchKitSidebar';
import { ProductCard } from '@/components/product-category/ProductGridWithColorFilter';
import Pagination from '@/components/common/Pagination';
import TopPickCards from '@/components/product-category/top-pick-cards';
import SortDropdown from '@/components/common/SortDropdown';

const searchClient = Client({
  url: '/api/search-kit/msearch',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Simple CategoryBanner component
function SimpleCategoryBanner({ categoryName, totalProducts }) {
  const sidebarData = {
    productCategories: {
      nodes: [{ name: categoryName }]
    }
  };

  const categories = [
    {
      name: categoryName,
      count: totalProducts,
      slug: categoryName.toLowerCase().replace(/\s+/g, '-')
    }
  ];

  return (
    <CategoryBanner
      sidebarData={sidebarData}
      categories={categories}
    />
  );
}

// Product Grid component using /api/search
function ProductGrid({ categoryName, products, loading, onPageChange, currentPage, totalPages, onSortChange, sortBy, totalProducts }) {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);

  const handleWishlist = useCallback((product) => {
    const isWishlisted = wishlist.some((item) => item.id === product.id);
    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  }, [wishlist, dispatch]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">No products match your criteria in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with product count and sort */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {totalProducts} Products in {categoryName}
        </h2>
        <SortDropdown
          onSortChange={onSortChange}
          currentSort={sortBy}
        />
      </div>

      {/* Top Picks */}
      <TopPickCards products={products.slice(0, 3)} />

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onWishlistToggle={() => handleWishlist(product)}
            isWishlisted={wishlist.some((item) => item.id === product.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

export default function ProductCategoryClient({ slug }) {
  const [categoryName, setCategoryName] = useState('');
  const [displayCategoryName, setDisplayCategoryName] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  useEffect(() => {
    // Set category name from slug
    const decodedSlug = decodeURIComponent(slug);

    // Keep hyphens for API (API expects hyphens, not spaces)
    const apiCategoryName = decodedSlug; // Don't replace hyphens
    setCategoryName(apiCategoryName);

    // Create display name with spaces for UI
    const displayName = decodedSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    setDisplayCategoryName(displayName);
  }, [slug]);

  const fetchProducts = useCallback(async (page = 1, sort = 'relevance') => {
    if (!categoryName) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        category: categoryName,
        page: page.toString(),
        size: '20'
      });

      if (sort !== 'relevance') {
        params.append('sort', sort);
      }

      const response = await fetch(`/api/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      // Transform API response to match expected format
      const transformedProducts = Array.isArray(data?.hits)
        ? data.hits.map(hit => {
          // pick a display image
          const firstImage =
            Array.isArray(hit.images) && hit.images.length > 0
              ? hit.images[0]
              : '/images/placeholder.jpg';

          return {
            id: hit.id ?? hit.product_code,              // stable id from API
            name: hit.name,
            title: hit.name,
            price: typeof hit.price === 'number' ? hit.price : Number(hit.price ?? 0),
            discount_price: hit.discount_price ?? null,
            has_discount: !!hit.has_discount,
            image: { sourceUrl: firstImage },
            images: (
              Array.isArray(hit.images) && hit.images.length > 0
                ? hit.images.map(src => ({ sourceUrl: src }))
                : [{ sourceUrl: '/images/placeholder.jpg' }]
            ),
            slug: hit.slug ?? String(hit.id ?? hit.base_number ?? ''),
            stockQuantity: hit.stock_total ?? 0,
            category: hit.category,
            brand: hit.brand ?? '',
            base_number: hit.base_number ?? '',
            supplierCode: hit.supplierCode ?? '',
            attributes: {
              color: Array.isArray(hit.colors) ? hit.colors : [],
              material: hit.material ? [hit.material] : [],
              technique: hit.technique ? [hit.technique] : []
            }
          };
        })
        : [];
      setProducts(transformedProducts);

      // Set total product count and calculate pagination
      const totalItems = typeof data?.total === 'number' ? data.total : transformedProducts.length;
      setTotalProducts(totalItems);

      const calculatedTotalPages = typeof data?.totalPages === 'number' ? data.totalPages : Math.ceil(totalItems / 20);
      setTotalPages(calculatedTotalPages);

    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  // Fetch products when category changes
  useEffect(() => {
    if (categoryName) {
      fetchProducts(1, sortBy);
    }
  }, [categoryName, fetchProducts]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    fetchProducts(page, sortBy);
  }, [fetchProducts, sortBy]);

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
    fetchProducts(1, newSort);
  }, [fetchProducts]);

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Products</h3>
        <p className="text-gray-500">{error}</p>
        <button
          onClick={() => fetchProducts(currentPage, sortBy)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section>
      <InstantSearch
        searchClient={searchClient}
        indexName="woocommerce_products_all"
      >
        <PriceFilterProvider>
          {/* Category Banner */}
          <SimpleCategoryBanner
            categoryName={displayCategoryName}
            totalProducts={totalProducts}
          />

          <div className='flex gap-16 max-w-[1440px] mx-auto px-4 my-20'>
            {/* Original Sidebar with SearchKit Filters */}
            <div className="w-[280px] flex-shrink-0 pt-8">
              <SearchKitSidebar />
            </div>

            {/* Main Content using /api/search */}
            <div className="flex-1">
              <ProductGrid
                categoryName={displayCategoryName}
                products={products}
                loading={loading}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={totalPages}
                onSortChange={handleSortChange}
                sortBy={sortBy}
                totalProducts={totalProducts}
              />
            </div>
          </div>
        </PriceFilterProvider>
      </InstantSearch>
    </section>
  );
}