"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

import Tick from "@/icons/tick";
import PrintingOption from "@/components/common/printing-options";
import PriceRange from "@/components/product-category/price-range";
import { productCategoryColors, productCategoryPrinting } from "@/utils/data";
import Link from "next/link";

// Move color mapping outside component to prevent recreation on every render
const COLOR_NAME_TO_VALUE = {
    "Beige": "#F5F5DC",
    "Black": "#000000",
    "Blue": "#0000FF",
    "Bronze": "#CD7F32",
    "Brown": "#A52A2A",
    "Burgundy": "#800020",
    "Dark blue": "#00008B",
    "Dark grey": "#A9A9A9",
    "Fuchsia": "#FF00FF",
    "Gold": "#FFD700",
    "Green": "#008000",
    "Grey": "#808080",
    "Multicolour": "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
    "N/A": "#FFFFFF",
    "Orange": "#FFA500",
    "Pink": "#FFC0CB",
    "Purple": "#800080",
    "Red": "#FF0000",
    "Silver": "#C0C0C0",
    "Transparent": "transparent",
    "Turquoise": "#40E0D0",
    "White": "#FFFFFF",
    "Yellow": "#FFFF00"
};

export default function Sidebar({ products = [], sidebarData }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const subcategories = sidebarData.productCategories?.nodes?.[0]?.children?.nodes || [];

    // Color & Printing
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedPrint, setSelectedPrint] = useState("");

    // Price & Offers
    const prices = useMemo(
        () => products.map(p => p.price).filter(p => typeof p === "number"),
        [products]
    );
    const [minPrice, maxPrice] = useMemo(() => {
        if (!prices.length) return [0, 1000];
        return [Math.min(...prices), Math.max(...prices)];
    }, [prices]);

    const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
    const [offersChecked, setOffersChecked] = useState(false);
    const offersCount = 13; // replace with dynamic count when available

    // Combine multiple useEffect hooks into one for better performance
    useEffect(() => {
        // Sync selected color with URL query params
        const colorFromUrl = searchParams.get('filter_color');
        if (colorFromUrl) {
            setSelectedColor(colorFromUrl);
        }

        // Sync price range when products change
        setPriceRange([minPrice, maxPrice]);

        // Sync offers filter
        const offersFromUrl = searchParams.get('filter_offers');
        if (offersFromUrl) {
            setOffersChecked(offersFromUrl === "1");
        }
    }, [searchParams, minPrice, maxPrice]);

    // Optimize query update function with useCallback
    const updateQuery = useCallback((key, val) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val) params.set(key, val);
        else params.delete(key);
        router.replace(`?${params.toString()}`);
    }, [searchParams, router]);

    // Update offers query when offers change
    useEffect(() => {
        updateQuery("filter_offers", offersChecked ? "1" : "");
    }, [offersChecked, updateQuery]);

    // Optimize color click handler with useCallback
    const handleColorClick = useCallback((c) => {
        if (selectedColor === c.name) {
            // If clicking the same color, remove the filter
            setSelectedColor("");
            updateQuery("filter_color", "");
        } else {
            // If clicking a different color, set the new filter
            setSelectedColor(c.name);
            updateQuery("filter_color", c.name);
        }
    }, [selectedColor, updateQuery]);

    // Optimize printing count calculation with useMemo
    const getPrintingCount = useMemo(() => {
        return (label) => {
            const countMatches = p => (p.allPaColor?.nodes?.length || 0);
            return products.filter(p => {
                const c = countMatches(p);
                if (label === "Full color") return c >= 5;
                if (label === "Lasers") return c === 0;
                const m = label.match(/(\d+)/);
                return m && c === +m[1];
            }).length;
        };
    }, [products]);

    return (
        <div className="w-full space-y-8">
            {/* Subcategories */}
            <section>
                <h2 className="text-base font-medium mb-4 uppercase">Categories</h2>
                <ul className="grid gap-1">
                    {subcategories.map(c => (
                        <li key={c.name}>
                            <Link href={`/product-category/${c.slug}`}>
                                {c.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Color Filter */}
            <section>
                <h2 className="text-base font-medium mb-4">Color</h2>
                <ul className="grid grid-cols-6 gap-3">
                    {sidebarData?.allPaColor?.nodes?.map(c => {
                        const colorValue = COLOR_NAME_TO_VALUE[c.name] || "#FFFFFF";
                        return (
                            <li key={c.name}>
                                <button
                                    onClick={() => handleColorClick(c)}
                                    title={c.name}
                                    className={clsx(
                                        "w-10 h-10 rounded-lg border flex items-center justify-center shadow transition",
                                        selectedColor === c.name
                                            ? "border-orange-500"
                                            : "border-gray-200"
                                    )}
                                    style={{ background: colorValue }}
                                >
                                    {selectedColor === c.name && <Tick />}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </section>

            {/* Printing Filter */}
            <section>
                <h2 className="text-base font-medium mb-4">Printing</h2>
                <div className="space-y-2">
                    {productCategoryPrinting.map(opt => (
                        <PrintingOption
                            key={opt.label}
                            label={opt.label}
                            count={getPrintingCount(opt.label)}
                            colors={opt.colors}
                            isSelected={selectedPrint === opt.label}
                            onClick={() => setSelectedPrint(opt.label)}
                        />
                    ))}
                </div>
            </section>

            {/* Price & Offers */}
            <PriceRange
                products={products}
                offersCount={offersCount}
                range={priceRange}
                onRangeChange={setPriceRange}
                offers={offersChecked}
                onOffersChange={setOffersChecked}
            />
        </div>
    );
}
