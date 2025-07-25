// Simplified Cart utility functions for WooCommerce integration

// Add item to cart
export async function addToCart(productId, quantity = 1, variationAttributes = null) {
    try {
        if (!productId) {
            throw new Error('Product ID is required');
        }

        const body = {
            id: parseInt(productId),
            quantity: parseInt(quantity),
        };

        // Add variation attributes if provided (for variable products)
        if (variationAttributes && Object.keys(variationAttributes).length > 0) {
            body.variation_attributes = variationAttributes;
        }

        console.log('Adding to cart:', body);

        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to add item to cart (${response.status})`);
        }

        const data = await response.json();
        console.log('Cart response:', data);

        return data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
}

// export async function removeFromCart(key) {
//     const res = await fetch('/api/cart/remove', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ key }),
//     });
//     return await res.json();
// }

// export async function updateCartItem(key, quantity) {
//     const res = await fetch('/api/cart/update', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ key, quantity }),
//     });
//     return await res.json();
// }

// export async function clearCart() {
//     const res = await fetch('/api/cart/clear', { method: 'POST' });
//     return await res.json();
// }
