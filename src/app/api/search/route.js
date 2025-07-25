import { fetchAllProducts } from '@/lib/graphql';

// This is needed for static export
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function GET(request) {
    // For static builds, we'll return an empty array
    // The actual search will happen client-side
    return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    });
} 