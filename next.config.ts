/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  turbo: {
    '**/{app/blog}/**': ['ignore'],
  },
}

module.exports = nextConfig