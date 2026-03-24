/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/webp"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client"],
  },
};

module.exports = nextConfig;
