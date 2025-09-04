/** @type {import('next').NextConfig} */
const nextConfig = {
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
        // Enable static generation features
        typedRoutes: true,
        scrollRestoration: true
    },

    images: {
        domains: ['react.woth.gr'], // Add your image domains here
        unoptimized: true, // Required for static export
    },

    // Increase static generation timeout
    staticPageGenerationTimeout: 180,
};

export default nextConfig;
