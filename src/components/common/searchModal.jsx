// common/SearchModal.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import { fetchAllProducts } from "@/lib/graphql";

export default function SearchModal({ query, onClose }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [allProducts, setAllProducts] = useState([]);

    // Fetch all products once when component mounts
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const products = await fetchAllProducts(100);
                setAllProducts(products);
            } catch (err) {
                console.error("Failed to load products:", err);
            }
        };
        loadProducts();
    }, []);

    useEffect(() => {
        if (!query?.trim() || !allProducts.length) {
            setResults([]);
            setError(null);
            return;
        }

        setLoading(true);
        try {
            const searchTerm = query.trim().toLowerCase();

            // Filter and sort products based on search query
            const filteredProducts = allProducts
                .filter((product) => {
                    const title = (product.title || "").toLowerCase();
                    return title.includes(searchTerm);
                })
                .map((product) => {
                    // Calculate relevance score
                    const title = (product.title || "").toLowerCase();
                    let score = 0;

                    // Exact match gets highest score
                    if (title === searchTerm) {
                        score = 100;
                    }
                    // Title starts with query gets high score
                    else if (title.startsWith(searchTerm)) {
                        score = 75;
                    }
                    // Word boundary match gets medium score
                    else if (title.includes(` ${searchTerm}`)) {
                        score = 50;
                    }
                    // Contains query gets lowest score
                    else {
                        score = 25;
                    }

                    return {
                        ...product,
                        score,
                    };
                })
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);

            setResults(filteredProducts);
            setError(null);
        } catch (err) {
            setError("Failed to search products. Please try again.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [query, allProducts]);

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
                        {results.slice(0, 5).map((product, index) => {
                            const short = product?.shortDescription?.replace(/\n$/, "");
                            // Get the proper price from singleProductFields if available
                            const displayPrice = product?.singleProductFields?.priceMainSale ||
                                product?.singleProductFields?.priceMain ||
                                product?.price ||
                                null;

                            return (
                                <Link key={index} href={`/product/${product?.slug}`} onClick={onClose}>
                                    <div className=" group cursor-pointer bg-[#F9F9F9] rounded-xl border border-gray-200 p-4 flex flex-col text-center hover:shadow transition">
                                        <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-white">
                                            {product?.image?.sourceUrl ? (
                                                <img
                                                    src={product?.image?.sourceUrl}
                                                    alt={product?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-white rounded"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left ml-4">
                                            <h3 className="text-gray-900 font-semibold leading-[26px] text-lg mb-2 manrope-font">
                                                {product?.title?.length > 20 ? product?.title.slice(0, 20) + "..." : product?.title || product?.name?.slice(0, 20) + "..."}
                                            </h3>
                                            {displayPrice && <span className="text-[#FF7700] text-sm py-2 text-start font-semibold h-9">{displayPrice}</span>}
                                            <div className="flex items-center mb-2 font-bold text-gray-500 leading-[18px] text-[13px] manrope-font">
                                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 manrope-font"></div>
                                                In stock: ({product?.stockQuantity ?? 0})
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
}
