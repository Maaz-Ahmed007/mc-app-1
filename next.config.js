const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, '.');
    return config;
  },
};

module.exports = nextConfig;