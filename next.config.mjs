/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    domains: [process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/^https?:\/\//, '')],
  }
};

export default nextConfig;
