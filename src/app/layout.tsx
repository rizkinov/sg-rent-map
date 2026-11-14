import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Providers } from './providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { verifyEnvironment } from '@/lib/verify-env'

const inter = Inter({ subsets: ['latin'] })

// Verify environment variables during build
verifyEnvironment()

export const metadata: Metadata = {
  title: 'Singapore Rental Dashboard',
  description: 'Interactive dashboard for Singapore rental properties',
}

// viewport-fit=cover lets the map run under the notch and home indicator on
// phones; the phone layout pads for them with env(safe-area-inset-*).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
} 