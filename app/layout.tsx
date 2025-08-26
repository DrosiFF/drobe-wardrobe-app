import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Sidebar from '@/components/Sidebar'
import ToastContainer from '@/components/ui/toast'
import ThemeProvider from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Drobe - Your Digital Wardrobe',
  description: 'Organize, discover, and style your wardrobe with AI-powered insights.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if Clerk keys are configured (exclude placeholder keys)
  const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_YOUR_KEY_HERE' &&
                      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_clerk_placeholder_key'

  const AppContent = () => (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider />
        <div className="min-h-screen bg-background text-foreground">
          <Sidebar />
          <main className="ml-72 min-h-screen">
            {children}
          </main>
          <ToastContainer />
        </div>
      </body>
    </html>
  )

  if (hasClerkKeys) {
    return (
      <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        <AppContent />
      </ClerkProvider>
    )
  }

  // Guest mode without Clerk (prevents useSession/useUser errors)
  return <AppContent />
}
