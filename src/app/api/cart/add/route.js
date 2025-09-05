import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();

        // console.log('Adding to cart:', body);

        // Validate product ID
        const productId = parseInt(body.id);
        if (!productId || isNaN(productId)) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Invalid product ID. Please select a valid product variation.',
                    code: 'invalid_product_id'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // Prepare the cart item data
        const cartItem = {
            id: productId,
            quantity: parseInt(body.quantity || 1)
        };

        // If variation attributes are provided, format them as an array for WooCommerce
        if (body.variation_attributes && Object.keys(body.variation_attributes).length > 0) {
            cartItem.variation = Object.entries(body.variation_attributes)
                .filter(([key, value]) => value && value.trim() !== '') // Only include non-empty values
                .map(([attribute, value]) => ({
                    attribute: attribute,
                    value: value
                }));

            // Only add variation array if there are actual attributes to send
            if (cartItem.variation.length === 0) {
                delete cartItem.variation;
            }
        }

        // console.log('Cart item data:', cartItem);

        // Debug: Log what we're sending to WooCommerce
        // console.log('🚀 Sending to WooCommerce:', {
        //     endpoint: 'https://react.woth.gr/wp-json/wc/store/cart/add-item',
        //     payload: cartItem
        // });

        // Direct call to WooCommerce Store API
        const res = await fetch('https://react.woth.gr/wp-json/wc/store/cart/add-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'NextJS Cart API'
            },
            body: JSON.stringify(cartItem),
        });

        const data = await res.json();
        // console.log('WooCommerce response:', data);

        // Forward the response as-is, including any cookies WooCommerce sets
        const response = new NextResponse(JSON.stringify(data), {
            status: res.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Forward any Set-Cookie headers from WooCommerce
        const setCookieHeader = res.headers.get('set-cookie');
        if (setCookieHeader) {
            response.headers.set('Set-Cookie', setCookieHeader);
        }

        return response;
    } catch (error) {
        console.error('Add to cart error:', error);
        return new NextResponse(
            JSON.stringify({
                error: error.message,
                code: 'add_to_cart_failed'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}
