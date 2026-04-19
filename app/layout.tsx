import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/providers/QueryProvider'
import ServiceWorkerRegistration from '@/components/providers/ServiceWorkerRegistration'
import { Toaster } from 'react-hot-toast'


const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: 'PriceTrac',
  description: 'Track prices. Buy at the right time.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <ServiceWorkerRegistration />
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}