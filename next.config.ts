import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    distDir: 'out',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    basePath: '',
    assetPrefix: '',
};

export default nextConfig;
