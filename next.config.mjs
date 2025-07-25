/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable fast refresh for better hot reloading
    fastRefresh: true,

    // Enable webpack 5 for better performance
    webpack: (config, { dev, isServer }) => {
        // Enable hot reloading in development
        if (dev && !isServer) {
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }
        return config;
    },

    // Enable experimental features for better development experience
    experimental: {
        // Enable React Fast Refresh
        reactRefresh: true,
        // Enable static generation features
        typedRoutes: true,
        scrollRestoration: true
    },

    images: {
        domains: ['react.woth.gr'], // Add your image domains here
        unoptimized: true, // Required for static export
    },

    // output: 'export', // Enable static HTML export (removed to allow dynamic/SSR/ISR)

    // Increase static generation timeout
    staticPageGenerationTimeout: 180,

    // Generate 404 page as static
    generateStaticParams: async () => {
        return {
            notFound: true,
        };
    },
};

export default nextConfig;
