/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: "buffer/",
      crypto: false,
      stream: false,
      path: false,
      fs: false,
    };
    return config;
  },
  // Mirrors webpack resolve.fallback for `buffer` when running `next dev --turbopack`.
  // See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbo
  turbopack: {
    resolveAlias: {
      buffer: "buffer",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.cryptologos.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dev-nancy-public-files.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
