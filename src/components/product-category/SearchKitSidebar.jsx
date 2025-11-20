"use client";

import React, { useState, useCallback, useMemo, useEffect, createContext, useContext } from "react";
import { useRefinementList, useInstantSearch, RefinementList, useRange } from 'react-instantsearch';
import clsx from "clsx";
import Tick from "@/icons/tick";
import PrintingOption from "@/components/common/printing-options";
import HistogramPriceSlider from "@/components/product-category/histogram-price-slider";
import { productCategoryPrinting } from "@/utils/data";
import Link from "next/link";
import { COLOR_NAME_TO_VALUE } from "@/constants/colors";

// Context for managing price filtered results
const PriceFilterContext = createContext({
    priceFilteredResults: null,
    setPriceFilteredResults: () => { },
    priceRange: null,
    setPriceRange: () => { },
    isFiltering: false,
    setIsFiltering: () => { }
});

export const PriceFilterProvider = ({ children }) => {
    const [priceFilteredResults, setPriceFilteredResults] = useState(null);
    const [priceRange, setPriceRange] = useState(null);
    const [isFiltering, setIsFiltering] = useState(false);

    return (
        <PriceFilterContext.Provider value={{
            priceFilteredResults,
            setPriceFilteredResults,
            priceRange,
            setPriceRange,
            isFiltering,
            setIsFiltering
        }}>
            {children}
        </PriceFilterContext.Provider>
    );
};

const usePriceFilter = () => useContext(PriceFilterContext);

// Custom Printing Technique Component
const CustomPrintingTechnique = () => {
    const { items, refine } = useRefinementList({
        attribute: "attributes.technique",
        limit: 10
    });

    // Handle technique click with proper event handling
    const handleTechniqueClick = useCallback((value, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        // Use setTimeout to ensure state updates properly
        setTimeout(() => {
            refine(value);
        }, 0);
    }, [refine]);

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
        // Format the technique name to match screenshot
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

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div
                    key={item.value}
                    onClick={(e) => handleTechniqueClick(item.value, e)}
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
    );
};

// Hook to get effective results (filtered or original SearchKit results)
export const useEffectiveResults = () => {
    const { results } = useInstantSearch();
    const { priceFilteredResults, isFiltering } = usePriceFilter();

    // Always use SearchKit results unless we have price filtering active with no other filters
    // This ensures SearchKit filters (color, technique, etc.) always work
    const shouldUsePriceFiltered = isFiltering && priceFilteredResults;

    return {
        results: shouldUsePriceFiltered ? priceFilteredResults : results,
        isFiltered: shouldUsePriceFiltered,
        originalResults: results
    };
};

