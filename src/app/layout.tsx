
import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/app-provider';
import { ptSans, spaceGrotesk } from '@/app/fonts';
import { cn } from '@/lib/utils';
import NextTopLoader from 'nextjs-toploader';
import { ThemeProvider } from '@/components/theme-provider';
import ClientLayout from '@/components/client-layout';

const iconUrl = 'https://res.cloudinary.com/drewes4b7/image/upload/v1754783345/Untitled_design_hzm7wn.png';

export const metadata: Metadata = {
  title: "Aharian - Authentic Flavors Delivered",
  description: 'Discover authentic flavors from local chefs, delivered fresh to your door. Experience culinary excellence with our curated selection of dishes.',
  keywords: 'food delivery, authentic cuisine, local chefs, fresh meals, culinary experience',
  authors: [{ name: "Aharian Team" }],
  creator: "Aharian",
  publisher: "Chefs' BD",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: iconUrl, sizes: '32x32', type: 'image/png' },
      { url: iconUrl, sizes: '48x48', type: 'image/png' },
      { url: iconUrl, sizes: '128x128', type: 'image/png' },
      { url: iconUrl, sizes: '192x192', type: 'image/png' },
      { url: iconUrl, sizes: '256x256', type: 'image/png' },
      { url: iconUrl, sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: iconUrl, sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [
      { url: iconUrl, type: 'image/png' },
    ]
  },
  manifest: '/site.webmanifest',
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ff6b9d' },
    { media: '(prefers-color-scheme: dark)', color: '#ff6b9d' },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          'font-body antialiased',
          ptSans.variable,
          spaceGrotesk.variable
        )}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          <AppProvider>
            <NextTopLoader
              color="hsl(var(--primary))"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
            />
            <ClientLayout>{children}</ClientLayout>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
