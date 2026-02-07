import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RegisterSW } from './register-sw';

export const metadata: Metadata = {
  title: 'Kettlebell Workout',
  description: 'Kettlebell circuit workout recommender',
  manifest: '/gym_app/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kettlebell',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#111111',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/gym_app/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/gym_app/icon.svg" />
      </head>
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
