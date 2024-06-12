/** @type {import('next').NextConfig} */
const SUPABASE_DOMAIN = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/^https?:\/\//, '')
  : null;

const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      ...(SUPABASE_DOMAIN ? [SUPABASE_DOMAIN] : [])
    ],
  },
};

export default nextConfig;