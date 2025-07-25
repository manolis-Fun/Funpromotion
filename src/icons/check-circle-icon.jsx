import React from 'react';

const CheckCircleIcon = ({ className = "w-4 h-4", fill = "none", stroke = "currentColor", strokeWidth = 2 }) => {
    return (
        <svg className={className} fill={fill} stroke={stroke} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
};

export default CheckCircleIcon; 