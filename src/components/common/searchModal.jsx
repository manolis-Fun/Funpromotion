// common/SearchModal.jsx
"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { FiSearch, FiX, FiHeart } from "react-icons/fi";
import Tick from "@/icons/tick";
import clsx from "clsx";
import { InstantSearch, Configure, useSearchBox, useInstantSearch, useRefinementList } from "react-instantsearch";
import Client from "@searchkit/instantsearch-client";
import { ProductCard } from "@/components/product-category/ProductGridWithColorFilter";
import { useSelector, useDispatch } from "react-redux";
import { addToWishlist, removeFromWishlist } from "@/store/wishlistSlice";
import { COLOR_NAME_TO_VALUE } from "@/constants/colors";
import HistogramPriceSlider from "@/components/product-category/histogram-price-slider";

const searchClient = Client({
  url: "https://react-backend.woth.gr/api/search-kit/msearch",
  headers: {
    "Content-Type": "application/json",
  },
});

// Context for managing price range
const PriceRangeContext = React.createContext({
  priceRange: null,
  setPriceRange: () => { }
});

const usePriceRange = () => React.useContext(PriceRangeContext);


// Recent searches utilities
const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 5;

const getRecentSearches = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addRecentSearch = (query) => {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const searches = getRecentSearches();
    const trimmedQuery = query.trim();

    // Remove if already exists
    const filtered = searches.filter(search => search !== trimmedQuery);

    // Add to beginning
    const updated = [trimmedQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};

const removeRecentSearch = (query) => {
  if (typeof window === 'undefined') return;
  try {
    const searches = getRecentSearches();
    const updated = searches.filter(search => search !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};

// Website pages for no results state
const websitePages = [
  { name: "Home", href: "/" },
  { name: "Product Category", href: "/product-category/diafimistika-power-banks" },
  { name: "Wishlist", href: "/wishlist" }
];

// Top picks products to show when search is empty
const topPicksProducts = [
  {
    id: 1,
    slug: "insulated-bottle-classic",
    name: "Classic Insulated Bottle",
    title: "Classic Insulated Bottle",
    shortDescription: "Keep your drinks hot or cold for hours with this premium insulated bottle.",
    image: {
      sourceUrl: "/images/products/insulated-bottle.jpg",
      altText: "Classic Insulated Bottle"
    },
    singleProductFields: {
      priceMain: "€24.99",
      priceMainSale: null
    },
    stockQuantity: 150
  },
  {
    id: 2,
    slug: "eco-shopping-bag",
    name: "Eco-Friendly Shopping Bag",
    title: "Eco-Friendly Shopping Bag",
    shortDescription: "Sustainable and durable shopping bag made from recycled materials.",
    image: {
      sourceUrl: "/images/products/shopping-bag.jpg",
      altText: "Eco-Friendly Shopping Bag"
    },
    singleProductFields: {
      priceMain: "€12.99",
      priceMainSale: "€9.99"
    },
    stockQuantity: 200
  },
  {
    id: 3,
    slug: "premium-cap",
    name: "Premium Baseball Cap",
    title: "Premium Baseball Cap",
    shortDescription: "Comfortable and stylish baseball cap with premium materials.",
    image: {
      sourceUrl: "/images/products/baseball-cap.jpg",
      altText: "Premium Baseball Cap"
    },
    singleProductFields: {
      priceMain: "€19.99",
      priceMainSale: null
    },
    stockQuantity: 85
  },
  {
    id: 4,
    slug: "custom-t-shirt",
    name: "Custom T-Shirt",
    title: "Custom T-Shirt",
    shortDescription: "High-quality customizable t-shirt perfect for branding and promotions.",
    image: {
      sourceUrl: "/images/products/t-shirt.jpg",
      altText: "Custom T-Shirt"
    },
    singleProductFields: {
      priceMain: "€16.99",
      priceMainSale: "€14.99"
    },
    stockQuantity: 120
  }
];

// SearchBox component that connects to InstantSearch
function SearchBoxConnector({ query }) {
  const { refine } = useSearchBox();

  useEffect(() => {
    refine(query || '');
  }, [query, refine]);

  return null;
}

// Categories Filter Component - Now accepts onClose prop
function CategoriesFilter({ onClose }) {
  const { items, refine } = useRefinementList({
    attribute: 'productCategories.nodes.name'
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="font-semibold mb-4 text-gray-900 uppercase tracking-wider text-sm">CATEGORIES</h2>
      <ul className="grid gap-2">
        {items.map((item, index) => {
          return (
            <li key={String(item.value)} className="flex justify-between items-center py-1">
              <button
                onClick={() => refine(item.value)}
                className={`text-left transition-colors block flex-1 text-sm py-1 px-2 rounded ${item.isRefined
                    ? 'bg-orange-50 text-orange-800 font-medium'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
              >
                {String(item.label || '')}
              </button>
              <span className={`text-xs ml-2 px-2 py-1 rounded-full ${item.isRefined
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-500'
                }`}>
                {String(item.count || 0)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Color Filter Component (copied from original SearchKitSidebar)
function ColorFilter() {
  const refinementList = useRefinementList({
    attribute: 'attributes.color'
  });

  const items = refinementList?.items || [];
  const refine = refinementList?.refine || (() => { });

  const colorsToShow = items;
  if (colorsToShow.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="font-semibold mb-4 text-gray-900 uppercase tracking-wider text-sm">COLOR</h2>
      <ul className="grid grid-cols-6 gap-3">
        {colorsToShow.map(item => {
          const colorValue = COLOR_NAME_TO_VALUE[item.label] || "#FFFFFF";
          return (
            <li key={item.value}>
              <button
                onClick={() => refine(item.value)}
                title={item.label}
                className={clsx(
                  "w-10 h-10 rounded-lg border flex items-center justify-center shadow transition",
                  item.isRefined
                    ? "border-orange-500"
                    : "border-gray-200"
                )}
                style={{ background: colorValue }}
              >
                {item.isRefined && <Tick />}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Price Range Filter with Histogram
function PriceRangeFilter() {
  const { results } = useInstantSearch();
  const { priceRange, setPriceRange } = usePriceRange();

  // Extract products from results
  const products = useMemo(() => {
    if (!results || !results.hits || !Array.isArray(results.hits)) {
      return [];
    }
    return results.hits.map(hit => hit._source || hit);
  }, [results]);

  // Calculate min and max prices from products
  const priceData = useMemo(() => {
    if (!products.length) return { minPrice: 0, maxValue: 1000, prices: [] };

    const prices = products.map(p => {
      // Helper function to extract price value
      const extractPriceValue = (priceField) => {
        if (!priceField) return null;
        if (typeof priceField === 'object' && priceField.value !== undefined) {
          return priceField.value;
        }
        return priceField;
      };

      // Try multiple price fields
      const price = extractPriceValue(p?.discount_price) ||
        extractPriceValue(p?.price) ||
        extractPriceValue(p?.customerPrice) ||
        extractPriceValue(p?.singleProductFields?.priceMainSale) ||
        extractPriceValue(p?.singleProductFields?.priceMain) ||
        extractPriceValue(p?.regularPrice) ||
        extractPriceValue(p?.salePrice);

      if (typeof price === 'string') {
        const numPrice = parseFloat(price.replace(/[^0-9.-]+/g, ''));
        return isNaN(numPrice) ? null : numPrice;
      }
      return typeof price === 'number' ? price : null;
    }).filter(p => p !== null && p >= 0);

    if (!prices.length) return { minPrice: 0, maxValue: 1000, prices: [] };

    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxValue: Math.ceil(Math.max(...prices)),
      prices
    };
  }, [products]);

  // Handle range change
  const handleRangeChange = useCallback((newRange) => {
    if (!Array.isArray(newRange) || newRange.length !== 2) {
      return;
    }

    // Check if the range is at full extent (should clear filter)
    if (newRange[0] <= priceData.minPrice && newRange[1] >= priceData.maxValue) {
      setPriceRange(null); // Clear the filter
    } else {
      setPriceRange(newRange);
    }
  }, [setPriceRange, priceData.minPrice, priceData.maxValue]);

  // Get current range
  const currentRange = priceRange || [priceData.minPrice, priceData.maxValue];

  // Don't render if no valid price data
  if (priceData.prices.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-base font-medium mb-4">Price Range</h2>
      <HistogramPriceSlider
        products={products}
        minValue={priceData.minPrice}
        maxValue={priceData.maxValue}
        initialRange={currentRange}
        onRangeChange={handleRangeChange}
        currency="€"
        bucketCount={20}
        barHeight={60}
        showLabels={true}
        showInputs={true}
      />
    </section>
  );
}

// Custom Printing Technique Component
const PrintingTechniquesFilter = () => {
  const { items, refine } = useRefinementList({
    attribute: "attributes.technique",
    limit: 10
  });

  // Define technique icons and styling
  const getTechniqueIcon = (technique) => {
    switch (technique.toLowerCase()) {
      case '1-color':
      case '1 color':
        return (
          <div className="w-5 h-5 rounded-full bg-purple-600"></div>
        );
      case '2-colors':
      case '2 colors':
        return (
          <div className="w-5 h-5 relative">
            <div className="w-3 h-5 rounded-l-full bg-purple-600 absolute left-0"></div>
            <div className="w-3 h-5 rounded-r-full bg-teal-500 absolute right-0"></div>
          </div>
        );
      case '3-colors':
      case '3 colors':
        return (
          <div className="w-5 h-5 relative">
            <div className="w-3 h-3 rounded-full bg-purple-600 absolute top-0 left-0.5"></div>
            <div className="w-3 h-3 rounded-full bg-orange-500 absolute top-1 right-0"></div>
            <div className="w-3 h-3 rounded-full bg-teal-500 absolute bottom-0 left-1"></div>
          </div>
        );
      case '4-colors':
      case '4 colors':
        return (
          <div className="w-5 h-5 relative">
            <div className="w-3 h-3 rounded-full bg-purple-600 absolute top-0 left-0"></div>
            <div className="w-3 h-3 rounded-full bg-orange-500 absolute top-0 right-0"></div>
            <div className="w-3 h-3 rounded-full bg-gray-700 absolute bottom-0 left-0"></div>
            <div className="w-3 h-3 rounded-full bg-teal-500 absolute bottom-0 right-0"></div>
          </div>
        );
      case 'full-color':
      case 'full color':
        return (
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500"></div>
        );
      case 'lasers':
      case 'laser':
        return (
          <div className="w-5 h-5 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-gray-400"></div>
        );
    }
  };

  const formatTechniqueName = (technique) => {
    switch (technique.toLowerCase()) {
      case '1-color':
      case '1 color':
        return '1 color';
      case '2-colors':
      case '2 colors':
        return '2 colors';
      case '3-colors':
      case '3 colors':
        return '3 colors';
      case '4-colors':
      case '4 colors':
        return '4 colors';
      case 'full-color':
      case 'full color':
        return 'Full color';
      case 'lasers':
      case 'laser':
        return 'Lasers';
      default:
        return technique;
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-4 rounded-lg">
      <h2 className="font-semibold mb-4 text-gray-900 uppercase tracking-wider text-sm">PRINTING</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.value}
            onClick={() => refine(item.value)}
            className={`flex items-center justify-between cursor-pointer py-2 px-1 rounded-lg transition-colors ${item.isRefined
                ? 'bg-orange-50'
                : 'hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center gap-3">
              {getTechniqueIcon(item.value)}
              <span className={`text-sm ${item.isRefined ? 'text-gray-700 font-medium' : 'text-gray-600'
                }`}>
                {formatTechniqueName(item.value)}
              </span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${item.isRefined
                ? 'bg-orange-500 text-white font-medium'
                : 'bg-gray-100 text-gray-500'
              }`}>
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

// Simple Filter Sidebar with all filters
function SimpleFilterSidebar({ onClose }) {
  return (
    <div className="space-y-8">
      <CategoriesFilter onClose={onClose} />
      <PriceRangeFilter />
      <ColorFilter />
      <PrintingTechniquesFilter />
    </div>
  );
}

// Component to show search results header with count
function SearchHeader({ query }) {
  const { results, status } = useInstantSearch();
  const rawTotalHits = results?.nbHits || 0;

  // Extract the actual number from totalHits if it's an object
  const totalHits = typeof rawTotalHits === 'object' && rawTotalHits?.value !== undefined
    ? rawTotalHits.value
    : rawTotalHits;

  const loading = status === 'loading' || status === 'stalled';
  const safeTotalHits = Number(totalHits) || 0;

  return (
    <div className="border-b px-4 lg:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <h2 className="text-lg font-semibold">Search Results</h2>
      {!loading && (
        <span className="text-sm text-gray-500">
          {safeTotalHits} result{safeTotalHits !== 1 ? "s" : ""} for "
          {String(query || '').trim()}"
        </span>
      )}
    </div>
  );
}

// Component to check if we have search results and conditionally render sidebar
function SearchResultsWithSidebar({ query, onClose, recentSearches, handleRecentSearchClick, handleRemoveRecentSearch }) {
  const { results } = useInstantSearch();
  const hasResults = results?.hits?.length > 0;

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Sidebar - only show when there are search results and on desktop */}
      {hasResults && (
        <div className="hidden lg:block lg:w-[280px] flex-shrink-0 border-r bg-gray-50 overflow-y-auto p-6">
          <SimpleFilterSidebar onClose={onClose} />
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto py-4 px-4 lg:py-8 lg:px-6" id="search-results-container" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <SearchResultsGrid
          query={query}
          onClose={onClose}
          recentSearches={recentSearches}
          handleRecentSearchClick={handleRecentSearchClick}
          handleRemoveRecentSearch={handleRemoveRecentSearch}
        />
      </div>
    </div>
  );
}


// Product grid component for search results using SearchKit integration
const SearchResultsGrid = React.memo(function SearchResultsGrid({ query, onClose, recentSearches, handleRecentSearchClick, handleRemoveRecentSearch }) {
  const { results, status } = useInstantSearch();
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreTriggerRef = useRef(null);
  const ITEMS_PER_PAGE = 20;

  const handleWishlist = useCallback(
    (product) => (e) => {
      e.preventDefault();
      const isWishlisted = wishlist.some((item) => item.id === product.id);
      if (isWishlisted) {
        dispatch(removeFromWishlist(product.id));
      } else {
        dispatch(addToWishlist(product));
      }
    },
    [wishlist, dispatch]
  );

  const highlightMatch = (text, searchTerm) => {
    if (!text || !searchTerm) return text;
    try {
      const searchString = String(searchTerm || '').trim();
      if (!searchString) return text;

      const escapedSearchTerm = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedSearchTerm})`, "gi");
      const parts = String(text).split(regex);
      return (
        <span>
          {parts.map((part, i) =>
            regex.test(part) ? (
              <span key={i} className="bg-yellow-100 text-gray-900">
                {part}
              </span>
            ) : (
              part
            )
          )}
        </span>
      );
    } catch (error) {
      return text;
    }
  };

  const searchResults = results?.hits || [];
  const loading = status === 'loading' || status === 'stalled';
  const hasMore = searchResults.length > displayedResults.length;

  // Reset when query changes
  useEffect(() => {
    setDisplayedResults([]);
    setPage(0);
    setIsLoadingMore(false);
  }, [query]);

  // Update displayed results when search results change or page changes
  useEffect(() => {
    if (searchResults.length > 0) {
      const startIndex = 0;
      const endIndex = Math.min((page + 1) * ITEMS_PER_PAGE, searchResults.length);
      const newResults = searchResults.slice(startIndex, endIndex);
      console.log('Updating displayed results:', {
        page,
        totalResults: searchResults.length,
        displayingUpTo: endIndex,
        actualDisplayed: newResults.length
      });
      setDisplayedResults(newResults);
      // Reset loading after a short delay
      setTimeout(() => setIsLoadingMore(false), 100);
    } else {
      setDisplayedResults([]);
    }
  }, [searchResults, page, ITEMS_PER_PAGE]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoadingMore) {
      console.log('Skipping observer setup:', { hasMore, isLoadingMore });
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const scrollContainer = document.getElementById('search-results-container');
      const triggerElement = loadMoreTriggerRef.current;

      console.log('Setting up observer:', {
        scrollContainer: !!scrollContainer,
        triggerElement: !!triggerElement,
        hasMore,
        displayedCount: displayedResults.length,
        totalCount: searchResults.length
      });

      if (!scrollContainer || !triggerElement) {
        console.log('Missing elements for observer');
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          console.log('Intersection observed:', {
            isIntersecting: entry.isIntersecting,
            hasMore,
            isLoadingMore
          });

          if (entry.isIntersecting && !isLoadingMore) {
            console.log('Triggering load more');
            setIsLoadingMore(true);
            setPage(prevPage => prevPage + 1);
          }
        },
        {
          root: scrollContainer,
          rootMargin: '0px 0px 100px 0px',
          threshold: 0
        }
      );

      observer.observe(triggerElement);
      console.log('Observer attached to trigger element');

      return () => {
        console.log('Cleaning up observer');
        observer.disconnect();
      };
    }, 200);

    return () => clearTimeout(timer);
  }, [hasMore, displayedResults.length]);

  if (loading && displayedResults.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-[#F9F9F9] rounded-xl border border-gray-200 p-4 flex flex-col text-left animate-pulse min-w-[259px]">
            <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-white min-w-[259px] min-h-[259px]">
              <div className="w-full h-full bg-gray-300"></div>
            </div>
            <div className="space-y-3">
              <div className="h-5 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="flex items-center justify-between">
                <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!searchResults?.length && !loading) {
    try {
      return (
        <div className="flex flex-col lg:flex-row h-auto lg:h-[400px] overflow-hidden gap-6">
          {/* Left side - Pages List */}
          <div className="w-full lg:w-1/3 lg:pr-8">
            <h3 className="font-semibold mb-4">Useful Pages</h3>
            <ul className="space-y-3">
              {websitePages.map((page, index) => (
                <li key={index}>
                  <Link
                    href={page.href}
                    onClick={onClose}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {page.name} →
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Your recent searches</h4>
              <div className="flex flex-wrap gap-2">
                {recentSearches.length > 0 ? (
                  recentSearches.map((search, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded text-xs cursor-pointer hover:bg-gray-200 flex items-center gap-1"
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      {search}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveRecentSearch(search);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs">No recent searches</span>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="w-full lg:w-2/3 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 lg:w-48 h-32 lg:h-48 mx-auto mb-4 flex items-center justify-center">
                {/* Placeholder illustration similar to midocean.com */}
                <div className="relative">
                  <div className="w-20 lg:w-32 h-20 lg:h-32 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiSearch className="w-10 lg:w-16 h-10 lg:h-16 text-blue-400" />
                  </div>
                  <div className="absolute -top-1 lg:-top-2 -right-1 lg:-right-2 w-4 lg:w-6 h-4 lg:h-6 bg-blue-200 rounded-full"></div>
                  <div className="absolute -bottom-1 lg:-bottom-2 -left-1 lg:-left-2 w-3 lg:w-4 h-3 lg:h-4 bg-teal-200 rounded-full"></div>
                  <div className="absolute top-4 lg:top-8 -left-2 lg:-left-4 w-2 lg:w-3 h-2 lg:h-3 bg-orange-200 rounded-full"></div>
                </div>
              </div>
              <p className="text-base lg:text-lg font-medium text-gray-900 mb-2">
                Sorry, we could not find any results for "{String(query || '').trim()}"
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Is the spelling of your search term correct?</p>
                <p>
                  • Try a less specific search term. That might yield more
                  results.
                </p>
                <p>
                  •{" "}
                  <Link
                    href="/categories"
                    onClick={onClose}
                    className="text-blue-600 hover:underline"
                  >
                    Back to previous search results
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering no results section:', error);
      return (
        <div className="flex items-center justify-center py-12">
          <span className="text-gray-500">Search results unavailable. Please try again.</span>
        </div>
      );
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedResults.map((hit, index) => {
          const source = hit._source || hit;

          // Handle price which might be an object with {value, relation} or a simple value
          const extractValue = (field) => {
            if (!field) return null;
            if (typeof field === 'object' && field.value !== undefined) {
              return field.value;
            }
            return field;
          };

          const displayPrice =
            extractValue(source?.discount_price) ||
            extractValue(source?.price) ||
            extractValue(source?.customerPrice) ||
            null;
          const hasDiscount = extractValue(source?.has_discount);
          const stockTotal = extractValue(source?.stock_total) || 0;
          const stockQuantity = extractValue(source?.stockQuantity) || 0;

          return (
            <Link
              key={extractValue(source?.id) || index}
              href={`/product/${extractValue(source?.slug)}`}
              onClick={() => {
                // Close the modal when product link is clicked
                if (onClose) {
                  onClose();
                }
              }}
            >
              <div className="group cursor-pointer bg-[#F9F9F9] rounded-xl border border-gray-200 p-4 flex flex-col text-center hover:shadow-lg transition-all duration-200">
                <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-white">
                  {(() => {
                    const imageUrl = extractValue(source?.images?.[0]?.sourceUrl) ||
                      extractValue(source?.images?.[0]) ||
                      extractValue(source?.image?.sourceUrl);

                    return imageUrl ? (
                      <img
                        src={String(imageUrl)}
                        alt={String(extractValue(source?.name) || '')}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Color Display */}
                {(() => {
                  const colors = extractValue(source?.attributes?.color);
                  const colorArray = Array.isArray(colors) ? colors : [];

                  return colorArray.length > 0 ? (
                    <div className="mb-2 flex space-x-2">
                      {colorArray.slice(0, 5).map((colorName, idx) => {
                        const safeColorName = String(extractValue(colorName) || '');
                        const colorValue = COLOR_NAME_TO_VALUE[safeColorName] || "#CCCCCC";
                        const isMulticolor = String(colorValue).includes('gradient');
                        return (
                          <div
                            key={idx}
                            className="w-[18px] h-[18px] rounded-[6px] border border-gray-300 shadow-sm"
                            style={isMulticolor ?
                              { background: colorValue } :
                              { backgroundColor: colorValue }
                            }
                            title={safeColorName}
                          />
                        );
                      })}
                      {colorArray.length > 5 && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border border-gray-300 text-xs text-gray-600">
                          +{colorArray.length - 5}
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}

                <div className="flex-1 text-left">
                  <h3 className="text-gray-900 font-semibold leading-[26px] text-lg mb-2 manrope-font">
                    {highlightMatch(
                      (() => {
                        const title = extractValue(source?.title) || extractValue(source?.name) || '';
                        return String(title).length > 40 ? String(title).slice(0, 40) + "..." : String(title);
                      })(),
                      query
                    )}
                  </h3>
                  {displayPrice && (
                    <div className="flex items-center gap-2 mb-2">
                      {hasDiscount && source?.price && (
                        <span className="text-gray-400 line-through text-sm">
                          €{parseFloat(extractValue(source.price)).toFixed(2)}
                        </span>
                      )}
                      <span className="text-[#FF7700] text-lg font-semibold">
                        €{parseFloat(displayPrice).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center mb-2 font-bold text-gray-500 leading-[18px] text-[13px] manrope-font">
                    <div
                      className={`w-3 h-3 ${stockTotal > 0 || stockQuantity > 0
                          ? "bg-green-500"
                          : "bg-red-500"
                        } rounded-full mr-2`}
                    ></div>
                    {stockTotal > 0 || stockQuantity > 0
                      ? `In stock: (${stockTotal || stockQuantity})`
                      : "Out of stock"}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleWishlist({
                        id: extractValue(source?.id),
                        name: extractValue(source?.name),
                        slug: extractValue(source?.slug),
                        price: displayPrice,
                        image: source?.images?.[0] || source?.image,
                      })(e);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <FiHeart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreTriggerRef} className="py-8 flex justify-center">
          {isLoadingMore ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading more products...</span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Scroll to load more</div>
          )}
        </div>
      )}

      {/* Show message when all results are loaded */}
      {!hasMore && displayedResults.length > 0 && (
        <div className="py-4 text-center text-gray-500 text-sm">
          All {displayedResults.length} products loaded
        </div>
      )}
    </div>
  );
});

// Internal modal content that uses InstantSearch context
const SearchModalContent = React.memo(function SearchModalContent({ query, onClose, onSearch }) {
  const [topPicks, setTopPicks] = useState(topPicksProducts);
  const [topPicksLoading, setTopPicksLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);

  const handleWishlist = useCallback(
    (product) => (e) => {
      e.preventDefault();
      const isWishlisted = wishlist.some((item) => item.id === product.id);
      if (isWishlisted) {
        dispatch(removeFromWishlist(product.id));
      } else {
        dispatch(addToWishlist(product));
      }
    },
    [wishlist, dispatch]
  );

  const handleRecentSearchClick = useCallback((searchQuery) => {
    // Prevent clicking on empty searches
    if (!searchQuery || !searchQuery.trim()) return;

    addRecentSearch(searchQuery);
    // Trigger search by calling the parent's onSearch function
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Fallback to URL navigation only if onSearch is not provided
      // Use setTimeout to prevent blocking the UI
      setTimeout(() => {
        window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
      }, 100);
    }
  }, [onSearch]);

  const handleRemoveRecentSearch = useCallback((searchQuery) => {
    removeRecentSearch(searchQuery);
    setRecentSearches(getRecentSearches());
  }, []);

  // Load recent searches when component mounts
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Fetch top picks when component mounts
  useEffect(() => {
    const fetchTopPicks = async () => {
      try {
        const response = await fetch("https://react-backend.woth.gr/api/search-kit/msearch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                indexName: "woocommerce_products_all",
                params: {
                  query: "",
                  hitsPerPage: 4,
                  page: 0,
                },
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch top picks");
        }

        const data = await response.json();
        const products = data.results?.[0]?.hits || [];

        if (products.length > 0) {
          setTopPicks(products.map(hit => ({
            ...hit,
            id: hit.id || hit.objectID,
            slug: hit.slug,
            name: hit.name,
            title: hit.title || hit.name,
            shortDescription: hit.shortDescription,
            image: hit.image,
            singleProductFields: hit.singleProductFields,
            stockQuantity: hit.stockQuantity
          })));
        }
      } catch (err) {
        console.error("Failed to fetch top picks:", err);
        // Keep the default topPicksProducts if fetch fails
      } finally {
        setTopPicksLoading(false);
      }
    };

    fetchTopPicks();
  }, []);


  // Show initial categories when no query or empty query
  if (!String(query || '').trim()) {
    return (
      <>
        {/* Overlay below dropdown, above the page */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[999]"
          aria-hidden="true"
        />

        {/* Dropdown panel */}
        <div className="fixed inset-x-0 top-0 md:top-10 z-[1000] bg-white">
          <div className="mx-auto max-w-[1440px]">
            <div className="min-h-[590px] flex flex-col bg-white">
              {/* Content */}
              <div className="flex-1 overflow-y-visible p-4 md:p-6 mt-4 md:mt-8">
                <div className="flex flex-col lg:flex-row max-w-6xl mx-auto gap-6">
                  {/* Left side - Useful Pages */}
                  <div className="w-full lg:w-1/3 lg:pr-8">
                    <h3 className="font-semibold mb-4">Useful Pages</h3>
                    <ul className="space-y-3">
                      {websitePages.map((page, index) => (
                        <li key={index}>
                          <Link
                            href={page.href}
                            onClick={onClose}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {page.name} →
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Your recent searches</h4>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.length > 0 ? (
                          recentSearches.map((search, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 rounded text-xs cursor-pointer hover:bg-gray-200 flex items-center gap-1"
                              onClick={() => handleRecentSearchClick(search)}
                            >
                              {search}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveRecentSearch(search);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">No recent searches</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Top Picks */}
                  <div className="w-full lg:w-2/3">
                    <div className="flex items-center mb-2">
                      <h6 className="text-[16px] leading-[18px] font-medium flex items-center gap-4 manrope-font text-[#3f3f3f]">
                        Popular Categories
                      </h6>
                    </div>
                    {topPicksLoading ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="bg-[#F9F9F9] rounded-xl border border-gray-200 p-4 animate-pulse"
                          >
                            <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gray-300"></div>
                            <div className="space-y-3">
                              <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-32">
                        {topPicks.map((product, index) => {
                          const isWishlisted = wishlist.some(item => item.id === product.id);
                          return (
                            <div
                              key={product.id}
                              className="relative"
                              style={{ zIndex: 10 + index }}
                            >
                              <ProductCard
                                product={product}
                                onWishlistClick={handleWishlist(product)}
                                isWishlisted={isWishlisted}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show full modal when there's a search query
  if (String(query || '').trim()) {
    // Full content area with sidebar (like midocean.com) - no fixed positioning as parent handles it
    return (
      <div className="h-full flex flex-col bg-white" style={{ minHeight: '80vh' }}>
        <div className="flex-1 overflow-hidden max-w-[1440px] mx-auto px-2 lg:px-4">
          {/* Main content with sidebar and results */}
          {/* Header */}
          <SearchHeader query={query} />

          <SearchResultsWithSidebar
            query={query}
            onClose={onClose}
            recentSearches={recentSearches}
            handleRecentSearchClick={handleRecentSearchClick}
            handleRemoveRecentSearch={handleRemoveRecentSearch}
          />
        </div>
      </div>
    );
  }

  // Fallback - should not reach here
  return null;

});

// Configure component that uses price range
function SearchConfigure() {
  const { priceRange } = usePriceRange();

  // Build numeric filters for price
  const numericFilters = useMemo(() => {
    if (!priceRange || priceRange.length !== 2) {
      return undefined;
    }
    return [`price>=${priceRange[0]}`, `price<=${priceRange[1]}`];
  }, [priceRange]);

  return (
    <Configure
      hitsPerPage={100}
      facets={[
        "productCategories.nodes.name",
        "attributes.color",
        "attributes.material",
        "attributes.position",
        "attributes.technique",
        "price",
      ]}
      numericFilters={numericFilters}
    />
  );
}


// Main SearchModal component that provides InstantSearch context
const SearchModal = React.memo(function SearchModal({ query, onClose, onSearch }) {
  const [priceRange, setPriceRange] = useState(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Ensure query is always a string
  const safeQuery = String(query || '');

  // Debounce the query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(safeQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [safeQuery]);

  return (
    <PriceRangeContext.Provider value={{ priceRange, setPriceRange }}>
      <InstantSearch
        searchClient={searchClient}
        indexName="woocommerce_products_all"
      >
        <SearchConfigure />
        <SearchBoxConnector query={debouncedQuery} />
        <SearchModalContent query={safeQuery} onClose={onClose} onSearch={onSearch} />
      </InstantSearch>
    </PriceRangeContext.Provider>
  );
});

export default SearchModal;
