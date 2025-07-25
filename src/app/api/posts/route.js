export async function GET(request) {
    return new Response(JSON.stringify({ message: "API route working." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
} 