
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: (() => {
    const patterns: { protocol: string; hostname: string; port: string; pathname: string }[] = [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'logo.clearbit.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'avatar.vercel.sh', port: '', pathname: '/**' },
    ];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    try {
      if (supabaseUrl) {
        const host = new URL(supabaseUrl).hostname;
        // Allow public bucket images like /storage/v1/object/public/store-images/**
        // Note: If using the new storage hostname, this host will be adjusted at runtime by the SDK.
        patterns.push({
          protocol: 'https',
          hostname: host,
          port: '',
          pathname: '/**',
        });
      }
    } catch {
      // ignore invalid URL
    }

    return { remotePatterns: patterns as any };
  })(),
};

export default nextConfig;
