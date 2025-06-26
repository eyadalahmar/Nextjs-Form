/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['rc-util'],
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx']
    }
    return config
  }
}

export default nextConfig