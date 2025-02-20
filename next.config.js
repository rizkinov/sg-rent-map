/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cnqdthislyimyffgewif.supabase.co']
  },
  typescript: {
    ignoreBuildErrors: false
  }
}

module.exports = nextConfig 