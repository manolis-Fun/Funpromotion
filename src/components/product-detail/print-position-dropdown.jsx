"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { formatAttributeValue, translateSizeLabel } from "@/utils/helpers";

export default function PrintPositionDropdown({
  positions,
  selectedPosition,
  onPositionChange,
  technique,
  variations,
  product
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPosition, setHoveredPosition] = useState(null);
  const [previewPos, setPreviewPos] = useState(null); // { top, left }
  const wrapperRef = useRef(null);

  // Close on outside click and ESC
  useEffect(() => {
    const onDoc = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setHoveredPosition(null);
        setPreviewPos(null);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setHoveredPosition(null);
        setPreviewPos(null);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Reposition preview on window resize or scroll while hovering
  useEffect(() => {
    if (!hoveredPosition || !previewPos) return;
    const handler = () => setPreviewPos((p) => ({ ...p }));
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [hoveredPosition, previewPos]);

  const handlePositionSelect = (position) => {
    onPositionChange(position);
    setIsOpen(false);
    setHoveredPosition(null);
    setPreviewPos(null);
  };

  const getSelectedDisplayName = () => {
    if (!selectedPosition) return "Select Position";
    return formatAttributeValue(selectedPosition).replace(/-/g, " ");
  };

  const varByKey = (pos) =>
    variations.find((v) => v.__attrs.position === pos && v.__attrs.technique === technique);

  return (
    <div className="space-y-3" ref={wrapperRef}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-600">Print Position :</h3>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((p) => !p);
            }}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            className="flex items-center space-x-2 bg-white shadow-lg py-[2px] px-2 rounded-md"
          >
            <span className="font-medium text-orange-500 uppercase">
              {getSelectedDisplayName()}
            </span>
            <div className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ChevronDownIcon
                className={`w-5 h-5 text-orange-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>
        </div>

        {/* Dropdown content - no absolute positioning, opens below */}
        {isOpen && (
          <div
            className={[
              "bg-white border border-gray-200 rounded-lg shadow-xl",
              "origin-top transform-gpu will-change-transform will-change-opacity",
              "w-fit max-w-2xl"
            ].join(" ")}
            role="listbox"
            style={{
              animation: isOpen ? "dd-in 200ms ease-out" : "dd-out 160ms ease-in"
            }}
          >
            <div
              className="max-h-[60vh] overflow-y-auto rounded-lg"
              onMouseLeave={() => {
                setHoveredPosition(null);
                setPreviewPos(null);
              }}
            >
              <div className="flex flex-wrap relative">
                {positions?.map((pos, idx) => {
                  const v = varByKey(pos);
                  const positionSize = v?.__attrs.size || "";
                  const positionImage = product.images?.[0] || "/placeholder.jpg";
                  const sizeDisplay = positionSize ? translateSizeLabel(positionSize) : "N/A";
                  const isSelected = selectedPosition === pos;

                  return (
                    <div key={pos} className="relative">
                      <button
                        onClick={() => handlePositionSelect(pos)}
                        onMouseEnter={(e) => {
                          setHoveredPosition(pos);
                          const rect = e.currentTarget.getBoundingClientRect();
                          setPreviewPos({
                            top: rect.top,
                            left: rect.left + rect.width / 2
                          });
                        }}
                        onMouseLeave={() => {
                          setHoveredPosition(null);
                          setPreviewPos(null);
                        }}
                        className={[
                          "p-3 px-6 w-full text-left",
                          "transition-colors duration-200",
                          isSelected ? "bg-[#eaeaea]" : "bg-white hover:bg-[#eaeaea]"
                        ].join(" ")}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="text-xs font-bold text-gray-800 uppercase mb-1">
                            {formatAttributeValue(pos)}
                          </div>
                          <div className="w-16 h-16 mb-2 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                            <img
                              src={positionImage}
                              alt={`${pos} position`}
                              className="w-full h-full object-cover"
                              draggable={false}
                            />
                          </div>
                          <div className="text-xs text-gray-600">{sizeDisplay}</div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed preview above hovered card. No sideways nonsense. */}
      {hoveredPosition && previewPos && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: previewPos.top,
            left: previewPos.left,
            transform: "translate(-50%, calc(-100% - 8px))",
            animation: "preview-in 120ms ease-out both"
          }}
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
              <img
                src={
                  (variations.find(
                    (v) => v.__attrs.position === hoveredPosition && v.__attrs.technique === technique
                  ) && product.images?.[0]) || "/placeholder.jpg"
                }
                alt={`${formatAttributeValue(hoveredPosition)} position preview`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            <div className="mt-2 text-center">
              <div className="text-sm font-medium text-gray-800">
                {formatAttributeValue(hoveredPosition)}
              </div>
            </div>
            <div className="absolute left-1/2 translate-x-[-50%] top-full">
              <div className="w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45" />
            </div>
          </div>
        </div>
      )}

      {/* local CSS animations */}
      <style jsx>{`
@keyframes dd-in {
  0% { opacity: 0; transform: translate3d(0, -8px, 0) scale(0.95); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes dd-out {
  0% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  100% { opacity: 0; transform: translate3d(0, -8px, 0) scale(0.95); }
}

@keyframes preview-in {
  from { opacity: 0; transform: translate(-50%, calc(-100% - 4px)); }
  to   { opacity: 1; transform: translate(-50%, calc(-100% - 8px)); }
}
      `}</style>
    </div>
  );
}
