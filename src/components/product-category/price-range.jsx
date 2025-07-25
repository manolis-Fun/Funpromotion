"use client"

import React, { useMemo, useCallback } from "react"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"

export default function PriceRangeFilter({
  products = [],
  offersCount = 0,
  range,
  onRangeChange,
  offers,
  onOffersChange,
}) {

  // Optimize price calculation with better memoization
  const priceData = useMemo(() => {
    const prices = products.map(p => p.price).filter(p => typeof p === "number");
    if (!prices.length) return { prices: [], minPrice: 0, maxPrice: 1000 };

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return { prices, minPrice, maxPrice };
  }, [products]);

  const { prices, minPrice, maxPrice } = priceData;

  // Reduce bucket count from 20 to 10 for better performance
  const buckets = useMemo(() => {
    const count = 10; // Reduced from 20
    const size = (maxPrice - minPrice) / count || 1;

    // Use a more efficient bucketing approach
    const bucketCounts = new Array(count).fill(0);

    prices.forEach(price => {
      const bucketIndex = Math.min(Math.floor((price - minPrice) / size), count - 1);
      bucketCounts[bucketIndex]++;
    });

    return bucketCounts;
  }, [prices, minPrice, maxPrice]);

  // Throttle the slider change to improve performance
  const handleSliderChange = useCallback((value) => {
    // Add a small delay to avoid too many updates
    setTimeout(() => onRangeChange(value), 10);
  }, [onRangeChange]);

  const sliderProps = useMemo(() => ({
    range: true,
    min: minPrice,
    max: maxPrice,
    value: range,
    onChange: handleSliderChange,
    allowCross: false,
    trackStyle: [{ backgroundColor: "#ff9800", height: 8 }],
    handleStyle: [
      { borderColor: "#ff9800", backgroundColor: "#fff", width: 22, height: 22, marginTop: -8 },
      { borderColor: "#ff9800", backgroundColor: "#fff", width: 22, height: 22, marginTop: -8 },
    ],
    railStyle: { backgroundColor: "#e0e0e0", height: 8 },
  }), [minPrice, maxPrice, range, handleSliderChange]);

  // Optimize preset ranges
  const presetRanges = useMemo(() => [
    [`Up to ${Math.min(150, maxPrice)} €`, [minPrice, Math.min(150, maxPrice)]],
    [`${Math.min(150, maxPrice)} - ${Math.min(350, maxPrice)} €`, [Math.min(150, maxPrice), Math.min(350, maxPrice)]],
    [`${Math.min(350, maxPrice)} - ${Math.min(850, maxPrice)} €`, [Math.min(350, maxPrice), Math.min(850, maxPrice)]],
    [`${Math.min(850, maxPrice)} € and above`, [Math.min(850, maxPrice), maxPrice]],
  ], [minPrice, maxPrice]);

  return (
    <section>
      <h2 className="text-base font-medium mb-4 uppercase">Price Range</h2>

      <div className="flex justify-between mb-2">
        <span className="px-4 py-1 border rounded-full">{range[0]} €</span>
        <span className="px-4 py-1 border rounded-full">{range[1]} €</span>
      </div>

      <div className="flex justify-between px-2 gap-0.5 h-16 mb-4">
        {buckets.map((cnt, i) => {
          const maxCount = Math.max(...buckets, 1);
          const height = Math.max(100, (cnt / maxCount) * 50); // Reduced max height

          const bucketMin = minPrice + i * ((maxPrice - minPrice) / buckets.length);
          const bucketMax = minPrice + (i + 1) * ((maxPrice - minPrice) / buckets.length);
          const isActive = bucketMax > range[0] && bucketMin < range[1];
          return (
            <div
              key={i}
              style={{ width: 16, height }}
              className={`rounded-t-sm ${isActive ? 'bg-orange-400' : 'bg-gray-200'}`}
            />
          );
        })}
      </div>

      <div className="mt-[30px]">
        <Slider {...sliderProps} />
      </div>

      <div className="mt-4 space-y-2">
        {presetRanges.map(([label, r]) => (
          <label key={label} className="flex items-center cursor-pointer">
            <input
              type="radio"
              className="accent-orange-500 mr-2"
              checked={range[0] === r[0] && range[1] === r[1]}
              onChange={() => onRangeChange(r)}
            />
            {label}
          </label>
        ))}

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="accent-orange-500 mr-2"
            checked={offers}
            onChange={e => onOffersChange(e.target.checked)}
          />
          Offers <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded">{offersCount}</span>
        </label>
      </div>
    </section>
  )
}
