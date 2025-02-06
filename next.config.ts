import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
    async headers() {
        return [
            {
                source: '/queue/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
                ],
            },
        ];
    },
    // Disable Fast Refresh
    reactStrictMode: false,
    onDemandEntries: {
        // Make sure entries are not getting disposed.
        maxInactiveAge: 25 * 1000 * 1000,
        pagesBufferLength: 2,
    },
};

export default nextConfig;