import React from 'react';

const CheckIcon = ({ className = "w-4 h-4", fill = "none", stroke = "currentColor", strokeWidth = 2 }) => {
    return (
        <svg className={className} fill={fill} stroke={stroke} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M5 13l4 4L19 7" />
        </svg>
    );
};

export default CheckIcon; 