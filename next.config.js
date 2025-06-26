/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['rc-util', 'rc-pagination', 'rc-picker', 'rc-tree', 'rc-table'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Handle ES modules
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    
    return config;
  },
};

module.exports = nextConfig;