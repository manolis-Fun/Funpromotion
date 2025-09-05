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
    setPriceFilteredResults: () => {},
    priceRange: null,
    setPriceRange: () => {},
    isFiltering: false,
    setIsFiltering: () => {}
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
    const refine = refinementList?.refine || (() => {});
    
    
    // Use SearchKit items for colors
    const colorsToShow = items;


    if (colorsToShow.length === 0) {
        return null;
    }

    return (
        <section>
            <h2 className="text-base font-medium mb-4">Color</h2>
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
        const currentIndexState = uiState['woocommerce_products_2025-08-28_23-38'] || {};
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
                indexName: 'woocommerce_products_2025-08-28_23-38',
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
            
            
            const response = await fetch('/api/search-kit/_msearch', {
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
            <h2 className="text-base font-medium mb-4 uppercase">Categories</h2>
            <ul className="grid gap-1">
                {categoriesToShow.map(c => {
                    // Check if this category is currently refined (for SearchKit items)
                    const isRefined = items.some(item => item.label === c.name && item.isRefined);
                    
                    return (
                        <li key={c.name || c.slug} className="flex justify-between items-center">
                            <Link 
                                href={`/product-category/${c.slug}`}
                                className={`text-left hover:text-blue-600 transition-colors block flex-1 ${
                                    isRefined ? 'text-blue-600 font-semibold' : ''
                                }`}
                            >
                                {c.name}
                            </Link>
                            <span className="text-gray-500 text-sm ml-2">({c.count})</span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

export default function SearchKitSidebar() {
    return (
        <div className="w-full space-y-8">
            {/* SearchKit-enabled Categories using facets */}
            <SearchKitCategories />

            {/* Price Range Filter - Second after categories */}
            <PriceRangeFilter />

            {/* Color Filter using facets */}
            <ColorFilter />

            {/* Material Filter */}
            <section className="bg-white p-4 rounded-lg shadow">
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
            </section>

            {/* Technique/Printing Filter */}
            <section className="bg-white p-4 rounded-lg shadow">
                <h2 className="font-semibold mb-3">Printing Technique</h2>
                <RefinementList 
                    attribute="attributes.technique"
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
            </section>

            {/* Position Filter */}
            <section className="bg-white p-4 rounded-lg shadow">
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
            </section>

        </div>
    );
}