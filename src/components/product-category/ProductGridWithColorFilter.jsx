"use client";
import React, { useTransition, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import Pagination from '@/components/common/Pagination';
import TopPickCards from './top-pick-cards';
import SortDropdown from '@/components/common/SortDropdown';
import { graphqlClient } from '@/lib/graphql';

const DEFAULT_ITEMS_PER_PAGE = 20;
const TOP_PICKS_COUNT = 4;

const GET_PRODUCTS_BY_CATEGORY = `
  query GetProductsByCategory($category: [String]!, $first: Int!, $after: String) {
    products( first: $first, after: $after, where: { categoryIn: $category }) {
      nodes {
        id
        slug
        name
        description
        shortDescription
        singleProductFields {
          priceMain
          priceMainSale
        }
        image {
          sourceUrl
          altText
        }
        productCategories (first: 1000){
          nodes {
            name
            slug
          }
        }
        ... on SimpleProduct {
          price
          stockQuantity
        }
        ... on VariableProduct {
          price
          stockQuantity
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export default function ProductGridWithColorFilter({
    products: initialProducts,
    categoryName,
    itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
    pageInfo: initialPageInfo,
    categorySlug
}) {
    const searchParams = useSearchParams();
    const filterColor = searchParams.get('filter_color');
    const [isPending, startTransition] = useTransition();
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const dispatch = useDispatch();
    const wishlist = useSelector(state => state.wishlist.items);
    const [currentPage, setCurrentPage] = useState(1);
    const [allProducts, setAllProducts] = useState(initialProducts);
    const [pageInfo, setPageInfo] = useState(initialPageInfo);

    // Optimize filtering with useCallback to prevent unnecessary re-renders
    const filteredProducts = useMemo(() => {
        if (!filterColor) return allProducts;

        return allProducts.filter(product =>
            product.allPaColor?.nodes?.some(
                colorNode => colorNode.name.toLowerCase() === filterColor.toLowerCase()
            )
        );
    }, [allProducts, filterColor]);

    // Load more products function
    const loadMoreProducts = useCallback(async () => {
        if (!pageInfo.hasNextPage || isLoadingMore) return;

        setIsLoadingMore(true);
        try {
            const data = await graphqlClient.request(GET_PRODUCTS_BY_CATEGORY, {
                category: [categorySlug],
                first: 50,
                after: pageInfo.endCursor
            });

            setAllProducts(prev => [...prev, ...data.products.nodes]);
            setPageInfo(data.products.pageInfo);
        } catch (error) {
            console.error('Error loading more products:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [categorySlug, pageInfo.endCursor, pageInfo.hasNextPage, isLoadingMore]);

    // Top Picks and paginated products logic
    const topPicks = filteredProducts.slice(0, TOP_PICKS_COUNT);
    const remainingProducts = filteredProducts.slice(TOP_PICKS_COUNT);
    const totalPages = Math.ceil(remainingProducts.length / itemsPerPage);
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = remainingProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []);

    const handleWishlist = useCallback((product) => (e) => {
        e.preventDefault();
        const isWishlisted = wishlist.some(item => item.id === product.id);
        if (isWishlisted) {
            dispatch(removeFromWishlist(product.id));
        } else {
            dispatch(addToWishlist(product));
        }
    }, [wishlist, dispatch]);

    if (isPending) {
        return (
            <div className="flex justify-center items-center py-12">
                <span className="text-gray-500 text-lg">Loading...</span>
            </div>
        );
    }

    if (filterColor && filteredProducts.length === 0) {
        return (
            <div className="flex flex-col items-center py-12">
                <span className="text-gray-500 text-lg font-semibold capitalize">
                    {filterColor} Color is not available in {categoryName ? <span className='font-bold text-black'> {categoryName}</span> : ''}.
                </span>
            </div>
        );
    }

    return (
        <>
            {/* Top Picks only on first page and only if there are enough products */}
            {currentPage === 1 && topPicks.length > 0 && (
                <div className="container mx-auto py-8 max-w-[1136px]">
                    <div className='flex justify-between items-center mb-8'>
                        <h1 className="text-3xl font-bold flex items-center gap-4">
                            Top picks <div className="mt-1 bg-[#3f3f3f] h-[3px] w-[200px]"></div>
                        </h1>
                        <div className='flex items-center gap-2'>
                            <SortDropdown />
                        </div>
                    </div>
                    <TopPickCards data={topPicks} />
                </div>
            )}

            {/* Category title and paginated products */}
            <div id="products-section" className="container mx-auto py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">{categoryName ? categoryName : 'All Products'}</h1>
                    <span className="text-gray-500">
                        Showing {currentPage === 1 ? TOP_PICKS_COUNT + 1 : (indexOfFirstProduct + TOP_PICKS_COUNT + 1)}-{Math.min(indexOfLastProduct + TOP_PICKS_COUNT, filteredProducts.length)} of {filteredProducts.length}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentProducts.map((product, index) => {
                        const isWishlisted = wishlist.some(item => item.id === product.id);
                        return (
                            <ProductCard key={product.id || index} product={product} onWishlistClick={handleWishlist(product)} isWishlisted={isWishlisted} />
                        );
                    })}
                </div>

                {/* Load More Button */}
                {pageInfo.hasNextPage && currentPage === totalPages && (
                    <div className="text-center mt-8">
                        <button
                            onClick={loadMoreProducts}
                            disabled={isLoadingMore}
                            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoadingMore ? 'Loading...' : 'Load More Products'}
                        </button>
                    </div>
                )}

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </>
    );
}

// Optimize ProductCard with React.memo to prevent unnecessary re-renders
export const ProductCard = React.memo(({ product, onWishlistClick, isWishlisted }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    const displayPrice = useMemo(() =>
        product?.singleProductFields?.priceMainSale ||
        product?.singleProductFields?.priceMain ||
        product?.price ||
        null,
        [product]);

    // Optimize video loading - only load when needed
    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        if (!videoLoaded) {
            setVideoLoaded(true);
        }
    }, [videoLoaded]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    return (
        <Link href={`/product/${product?.slug}`}>
            <div
                className="relative group cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Actual Card */}
                <div className="bg-[#F9F9F9] rounded-xl border border-gray-200 
                          p-4 flex flex-col text-left transition-all duration-300 
                          group-hover:shadow-lg group-hover:rounded-b-none group-hover:border-b-transparent">

                    {/* Product Image */}
                    <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-white">
                        {product?.image?.sourceUrl ? (
                            <>
                                <img
                                    src={product?.image?.sourceUrl}
                                    alt={product?.name}
                                    className="w-full h-full max-w-[259px] max-h-[259px] object-cover"
                                    loading="lazy"
                                    style={{ display: isHovered ? 'none' : 'block' }}
                                />
                                {/* Only render video if hovered and loaded */}
                                {isHovered && videoLoaded && (
                                    <video
                                        className="w-full h-full object-cover absolute top-0 left-0"
                                        src="https://storage.googleapis.com/product_videos/single%20sided%20full%20Colour%20Box1.mp4"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        onLoadStart={() => setVideoLoaded(true)}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full bg-white rounded max-w-[259px] max-h-[259px] min-h-[259px] min-w-[259px]"></div>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="text-gray-900 font-semibold h-[52px] mt-8 leading-[26px] text-lg mb-2 manrope-font">
                        {product?.title?.length > 21 ? product?.title.slice(0, 21) : product?.title || product?.name?.slice(0, 30) + "..."}
                    </h3>

                    {/* Price */}
                    <span className="text-[#FF7700] text-sm py-2 font-semibold block h-12">
                        {displayPrice}
                    </span>
                </div>

                {/* Hover Description (only for hovered card) */}
                <div className="absolute top-full left-0 w-full bg-[#F9F9F9] min-w-[240px] px-4 py-3 z-20 
                          border border-t-0 border-gray-200 rounded-b-xl shadow-lg 
                          opacity-0 translate-y-2 pointer-events-none 
                          group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto 
                          transition-all duration-300 ease-in-out">

                    <div className="flex items-center mb-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        In stock: ({product?.stockQuantity ?? 0})
                    </div>

                    {product?.shortDescription && (
                        <div
                            className="pt-2"
                            dangerouslySetInnerHTML={{
                                __html: product?.shortDescription?.replace(/\n$/, "") || "",
                            }}
                        />
                    )}
                </div>
            </div>
        </Link>
    );
});

ProductCard.displayName = 'ProductCard';
