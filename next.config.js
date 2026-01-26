// next.config.js - ПРАВИЛЬНО
/** @type {import('next').NextConfig} */
const nextConfig = {
  // БЕЗ output: 'export'!
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
