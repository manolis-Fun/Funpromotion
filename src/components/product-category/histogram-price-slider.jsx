"use client"

import React, { useMemo, useCallback, useState, useEffect, useRef } from "react"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"

export default function HistogramPriceSlider({
  products = [],
  minValue,
  maxValue,
  onRangeChange,
  initialRange,
  currency = "€",
  bucketCount = 20,
  barHeight = 80,
  showLabels = true,
  showInputs = true
}) {
  // Validate and set initial range
  const validInitialRange = Array.isArray(initialRange) && 
                           initialRange.length === 2 && 
                           typeof initialRange[0] === 'number' && 
                           typeof initialRange[1] === 'number' &&
                           !isNaN(initialRange[0]) && !isNaN(initialRange[1]) &&
                           initialRange[0] < initialRange[1]
                           ? initialRange 
                           : [minValue || 0, maxValue || 1000];
                           
  const [localRange, setLocalRange] = useState(validInitialRange)
  const [inputMin, setInputMin] = useState(String(validInitialRange[0]))
  const [inputMax, setInputMax] = useState(String(validInitialRange[1]))
  const [isUserDragging, setIsUserDragging] = useState(false)
  const isUpdatingFromUser = useRef(false)

  useEffect(() => {
    // Don't update if user is currently dragging or if this is from a user-initiated change
    if (isUserDragging || isUpdatingFromUser.current) {
      return;
    }
    
    const validRange = Array.isArray(initialRange) && 
                      initialRange.length === 2 && 
                      typeof initialRange[0] === 'number' && 
                      typeof initialRange[1] === 'number' &&
                      !isNaN(initialRange[0]) && !isNaN(initialRange[1]) &&
                      initialRange[0] < initialRange[1];
                      
    if (validRange) {
      // Only update if the new range is actually different from current local range
      const [currentMin, currentMax] = localRange;
      const [newMin, newMax] = initialRange;
      
      if (currentMin !== newMin || currentMax !== newMax) {
        setLocalRange(initialRange)
        setInputMin(String(initialRange[0]))
        setInputMax(String(initialRange[1]))
      }
    }
  }, [initialRange, isUserDragging, localRange])

  const priceData = useMemo(() => {
    const prices = products
      .map(p => {
        const price = p?.singleProductFields?.priceMainSale || 
                     p?.singleProductFields?.priceMain || 
                     p?.price
        
        if (typeof price === 'string') {
          const numPrice = parseFloat(price.replace(/[^0-9.-]+/g, ''))
          return isNaN(numPrice) ? null : numPrice
        }
        return typeof price === 'number' ? price : null
      })
      .filter(p => p !== null && p >= 0)

    if (!prices.length) return { prices: [], min: minValue || 0, max: maxValue || 1000 }

    const min = minValue !== undefined ? minValue : Math.floor(Math.min(...prices))
    const max = maxValue !== undefined ? maxValue : Math.ceil(Math.max(...prices))
    
    return { prices, min, max }
  }, [products, minValue, maxValue])

  const histogram = useMemo(() => {
    const { prices, min, max } = priceData
    if (!prices.length || min === max) return Array(bucketCount).fill(0)

    const bucketSize = (max - min) / bucketCount
    const buckets = new Array(bucketCount).fill(0)

    prices.forEach(price => {
      const bucketIndex = Math.min(
        Math.floor((price - min) / bucketSize), 
        bucketCount - 1
      )
      if (bucketIndex >= 0) {
        buckets[bucketIndex]++
      }
    })

    return buckets
  }, [priceData, bucketCount])

  const maxFrequency = useMemo(() => Math.max(...histogram, 1), [histogram])

  const handleSliderChange = useCallback((value) => {
    setLocalRange(value)
    setInputMin(String(value[0]))
    setInputMax(String(value[1]))
    // Don't call onRangeChange during dragging - wait for onAfterChange
  }, [])
  
  const handleBeforeChange = useCallback(() => {
    setIsUserDragging(true)
  }, [])
  
  const handleChangeComplete = useCallback((value) => {
    setIsUserDragging(false)
    isUpdatingFromUser.current = true
    onRangeChange?.(value)
    // Reset the flag after a brief delay to allow parent re-renders
    setTimeout(() => {
      isUpdatingFromUser.current = false
    }, 100)
  }, [onRangeChange])

  const handleInputChange = useCallback((type, value) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    const newRange = [...localRange]
    if (type === 'min') {
      newRange[0] = Math.min(Math.max(numValue, priceData.min), newRange[1])
      setInputMin(String(newRange[0]))
    } else {
      newRange[1] = Math.max(Math.min(numValue, priceData.max), newRange[0])
      setInputMax(String(newRange[1]))
    }

    setLocalRange(newRange)
    isUpdatingFromUser.current = true
    onRangeChange?.(newRange)
    setTimeout(() => {
      isUpdatingFromUser.current = false
    }, 100)
  }, [localRange, priceData, onRangeChange])

  const handleInputBlur = useCallback((type) => {
    if (type === 'min') {
      setInputMin(String(localRange[0]))
    } else {
      setInputMax(String(localRange[1]))
    }
  }, [localRange])

  const formatPrice = useCallback((value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }, [])

  const sliderProps = useMemo(() => ({
    range: true,
    min: priceData.min,
    max: priceData.max,
    value: localRange,
    onChange: handleSliderChange,
    onBeforeChange: handleBeforeChange,
    onChangeComplete: handleChangeComplete,
    allowCross: false,
    trackStyle: [{ 
      backgroundColor: "#ff7700", 
      height: 6,
      borderRadius: 3
    }],
    handleStyle: [
      { 
        borderColor: "#ff7700", 
        backgroundColor: "#fff", 
        width: 20, 
        height: 20, 
        marginTop: -7,
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
      },
      { 
        borderColor: "#ff7700", 
        backgroundColor: "#fff", 
        width: 20, 
        height: 20, 
        marginTop: -7,
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
      },
    ],
    railStyle: { 
      backgroundColor: "#e5e7eb", 
      height: 6,
      borderRadius: 3
    },
  }), [priceData.min, priceData.max, localRange, handleSliderChange, handleBeforeChange, handleChangeComplete])

  return (
    <div className="w-full">
      {showInputs && (
        <div className="flex justify-between gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">Min</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {currency}
              </span>
              <input
                type="number"
                value={inputMin}
                onChange={(e) => setInputMin(e.target.value)}
                onBlur={() => handleInputBlur('min')}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleInputChange('min', inputMin)
                  }
                }}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                min={priceData.min}
                max={localRange[1]}
              />
            </div>
          </div>
          <div className="flex items-end pb-2">
            <span className="text-gray-400">—</span>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">Max</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {currency}
              </span>
              <input
                type="number"
                value={inputMax}
                onChange={(e) => setInputMax(e.target.value)}
                onBlur={() => handleInputBlur('max')}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleInputChange('max', inputMax)
                  }
                }}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                min={localRange[0]}
                max={priceData.max}
              />
            </div>
          </div>
        </div>
      )}

      <div className="relative mb-2">
        <div className="flex items-end justify-between gap-0.5" style={{ height: barHeight }}>
          {histogram.map((count, index) => {
            const height = maxFrequency > 0 ? (count / maxFrequency) * 100 : 0
            const bucketMin = priceData.min + (index * (priceData.max - priceData.min) / bucketCount)
            const bucketMax = priceData.min + ((index + 1) * (priceData.max - priceData.min) / bucketCount)
            const isActive = bucketMax > localRange[0] && bucketMin < localRange[1]
            
            return (
              <div
                key={index}
                className="flex-1 relative group"
                style={{ height: `${height}%`, minHeight: 2 }}
              >
                <div
                  className={`w-full h-full rounded-t transition-all duration-200 ${
                    isActive 
                      ? 'bg-orange-500 opacity-90' 
                      : 'bg-gray-300 opacity-60'
                  }`}
                />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {count} {count === 1 ? 'product' : 'products'}
                  <br />
                  {currency}{formatPrice(bucketMin)} - {currency}{formatPrice(bucketMax)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        <Slider {...sliderProps} />
      </div>

      {showLabels && (
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>{currency}{formatPrice(priceData.min)}</span>
          <span>{currency}{formatPrice(priceData.max)}</span>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        {products.filter(p => {
          const price = p?.singleProductFields?.priceMainSale || 
                       p?.singleProductFields?.priceMain || 
                       p?.price
          const numPrice = typeof price === 'string' 
            ? parseFloat(price.replace(/[^0-9.-]+/g, ''))
            : price
          return numPrice >= localRange[0] && numPrice <= localRange[1]
        }).length} products in selected range
      </div>
    </div>
  )
}