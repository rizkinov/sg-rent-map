import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Providers } from './providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PropertyProvider } from '@/providers/PropertyProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Singapore Rental Dashboard',
  description: 'Interactive dashboard for Singapore rental properties',
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
          <PropertyProvider>
            <Providers>{children}</Providers>
          </PropertyProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
} 