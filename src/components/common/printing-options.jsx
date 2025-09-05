"use client";
import React from "react";
import clsx from "clsx";
import Tick from "@/icons/tick";

const PrintingOption = ({ label, count, colors = [], isSelected, onClick }) => {
  const renderIcon = () => {
    if (colors.includes("gradient")) {
      return (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 via-yellow-400 to-blue-500 shadow-sm" />
      );
    }

    const total = colors.length;

    if (total === 1) {
      return (
        <div className="w-full h-full mx-auto rounded-full border border-white" style={{ backgroundColor: colors[0] }} />
      );
    }
    if (total === 2) {
      return (
        <div className="relative w-full h-full">
          <div
            className="absolute left-[2px] top-0 w-[60%] h-full rotate-[180deg] bg-[#7627b9] rounded-l-full border border-white z-10"
            style={{ backgroundColor: colors[0] }}
          />
          <div
            className="absolute right-[2px] top-0 w-[60%] rotate-[180deg] h-full bg-[#1cb4cf] rounded-r-full border border-white z-20"
            style={{ backgroundColor: colors[1] }}
          />
        </div>
      );
    }

    if (total === 3) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div
            className="absolute top-[0px] left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full border border-white z-10"
            style={{ backgroundColor: colors[0] }}
          />
          <div
            className="absolute bottom-0 left-0 w-5 h-5 rounded-full border border-white z-0"
            style={{ backgroundColor: colors[1] }}
          />
          <div
            className="absolute bottom-0 right-0 w-5 h-5 rounded-full border border-white z-0"
            style={{ backgroundColor: colors[2] }}
          />
        </div>
      );
    }



    if (total === 4) {
      return (
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 ">
          {colors.map((color, i) => (
            <div
              key={i}
              className="w-full h-full border rounded-full border-white"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center justify-between px-2 py-2 transition-all group",
        isSelected ? "font-medium text-black" : "text-gray-700"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-md bg-white shadow border border-gray-200 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            {renderIcon()}
          </div>
          <div
            className={clsx(
              "absolute inset-0 bg-black bg-opacity-30 rounded-[8px] flex items-center justify-center transition-opacity",
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
            )}
          >
            <Tick className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <span className="text-sm">{label}</span>
      </div>

      <span
        className={clsx(
          "rounded-full px-3 py-0.5 text-sm font-semibold",
          isSelected ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-800"
        )}
      >
        {count}
      </span>
    </button>
  );
};

export default PrintingOption;