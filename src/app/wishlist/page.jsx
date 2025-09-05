"use client";
import { useSelector } from 'react-redux';
import { ProductCard } from '@/components/product-category/ProductGridWithColorFilter';

export default function WishlistPage() {
    const wishlist = useSelector(state => state.wishlist.items);

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 mt-[200px]">
            <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
            {wishlist.length === 0 ? (
                <p>Your wishlist is empty.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map(product => (
                        <ProductCard key={product.id} product={product} isWishlisted={true} />
                    ))}
                </div>
            )}
        </div>
    );
} 