import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import AppShell from '@/components/layout/AppShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aquadex.app'),
  title: {
    default: 'AquaDex - The Fishkeepers Toolkit',
    template: '%s | AquaDex',
  },
  description: 'Comprehensive aquarium management toolkit for fishkeepers. Track water tests, manage aquariums, find compatible fish, discover products with AI-powered tools, and connect with the aquarium community.',
  keywords: ['aquarium', 'fishkeeping', 'water testing', 'fish finder', 'aquarium management', 'planted tank', 'reef tank', 'aquarium community'],
  authors: [{ name: 'AquaDex Team' }],
  creator: 'AquaDex',
  publisher: 'AquaDex',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aquadex.app',
    title: 'AquaDex - The Fishkeepers Toolkit',
    description: 'Smart aquarium management with AI-powered tools for water testing, fish compatibility, and more.',
    siteName: 'AquaDex',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AquaDex - The Fishkeepers Toolkit',
    description: 'Smart aquarium management with AI-powered tools',
    creator: '@aquadex',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
