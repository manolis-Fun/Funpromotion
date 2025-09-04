// common/SearchModal.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";

const SearchModal = React.memo(function SearchModal({ query, onClose }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query?.trim()) {
            setResults([]);
            setError(null);
            return;
        }

        const searchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&size=10`);
                
                if (!response.ok) {
                    throw new Error('Search failed');
                }
                
                const data = await response.json();
                setResults(data.hits || []);
                setError(null);
            } catch (err) {
                console.error("Search error:", err);
                setError("Failed to search products. Please try again.");
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        // Debounce the search
        const timeoutId = setTimeout(searchProducts, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    if (!query?.trim()) return null;

    const highlightMatch = (text, searchTerm) => {
        if (!text || !searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, "gi");
        const parts = text.split(regex);
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
    };

    return (
        <div className="absolute top-full mt-2 w-full max-w-[97%] bg-white rounded-lg shadow-xl z-50 overflow-hidden">
            {loading ? (
                <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                </div>
            ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
            ) : results.length > 0 ? (
                <div>
                    <div className="p-3">
                        <p className="text-sm text-gray-500">
                            Found {results.length} product{results.length !== 1 ? "s" : ""} matching "{query.trim()}"
                        </p>
                    </div>
                    <ul className="max-h-[calc(100vh-320px)] mb-20 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                        {results.map((product, index) => {
                            const displayPrice = product?.discount_price || product?.price || null;
                            const hasDiscount = product?.has_discount;
                            
                            return (
                                <Link key={product?.id || index} href={`/product/${product?.slug}`} onClick={onClose}>
                                    <div className="group cursor-pointer bg-[#F9F9F9] rounded-xl border border-gray-200 p-4 flex flex-col text-center hover:shadow transition">
                                        <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-white">
                                            {product?.images?.[0]?.sourceUrl || product?.images?.[0] ? (
                                                <img
                                                    src={product?.images[0]?.sourceUrl || product?.images[0]}
                                                    alt={product?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-white rounded"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left ml-4">
                                            <h3 className="text-gray-900 font-semibold leading-[26px] text-lg mb-2 manrope-font">
                                                {highlightMatch(
                                                    product?.name?.length > 30 
                                                        ? product?.name.slice(0, 30) + "..." 
                                                        : product?.name,
                                                    query
                                                )}
                                            </h3>
                                            {displayPrice && (
                                                <div className="flex items-center gap-2">
                                                    {hasDiscount && product?.price && (
                                                        <span className="text-gray-400 line-through text-sm">
                                                            €{product.price.toFixed(2)}
                                                        </span>
                                                    )}
                                                    <span className="text-[#FF7700] text-sm font-semibold">
                                                        €{displayPrice.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center mb-2 font-bold text-gray-500 leading-[18px] text-[13px] manrope-font">
                                                <div className={`w-3 h-3 ${product?.stock_total > 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2`}></div>
                                                {product?.stock_total > 0 ? `In stock: (${product.stock_total})` : 'Out of stock'}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </ul>
                </div>
            ) : (
                <div className="p-8 text-center">
                    <FiSearch className="w-6 h-6 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No products found matching "{query.trim()}"</p>
                    <p className="text-sm text-gray-400 mt-1">Try different keywords or check spelling</p>
                </div>
            )}
        </div>
    );
});

export default SearchModal;