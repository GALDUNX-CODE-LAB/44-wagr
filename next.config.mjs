/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.cryptologos.cc",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
