import React from 'react'

const PrintingOptionIcons = ({colors}) => {
    if (colors.includes("gradient")) {
        return (
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
        );
    }
    if (colors.length === 1) {
        return <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colors[0] }}></div>;
    }
    return (
        <div className="w-6 h-6 rounded-full relative overflow-hidden">
            {colors.map((color, index) => (
                <div
                    key={index}
                    className="absolute inset-0"
                    style={{
                        backgroundColor: color,
                        clipPath: `polygon(${(index * 100) / colors.length}% 0%, ${((index + 1) * 100) / colors.length}% 0%, ${((index + 1) * 100) / colors.length}% 100%, ${(index * 100) / colors.length}% 100%)`,
                    }}
                />
            ))}
        </div>
    );
}

export default PrintingOptionIcons
