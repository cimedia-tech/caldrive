import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Providers from '@/components/Providers'
import { Metadata } from 'next'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'CalDrive',
  description: 'Calendar × Documents × Agent Teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>
        <Providers>
          <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', paddingLeft: '64px' }}>
            <Sidebar />
            <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