// Color Filter Component
function ColorFilter() {
    const refinementList = useRefinementList({
        attribute: 'attributes.color'  // Correct path from sample response
    });

    // Add safety checks
    const items = refinementList?.items || [];
    const refine = refinementList?.refine || (() => { });

    // Handle color click with proper event handling
    const handleColorClick = useCallback((value, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        // Use setTimeout to ensure state updates properly
        setTimeout(() => {
            refine(value);
        }, 0);
    }, [refine]);

    // Use SearchKit items for colors
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
                                onClick={(e) => handleColorClick(item.value, e)}
                                title={item.label}
                                type="button"
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

// Price Range Filter Component with Histogram using SearchKit integration
function PriceRangeFilter() {
    const { results, uiState } = useInstantSearch();
    const { setPriceFilteredResults, priceRange, setPriceRange, setIsFiltering } = usePriceFilter();


    // Add safety checks for results
    if (!results || !results.hits || !Array.isArray(results.hits)) {
        return null;
    }

    // Extract products from _source
    const products = results.hits.map(hit => hit._source || hit);

    // Calculate min and max prices from products
    const priceData = useMemo(() => {
        if (!products.length) return { minPrice: 0, maxValue: 1000, prices: [] };

        const prices = products.map(p => {
            // Try multiple price fields
            const price = p?.singleProductFields?.priceMainSale ||
                p?.singleProductFields?.priceMain ||
                p?.price ||
                p?.regularPrice ||
                p?.salePrice;

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

    // Handle range change with context integration
    const handleRangeChange = useCallback(async (newRange) => {

        // Ensure newRange is an array with two values
        if (!Array.isArray(newRange) || newRange.length !== 2) {
            return;
        }

        // If range is the full range, clear the filter
        if (newRange[0] === priceData.minPrice && newRange[1] === priceData.maxValue) {
            setPriceFilteredResults(null);
            setPriceRange(null);
            setIsFiltering(false);
            return;
        }

        setIsFiltering(true);
        setPriceRange(newRange);

        // Build numeric filters in Algolia format
        const numericFilters = [
            `price>=${newRange[0]}`,
            `price<=${newRange[1]}`
        ];

        // Get current SearchKit filters from uiState
        const currentIndexState = uiState['woocommerce_products_all'] || {};
        const facetFilters = [];

        // Add refinement list filters
        if (currentIndexState.refinementList) {
            Object.entries(currentIndexState.refinementList).forEach(([attribute, values]) => {
                if (Array.isArray(values) && values.length > 0) {
                    values.forEach(value => {
                        facetFilters.push(`${attribute}:${value}`);
                    });
                }
            });
        }

        try {
            const requestBody = [{
                indexName: 'woocommerce_products_all',
                params: {
                    facets: [
                        'attributes.color',
                        'attributes.material',
                        'attributes.position',
                        'attributes.technique',
                        'price',
                        'productCategories.nodes.name'
                    ],
                    numericFilters: numericFilters,
                    facetFilters: facetFilters,
                    hitsPerPage: 20,
                    page: 0,
                    query: ''
                }
            }];


            const response = await fetch('/api/search-kit/msearch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            // Store filtered results in context
            if (data?.results?.[0]) {
                setPriceFilteredResults(data.results[0]);
            }

        } catch (error) {
            setIsFiltering(false);
        }
    }, [priceData, setPriceFilteredResults, setPriceRange, setIsFiltering, uiState]);

    // Get current range from context or use default
    const currentRange = priceRange || [priceData.minPrice, priceData.maxValue];

    // Don't render if no valid price data
    if (priceData.prices.length === 0) {
        return null;
    }

    // Always render the histogram when we have price data
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

// SearchKit-enabled category component
function SearchKitCategories() {
    const { items } = useRefinementList({
        attribute: 'productCategories.nodes.name'  // Correct path from sample response
    });



    // Show SearchKit items as categories
    const categoriesToShow = items.map(item => ({
        name: item.label,
        slug: item.value.toLowerCase().replace(/\s+/g, '-'),
        count: item.count
    }));

    if (categoriesToShow.length === 0) {
        return null;
    }

    return (
        <section>
            <h2 className="font-semibold mb-4 text-gray-900 uppercase tracking-wider text-sm">CATEGORIES</h2>
            <ul className="grid gap-2">
                {categoriesToShow.map(c => {
                    // Check if this category is currently refined (for SearchKit items)
                    const isRefined = items.some(item => item.label === c.name && item.isRefined);

                    return (
                        <li key={c.name || c.slug} className="flex justify-between items-center py-1">
                            <Link
                                href={`/product-category/${c.slug}`}
                                className={`text-left text-gray-600 hover:text-gray-800 transition-colors block flex-1 text-sm ${isRefined ? 'text-gray-800 font-medium' : ''
                                    }`}
                            >
                                {c.name}
                            </Link>
                            <span className="text-gray-400 text-xs ml-2">({c.count})</span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

// Sidebar Skeleton Loader
function SidebarSkeleton() {
    return (
        <div className="w-full space-y-8">
            {/* Categories Skeleton */}
            <section>
                <div className="h-5 bg-gray-300 rounded w-24 mb-4 animate-pulse"></div>
                <ul className="grid gap-1">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <li key={index} className="flex justify-between items-center">
                            <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-gray-300 rounded w-8 animate-pulse"></div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Price Range Skeleton */}
            <section>
                <div className="h-5 bg-gray-300 rounded w-20 mb-4 animate-pulse"></div>
                <div className="h-16 bg-gray-300 rounded mb-4 animate-pulse"></div>
                <div className="flex gap-2">
                    <div className="h-8 bg-gray-300 rounded w-16 animate-pulse"></div>
                    <div className="h-8 bg-gray-300 rounded w-16 animate-pulse"></div>
                </div>
            </section>

            {/* Color Skeleton */}
            <section>
                <div className="h-5 bg-gray-300 rounded w-12 mb-4 animate-pulse"></div>
                <ul className="grid grid-cols-6 gap-3">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <li key={index}>
                            <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Material Filter Skeleton */}
            <section className="bg-white p-4 rounded-lg shadow">
                <div className="h-5 bg-gray-300 rounded w-16 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center">
                            <div className="w-4 h-4 bg-gray-300 rounded mr-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
                            <div className="h-3 bg-gray-300 rounded w-6 ml-auto animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Technique Filter Skeleton */}
            <section className="bg-white p-4 rounded-lg shadow">
                <div className="h-5 bg-gray-300 rounded w-24 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center">
                            <div className="w-4 h-4 bg-gray-300 rounded mr-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                            <div className="h-3 bg-gray-300 rounded w-6 ml-auto animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Position Filter Skeleton */}
            <section className="bg-white p-4 rounded-lg shadow">
                <div className="h-5 bg-gray-300 rounded w-16 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center">
                            <div className="w-4 h-4 bg-gray-300 rounded mr-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                            <div className="h-3 bg-gray-300 rounded w-6 ml-auto animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default function SearchKitSidebar() {
    const { status } = useInstantSearch();

    // Show skeleton during initial load
    if (status === 'loading' || status === 'stalled') {
        return <SidebarSkeleton />;
    }

    return (
        <div className="w-full space-y-8">
            {/* SearchKit-enabled Categories using facets */}
            <SearchKitCategories />

            {/* Price Range Filter - Second after categories */}
            <PriceRangeFilter />

            {/* Color Filter using facets */}
            <ColorFilter />

            {/* Material Filter */}
            {/* <section className="bg-white p-4 rounded-lg shadow">
                <h2 className="font-semibold mb-3">Material</h2>
                <RefinementList 
                    attribute="attributes.material"
                    limit={10}
                    showMore={true}
                    classNames={{
                        root: 'space-y-2',
                        item: 'flex items-center',
                        checkbox: 'mr-2',
                        label: 'cursor-pointer hover:text-blue-600 text-sm',
                        count: 'ml-auto text-gray-500 text-xs'
                    }}
                />
            </section> */}

            {/* Technique/Printing Filter */}
            <section className="bg-white py-4 rounded-lg">
                <h2 className="font-semibold mb-4 text-gray-900 uppercase tracking-wider text-sm">PRINTING</h2>
                <CustomPrintingTechnique />
            </section>

            {/* Position Filter */}
            {/* <section className="bg-white p-4 rounded-lg shadow">
                <h2 className="font-semibold mb-3">Position</h2>
                <RefinementList 
                    attribute="attributes.position"
                    limit={8}
                    showMore={true}
                    classNames={{
                        root: 'space-y-2',
                        item: 'flex items-center',
                        checkbox: 'mr-2',
                        label: 'cursor-pointer hover:text-blue-600 text-sm',
                        count: 'ml-auto text-gray-500 text-xs'
                    }}
                />
            </section> */}

        </div>
    );
}