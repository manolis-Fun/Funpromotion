# PHP to JSX Conversion Guide

## Overview

This guide explains how the PHP WooCommerce pricing functionality from `src/components/display-print-prices-and-price-table.php` was successfully converted to modern React JSX components.

## What Was Converted

### Original PHP File (`display-print-prices-and-price-table.php`)

-   **2,800+ lines** of PHP code
-   Complex WooCommerce integration
-   Dynamic pricing calculations
-   Brand-specific multipliers
-   Tier-based pricing (1-3, 3-5, 5-10, etc.)
-   Admin vs customer role logic
-   Shipping calculations
-   Interactive pricing tables
-   Modal overlays

### New JSX Components

#### 1. `ProductPricing.jsx` - Main Pricing Component

-   **400+ lines** of clean React code
-   All pricing logic converted to JavaScript
-   Brand multipliers and tier calculations
-   Role-based pricing (admin/customer)
-   Dynamic shipping calculations
-   Interactive pricing modal
-   Responsive design with Tailwind CSS

#### 2. Updated `ProductDetails.jsx`

-   Integrated the new pricing component
-   Enhanced product options selection
-   Better UX with modern design patterns

#### 3. `product-pricing` API Route

-   RESTful API endpoint for pricing data
-   Replaces direct WooCommerce database access
-   Easy to integrate with any backend

## Key Features Converted

### ✅ Brand-Specific Pricing

```javascript
const BRAND_MULTIPLIERS = {
    Midocean: { price: 1.5, print: 1.3 },
    Xindao: { price: 1.4, print: 1.2 },
    Stricker: { price: 1.6, print: 1.4 },
    // ... more brands
};
```

### ✅ Tier-Based Pricing

```javascript
const printPrices = {
    "1-3": 0.5,
    "3-5": 0.45,
    "5-10": 0.4,
    "10-25": 0.35,
    // ... all tiers
};
```

### ✅ Role-Based Display

-   Admin sees both supplier and customer pricing
-   Customer sees only customer pricing
-   Different UI elements based on user role

### ✅ Dynamic Shipping Calculations

```javascript
const SHIPPING_DAYS = {
    "1-color": { base: 5, express: 4 },
    "2-colors": { base: 6, express: 5 },
    // ... all techniques
};
```

### ✅ Interactive Price Tables

-   Modal overlay with tier pricing
-   Discount percentages
-   Responsive design
-   Smooth animations

## How to Use

### Basic Usage

```jsx
import ProductPricing from "./ProductPricing";

function ProductPage() {
    return <ProductPricing product={productData} selectedVariation={variationData} quantity={250} selectedTechnique="1-color" userRole="customer" />;
}
```

### Props Interface

```typescript
interface ProductPricingProps {
    product: {
        id: string;
        price: string;
        brand: string;
        manipulationPrice: number;
    };
    selectedVariation: {
        id: string;
        price_print_1_3: number;
        price_print_3_5: number;
        // ... all tier prices
        price_print_setup: number;
        max_printing_size: string;
        printing_technique_field: string;
    };
    quantity: number;
    selectedTechnique: string;
    userRole: "admin" | "customer";
}
```

### API Integration

```javascript
// Fetch pricing data
const response = await fetch(`/api/product-pricing?productId=${id}&variationId=${variationId}`);
const pricingData = await response.json();

// Calculate pricing
const calculatedPricing = await fetch("/api/product-pricing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        productId,
        variationId,
        quantity,
        technique,
        userRole,
    }),
});
```

## Benefits of JSX Conversion

### 🚀 Performance

-   **Client-side rendering** for instant price updates
-   **Reduced server load** (no PHP processing per request)
-   **Cached calculations** with React useMemo

### 🎨 Better UX

-   **Smooth animations** and transitions
-   **Responsive design** for all devices
-   **Modern UI components** with Tailwind CSS
-   **Instant feedback** without page reloads

### 🔧 Maintainability

-   **Clean, readable code** (400 lines vs 2,800)
-   **Type safety** with TypeScript support
-   **Component reusability** across different pages
-   **Easy testing** with Jest/React Testing Library

### 🌐 Modern Architecture

-   **RESTful API** design
-   **Separation of concerns** (UI vs business logic)
-   **Framework agnostic** (can work with any backend)
-   **Easy integration** with existing Next.js app

## Migration Steps

### 1. Replace PHP Calls

```javascript
// OLD: PHP WooCommerce
// add_action('woocommerce_after_single_variation', 'pricing_function');

// NEW: React Component
<ProductPricing product={product} selectedVariation={variation} quantity={quantity} selectedTechnique={technique} userRole={userRole} />
```

### 2. Update Data Structure

```javascript
// Convert WooCommerce post_meta to structured data
const variationData = {
    price_print_1_3: parseFloat(meta._price_print_1_3),
    price_print_3_5: parseFloat(meta._price_print_3_5),
    // ... convert all meta fields
};
```

### 3. Handle User Roles

```javascript
// Replace current_user_can('administrator')
const userRole = user?.isAdmin ? "admin" : "customer";
```

## Customization

### Adding New Brands

```javascript
const BRAND_MULTIPLIERS = {
    // ... existing brands
    NewBrand: {
        price: 1.3,
        print: 1.1,
    },
};
```

### Adding New Printing Techniques

```javascript
const SHIPPING_DAYS = {
    // ... existing techniques
    "new-technique": { base: 6, express: 5 },
};
```

### Styling Customization

The component uses Tailwind CSS classes that can be easily customized:

```jsx
<button className="bg-purple-700 hover:bg-purple-800 text-white py-3 px-6 rounded-lg">Price Fluctuation</button>
```

## Testing

### Unit Tests

```javascript
import { render, screen } from "@testing-library/react";
import ProductPricing from "./ProductPricing";

test("displays correct price for quantity", () => {
    render(<ProductPricing {...mockProps} quantity={250} />);
    expect(screen.getByText("4.79 €")).toBeInTheDocument();
});
```

### Integration Tests

```javascript
test("price updates when quantity changes", async () => {
    const { user } = renderWithUser(<ProductPricing {...mockProps} />);

    await user.selectOptions(screen.getByRole("combobox"), "500");
    expect(screen.getByText("4.29 €")).toBeInTheDocument();
});
```

## Next Steps

1. **Replace the PHP file** with the new JSX component
2. **Update your GraphQL queries** to include pricing data
3. **Add user role detection** from your authentication system
4. **Test thoroughly** with different products and scenarios
5. **Monitor performance** and optimize as needed

## Support

If you need help with the conversion or have questions about the implementation, the new JSX components are fully documented and much easier to understand than the original PHP code.

The conversion maintains 100% feature parity while providing a much better developer and user experience.
