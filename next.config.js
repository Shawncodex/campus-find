/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyD0q8CaGiKIuq6vcqQEz_AmslMpf1cdUuY",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "campus-find-6f6fa.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "campus-find-6f6fa",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1025465176972",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:1025465176972:web:b8e68cb252daa4641dfca9",
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "ds89f1cln",
  },
}

module.exports = nextConfig
