/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      // Vercel Blob Storage
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
      // Amazon CDN
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: '**.media-amazon.com',
      },
      // Walmart CDN
      {
        protocol: 'https',
        hostname: 'i5.walmartimages.ca',
      },
      {
        protocol: 'https',
        hostname: '**.walmartimages.ca',
      },
      {
        protocol: 'https',
        hostname: '**.walmartimages.com',
      },
      // Best Buy CDN
      {
        protocol: 'https',
        hostname: 'multimedia.bbycastatic.ca',
      },
      {
        protocol: 'https',
        hostname: '**.bbycastatic.ca',
      },
      // Deal blog sources
      {
        protocol: 'https',
        hostname: 'www.savingsguru.ca',
      },
      {
        protocol: 'https',
        hostname: '**.savingsguru.ca',
      },
      {
        protocol: 'https',
        hostname: '**.smartcanucks.ca',
      },
      {
        protocol: 'https',
        hostname: '**.redflagdeals.com',
      },
      // Canadian Tire / Sport Chek
      {
        protocol: 'https',
        hostname: '**.canadiantire.ca',
      },
      {
        protocol: 'https',
        hostname: '**.sportchek.ca',
      },
      // Costco
      {
        protocol: 'https',
        hostname: '**.costco.ca',
      },
      // Shoppers Drug Mart
      {
        protocol: 'https',
        hostname: '**.shoppersdrugmart.ca',
      },
      // Home Depot
      {
        protocol: 'https',
        hostname: '**.homedepot.ca',
      },
      {
        protocol: 'https',
        hostname: '**.homedepot.com',
      },
      // WordPress/WP content
      {
        protocol: 'https',
        hostname: '**.wp.com',
      },
      // Cloudinary
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      // General wildcards for CDNs
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '**.akamaized.net',
      },
      // Placeholders and logos
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
