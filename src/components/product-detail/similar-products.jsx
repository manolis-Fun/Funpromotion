"use client";

import React, { useMemo, useCallback, useEffect } from 'react';
import { InstantSearch, useHits, Configure, useRefinementList } from 'react-instantsearch';
import Client from '@searchkit/instantsearch-client';
import { ProductCard } from '@/components/product-category/ProductGridWithColorFilter';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';

const searchClient = Client({
  url: '/api/search-kit/_msearch',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Component to fetch and display similar products
function SimilarProductsContent({ currentProductId, categoryName }) {
  const { hits } = useHits();
  const dispatch = useDispatch();
  const wishlist = useSelector(state => state.wishlist.items);

  // Use refinement list to filter by category
  const { refine, items } = useRefinementList({
    attribute: 'productCategories.nodes.name'
  });

  // Apply category filter when component mounts
  useEffect(() => {
    if (categoryName) {
      refine(categoryName);
    }
  }, [categoryName, refine]);

  // Convert SearchKit hits to the format expected by ProductCard (same as ProductCategoryClient)
  const convertedProducts = useMemo(() => {
    // Ensure hits is an array
    if (!Array.isArray(hits)) {
      console.warn('Hits is not an array:', hits);
      return [];
    }

    return hits
      .filter(hit => {
        if (!hit) return false;
        const source = hit._source || hit;
        return (source.id || hit._id || hit.objectID) !== currentProductId;
      })
      .slice(0, 4)
      .map(hit => {
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
          colors: source.attributes?.color,
          productCategories: source.productCategories
        };
      });
  }, [hits, currentProductId]);

  const handleWishlist = useCallback((product) => (e) => {
    e.preventDefault();
    const isWishlisted = wishlist.some(item => item.id === product.id);
    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  }, [dispatch, wishlist]);

  if (convertedProducts.length === 0) {
    return (
      <div className="mt-16">
        <div className="flex items-center mb-8">
          <h2 className="text-[30px] leading-[36px] font-extrabold flex items-center gap-4 manrope-font text-[#3f3f3f]">
            Similar Products
            <div className="flex items-center flex-1">
              <div className="h-[4px] w-[172px] bg-[#3f3f3f] flex-1"></div>
              <div className="flex space-x-2 ml-2">
                <div className="w-3 h-[4px] bg-[#3f3f3f]"></div>
                <div className="w-3 h-[4px] bg-[#3f3f3f]"></div>
                <div className="w-3 h-[4px] bg-[#3f3f3f]"></div>
                <div className="w-2 h-[4px] bg-[#3f3f3f]"></div>
              </div>
            </div>
          </h2>
        </div>
        <div className="text-gray-500 text-center py-8">
          No similar products found for category: {categoryName}
          <br />
          <span className="text-sm">
            Debug: hits={hits.length}, currentProductId={currentProductId}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="flex items-center mb-8">
        <h2 className="text-[30px] leading-[36px] font-extrabold flex items-center gap-4 manrope-font text-[#3f3f3f]">
          Similar Products
          <div className="flex items-center flex-1">
            <div className="h-[4px] w-[172px] bg-[#3f3f3f] flex-1"></div>
            <div className="flex space-x-2 ml-2">
              <div className="w-3 h-[4px] bg-[#3f3f3f]"></div>
              <div className="w-3 h-[4px] bg-[#3f3f3f]"></div>
              <div className="w-3 h-[4px] bg-[#3f3f3f]"></div>
              <div className="w-2 h-[4px] bg-[#3f3f3f]"></div>
            </div>
          </div>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {convertedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onWishlistToggle={handleWishlist(product)}
            isWishlisted={wishlist.some(item => item.id === product.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Main similar products component with SearchKit wrapper
export default function SimilarProducts({ product }) {
  if (!product?.productCategories?.nodes?.length) {
    return null;
  }

  // Get the first category name for filtering
  const categoryName = product.productCategories.nodes[0]?.name;

  if (!categoryName) {
    return null;
  }

  // Wrap in error boundary
  try {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <InstantSearch
          searchClient={searchClient}
          indexName="woocommerce_products_2025-08-28_23-38"
        >
          {/* Configure search settings */}
          <Configure
            hitsPerPage={8}
            facets={['productCategories.nodes.name']}
          />

          <SimilarProductsContent
            currentProductId={product.id}
            categoryName={categoryName}
          />
        </InstantSearch>
      </div>
    );
  } catch (error) {
    console.error('Error rendering SimilarProducts:', error);
    return null;
  }
}