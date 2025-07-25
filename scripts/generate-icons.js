const fs = require('fs');
const path = require('path');

const icons = [
    // Technology
    'usb', 'powerbank', 'charger', 'wireless', 'hub', 'mobile', 'speaker',
    'computer', 'watch', 'headphone', 'handsfree', 'smartwatch',

    // Clothing
    'tshirt', 'polo', 'hoodie', 'jacket', 'cap', 'workwear', 'sports', 'accessories',

    // Bags
    'backpack', 'laptopbag', 'shoppingbag', 'travelbag', 'sportsbag', 'beachbag',

    // Drinkware
    'bottle', 'thermalmug', 'coffeecup', 'travelmug', 'sportsbottle', 'glassbottle',

    // Stationery
    'pen', 'notebook', 'deskset', 'calendar', 'officesupplies',

    // Office
    'desk', 'electronics', 'lighting', 'storage',

    // Kitchen & Home
    'kitchen', 'decor', 'storage', 'appliance',

    // Difference
    'eco', 'innovative', 'custom',

    // Events
    'event', 'decoration', 'gift', 'supplies'
];

const iconTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  <text x="12" y="16" text-anchor="middle" font-size="8" stroke="none" fill="currentColor">ICON</text>
</svg>`;

const iconsDir = path.join(process.cwd(), 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
icons.forEach(icon => {
    const iconPath = path.join(iconsDir, `${icon}.svg`);
    const iconContent = iconTemplate.replace('ICON', icon.toUpperCase());
    fs.writeFileSync(iconPath, iconContent);
});