import React from 'react';

const SearchIcon = ({ className = "h-16 w-16", fill = "none", stroke = "currentColor", strokeWidth = 3 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill={fill}
            viewBox="0 0 64 64"
            stroke={stroke}
            strokeWidth={strokeWidth}
        >
            <circle cx={28} cy={28} r={20} />
            <path d="M42 42l14 14" />
        </svg>
    );
};

export default SearchIcon; 